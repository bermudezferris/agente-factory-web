import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

import type {
  ConversationRepository,
  ConversationContext,
  ConversationStatus,
  ConversationSummary,
  IngestResult,
  OutboundClaim,
} from "@/repositories/conversation-repository";
import type { InboundTextMessage } from "@/types/whatsapp";

type RpcRow = {
  organization_id: string;
  whatsapp_channel_id: string;
  contact_id: string;
  conversation_id: string;
  message_id: string;
  contact_created: boolean;
  conversation_created: boolean;
  duplicate: boolean;
};

export class SupabaseConversationRepository implements ConversationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async ingestInboundTextMessage(message: InboundTextMessage): Promise<IngestResult> {
    const { data, error } = await this.client.rpc("ingest_whatsapp_text_message", {
      p_phone_number_id: message.phoneNumberId,
      p_whatsapp_message_id: message.whatsappMessageId,
      p_sender_wa_id: message.senderWaId,
      p_sender_display_name: message.senderDisplayName ?? null,
      p_recipient: message.recipientPhoneNumber ?? null,
      p_content: message.text,
      p_occurred_at: message.occurredAt,
      p_metadata: message.metadata,
    });

    if (error) {
      throw new Error(`Supabase ingestion failed: ${error.message}`, { cause: error });
    }

    const row = (Array.isArray(data) ? data[0] : data) as RpcRow | null;
    if (!row) throw new Error("Supabase ingestion returned no result");

    return {
      organizationId: row.organization_id,
      whatsappChannelId: row.whatsapp_channel_id,
      contactId: row.contact_id,
      conversationId: row.conversation_id,
      messageId: row.message_id,
      contactCreated: row.contact_created,
      conversationCreated: row.conversation_created,
      duplicate: row.duplicate,
    };
  }

  async getConversationContext(conversationId: string): Promise<ConversationContext> {
    const { data: conversation, error } = await this.client
      .from("conversations")
      .select("id, organization_id, status, whatsapp_channels(id, phone_number_id, display_phone_number), contacts(id, whatsapp_wa_id)")
      .eq("id", conversationId)
      .single();
    if (error) throw new Error(`Conversation lookup failed: ${error.message}`, { cause: error });

    const row = conversation as unknown as {
      id: string;
      organization_id: string;
      status: ConversationStatus;
      whatsapp_channels: { id: string; phone_number_id: string; display_phone_number: string | null };
      contacts: { id: string; whatsapp_wa_id: string };
    };
    const { data: messages, error: messagesError } = await this.client
      .from("messages")
      .select("id, direction, sender_type, content, occurred_at, status")
      .eq("conversation_id", conversationId)
      .not("content", "is", null)
      .order("occurred_at", { ascending: false })
      .limit(30);
    if (messagesError) throw new Error(`Conversation history failed: ${messagesError.message}`, { cause: messagesError });

    return {
      id: row.id,
      organizationId: row.organization_id,
      status: row.status,
      channelId: row.whatsapp_channels.id,
      phoneNumberId: row.whatsapp_channels.phone_number_id,
      displayPhoneNumber: row.whatsapp_channels.display_phone_number,
      contactId: row.contacts.id,
      contactWaId: row.contacts.whatsapp_wa_id,
      messages: (messages ?? []).reverse().map((item) => ({
        id: item.id,
        direction: item.direction,
        senderType: item.sender_type,
        content: item.content,
        occurredAt: item.occurred_at,
        status: item.status,
      })),
    };
  }

  async claimOutboundMessage(input: {
    conversation: ConversationContext;
    idempotencyKey: string;
    senderType: "AI_AGENT" | "HUMAN";
  }): Promise<OutboundClaim> {
    const key = createHash("sha256").update(input.idempotencyKey).digest("hex");
    const { data, error } = await this.client
      .from("messages")
      .insert({
        organization_id: input.conversation.organizationId,
        whatsapp_channel_id: input.conversation.channelId,
        conversation_id: input.conversation.id,
        contact_id: input.conversation.contactId,
        direction: "OUTBOUND",
        sender_type: input.senderType,
        sender: input.conversation.displayPhoneNumber ?? input.conversation.phoneNumberId,
        recipient: input.conversation.contactWaId,
        message_type: "text",
        content: null,
        whatsapp_message_id: `pending:${key}`,
        occurred_at: new Date().toISOString(),
        status: "SENT",
        metadata: { delivery_state: "pending" },
      })
      .select("id")
      .single();

    if (error?.code === "23505") return { claimed: false };
    if (error) throw new Error(`Outbound claim failed: ${error.message}`, { cause: error });
    return { claimed: true, messageId: data.id };
  }

  async completeOutboundMessage(messageId: string, whatsappMessageId: string, content: string): Promise<void> {
    const { error } = await this.client
      .from("messages")
      .update({
        whatsapp_message_id: whatsappMessageId,
        content,
        status: "SENT",
        metadata: { delivery_state: "sent" },
      })
      .eq("id", messageId);
    if (error) throw new Error(`Outbound persistence failed: ${error.message}`, { cause: error });
  }

  async failOutboundMessage(messageId: string, reason: string): Promise<void> {
    const { error } = await this.client
      .from("messages")
      .update({ status: "FAILED", metadata: { delivery_state: "failed", reason: reason.slice(0, 300) } })
      .eq("id", messageId);
    if (error) throw new Error(`Outbound failure persistence failed: ${error.message}`, { cause: error });
  }

  async listConversations(): Promise<ConversationSummary[]> {
    const { data, error } = await this.client
      .from("conversations")
      .select("id, status, last_message_at, updated_at, contacts(display_name, whatsapp_wa_id)")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(`Conversation list failed: ${error.message}`, { cause: error });

    return (data ?? []).map((item) => {
      const contact = item.contacts as unknown as { display_name: string | null; whatsapp_wa_id: string };
      return {
        id: item.id,
        status: item.status,
        contactName: contact.display_name,
        contactWaId: contact.whatsapp_wa_id,
        lastMessageAt: item.last_message_at,
        updatedAt: item.updated_at,
      };
    });
  }

  async transitionConversation(conversationId: string, status: ConversationStatus): Promise<void> {
    const { data: current, error: lookupError } = await this.client
      .from("conversations")
      .select("organization_id, status")
      .eq("id", conversationId)
      .single();
    if (lookupError) throw new Error(`Conversation lookup failed: ${lookupError.message}`, { cause: lookupError });

    const { error } = await this.client
      .from("conversations")
      .update({ status, closed_at: status === "CLOSED" ? new Date().toISOString() : null })
      .eq("id", conversationId);
    if (error) throw new Error(`Conversation transition failed: ${error.message}`, { cause: error });

    const { error: eventError } = await this.client.from("conversation_events").insert({
      organization_id: current.organization_id,
      conversation_id: conversationId,
      event_type: "STATUS_CHANGED",
      from_status: current.status,
      to_status: status,
      actor_type: "HUMAN",
    });
    if (eventError) throw new Error(`Conversation event failed: ${eventError.message}`, { cause: eventError });
  }
}

export function createSupabaseConversationRepository(
  supabaseUrl: string,
  serviceRoleKey: string,
): SupabaseConversationRepository {
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return new SupabaseConversationRepository(client);
}
