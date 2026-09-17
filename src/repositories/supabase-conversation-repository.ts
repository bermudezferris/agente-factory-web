import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

import type {
  ConversationRepository,
  ConversationContext,
  ConversationStatus,
  ConversationSummary,
  ContactMemory,
  IngestResult,
  OutboundClaim,
  Appointment,
} from "@/repositories/conversation-repository";
import { AppointmentSlotConflictError } from "@/repositories/conversation-repository";
import type { InboundTextMessage } from "@/types/whatsapp";
import { stableContactMemory } from "@/policies/contact-memory-policy";

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

const emptyContactMemory = (): ContactMemory => ({
  relevantClientData: [],
  needsAndInterests: [],
  agreementsAndCommitments: [],
  appointmentsAndPending: [],
  importantObjections: [],
  humanHandoffNotes: [],
  previousConversationsSummary: "",
});

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function deterministicUuid(value: string): string {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join("")}-${hex.slice(8, 12).join("")}-${hex.slice(12, 16).join("")}-${hex.slice(16, 20).join("")}-${hex.slice(20).join("")}`;
}

function formatOfferedSlot(value: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value)).replace(/\.$/, "");
}

function mapAppointment(row: Record<string, unknown>): Appointment {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    conversationId: row.conversation_id as string,
    contactId: row.contact_id as string,
    calendarId: row.calendar_id as string,
    calendarEventId: row.calendar_event_id as string | null,
    status: row.status as Appointment["status"],
    appointmentType: row.appointment_type as string,
    startsAt: row.starts_at as string,
    endsAt: row.ends_at as string,
    blockedUntil: row.blocked_until as string,
    timezone: row.timezone as string,
    attendeeName: row.attendee_name as string,
    attendeeEmail: row.attendee_email as string,
    company: row.company as string | null,
    reason: row.reason as string | null,
  };
}

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
    const [conversationResult, messagesResult] = await Promise.all([
      this.client
        .from("conversations")
        .select("id, organization_id, status, whatsapp_channels(id, phone_number_id, display_phone_number), contacts(id, whatsapp_wa_id, display_name)")
        .eq("id", conversationId)
        .single(),
      this.client
        .from("messages")
        .select("id, direction, sender_type, content, occurred_at, status")
        .eq("conversation_id", conversationId)
        .not("content", "is", null)
        .order("occurred_at", { ascending: false })
        .limit(16),
    ]);
    const { data: conversation, error } = conversationResult;
    if (error) throw new Error(`Conversation lookup failed: ${error.message}`, { cause: error });

    const row = conversation as unknown as {
      id: string;
      organization_id: string;
      status: ConversationStatus;
      whatsapp_channels: { id: string; phone_number_id: string; display_phone_number: string | null };
      contacts: { id: string; whatsapp_wa_id: string; display_name: string | null };
    };
    const { data: messages, error: messagesError } = messagesResult;
    if (messagesError) throw new Error(`Conversation history failed: ${messagesError.message}`, { cause: messagesError });

    const { data: memory, error: memoryError } = await this.client
      .from("contact_memories")
      .select(
        "relevant_client_data, needs_and_interests, agreements_and_commitments, appointments_and_pending, important_objections, human_handoff_notes, previous_conversations_summary",
      )
      .eq("contact_id", row.contacts.id)
      .maybeSingle();
    if (memoryError) throw new Error(`Contact memory lookup failed: ${memoryError.message}`, { cause: memoryError });

    const contactMemory = stableContactMemory(memory
      ? {
          relevantClientData: stringList(memory.relevant_client_data),
          needsAndInterests: stringList(memory.needs_and_interests),
          agreementsAndCommitments: stringList(memory.agreements_and_commitments),
          appointmentsAndPending: stringList(memory.appointments_and_pending),
          importantObjections: stringList(memory.important_objections),
          humanHandoffNotes: stringList(memory.human_handoff_notes),
          previousConversationsSummary: memory.previous_conversations_summary ?? "",
        }
      : emptyContactMemory());

    return {
      id: row.id,
      organizationId: row.organization_id,
      status: row.status,
      channelId: row.whatsapp_channels.id,
      phoneNumberId: row.whatsapp_channels.phone_number_id,
      displayPhoneNumber: row.whatsapp_channels.display_phone_number,
      contactId: row.contacts.id,
      contactWaId: row.contacts.whatsapp_wa_id,
      contactName: row.contacts.display_name,
      memory: contactMemory,
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

  async getConversationStatus(conversationId: string): Promise<ConversationStatus> {
    const { data, error } = await this.client
      .from("conversations")
      .select("status")
      .eq("id", conversationId)
      .single();
    if (error) throw new Error(`Conversation status lookup failed: ${error.message}`, { cause: error });
    return data.status as ConversationStatus;
  }

  async claimOutboundMessage(input: {
    conversation: ConversationContext;
    idempotencyKey: string;
    senderType: "AI_AGENT" | "HUMAN";
  }): Promise<OutboundClaim> {
    const key = createHash("sha256").update(input.idempotencyKey).digest("hex");
    const messageId = deterministicUuid(`outbound:${input.idempotencyKey}`);
    const { data, error } = await this.client
      .from("messages")
      .insert({
        id: messageId,
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
        metadata: { delivery_state: "pending", source_interaction_id: input.idempotencyKey },
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

  async mergeContactMemory(input: {
    contactId: string;
    sourceInteractionId: string;
    memory: ContactMemory;
  }): Promise<void> {
    const memory = stableContactMemory(input.memory);
    const { error } = await this.client.rpc("merge_contact_memory", {
      p_contact_id: input.contactId,
      p_source_interaction_id: input.sourceInteractionId,
      p_relevant_client_data: memory.relevantClientData,
      p_needs_and_interests: memory.needsAndInterests,
      p_agreements_and_commitments: memory.agreementsAndCommitments,
      p_appointments_and_pending: memory.appointmentsAndPending,
      p_important_objections: memory.importantObjections,
      p_human_handoff_notes: memory.humanHandoffNotes,
      p_previous_conversations_summary: memory.previousConversationsSummary,
    });
    if (error) throw new Error(`Contact memory update failed: ${error.message}`, { cause: error });
  }

  async getCurrentAppointment(contactId: string): Promise<Appointment | null> {
    const { data, error } = await this.client
      .from("appointments")
      .select("*")
      .eq("contact_id", contactId)
      .in("status", ["HOLD", "BOOKED"])
      .gte("ends_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Appointment lookup failed: ${error.message}`, { cause: error });
    return data ? mapAppointment(data as Record<string, unknown>) : null;
  }

  async getRecentOfferedSlots(conversationId: string): Promise<string[]> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await this.client
      .from("conversation_events")
      .select("metadata")
      .eq("conversation_id", conversationId)
      .in("event_type", ["BOOKING_SLOTS_OFFERED", "BOOKING_SLOTS_CLEARED"])
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) throw new Error(`Offered slots lookup failed: ${error.message}`, { cause: error });
    const latest = data?.[0];
    const metadata = latest?.metadata as { cleared?: unknown; slots?: unknown } | null;
    if (!latest || metadata?.cleared === true) return [];
    return Array.isArray(metadata?.slots)
      ? metadata.slots.filter((slot): slot is string => typeof slot === "string")
      : [];
  }

  async clearRecentOfferedSlots(input: {
    conversation: ConversationContext;
    sourceInteractionId: string;
    reason: "TOPIC_CHANGED" | "BOOKED" | "CANCELLED";
  }): Promise<void> {
    const { error } = await this.client.from("conversation_events").insert({
      organization_id: input.conversation.organizationId,
      conversation_id: input.conversation.id,
      event_type: "BOOKING_SLOTS_CLEARED",
      actor_type: "SYSTEM",
      metadata: {
        cleared: true,
        reason: input.reason,
        source_interaction_id: input.sourceInteractionId,
      },
    });
    if (error) throw new Error(`Offered slots cleanup failed: ${error.message}`, { cause: error });
  }

  async recordOfferedSlots(input: {
    conversation: ConversationContext;
    sourceInteractionId: string;
    slots: string[];
  }): Promise<void> {
    const durationMinutes = 25;
    const { error } = await this.client.from("conversation_events").insert({
      organization_id: input.conversation.organizationId,
      conversation_id: input.conversation.id,
      event_type: "BOOKING_SLOTS_OFFERED",
      actor_type: "AI_AGENT",
      metadata: {
        slots: input.slots,
        offered_slots: input.slots.map((start) => ({
          start,
          end: new Date(new Date(start).getTime() + durationMinutes * 60 * 1000).toISOString(),
          display_label: formatOfferedSlot(start),
        })),
        source_interaction_id: input.sourceInteractionId,
      },
    });
    if (error) throw new Error(`Offered slots persistence failed: ${error.message}`, { cause: error });
  }

  async createAppointmentHold(input: Omit<Appointment, "id" | "calendarEventId" | "status"> & {
    sourceInteractionId: string;
  }): Promise<Appointment> {
    const row = {
      organization_id: input.organizationId,
      conversation_id: input.conversationId,
      contact_id: input.contactId,
      calendar_id: input.calendarId,
      source_interaction_id: input.sourceInteractionId,
      status: "HOLD",
      appointment_type: input.appointmentType,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      blocked_until: input.blockedUntil,
      timezone: input.timezone,
      attendee_name: input.attendeeName,
      attendee_email: input.attendeeEmail,
      company: input.company,
      reason: input.reason,
    };
    const { data, error } = await this.client.from("appointments").insert(row).select("*").single();
    if (error?.code === "23505") {
      const { data: existing, error: lookupError } = await this.client
        .from("appointments")
        .select("*")
        .eq("source_interaction_id", input.sourceInteractionId)
        .single();
      if (lookupError) throw new Error(`Appointment idempotency lookup failed: ${lookupError.message}`, { cause: lookupError });
      return mapAppointment(existing as Record<string, unknown>);
    }
    if (error?.code === "23P01") throw new AppointmentSlotConflictError();
    if (error) throw new Error(`Appointment hold failed: ${error.message}`, { cause: error });
    return mapAppointment(data as Record<string, unknown>);
  }

  async markAppointmentBooked(
    appointmentId: string,
    calendarEventId: string,
    startsAt: string,
    endsAt: string,
    blockedUntil: string,
  ): Promise<void> {
    const { error } = await this.client
      .from("appointments")
      .update({
        status: "BOOKED",
        calendar_event_id: calendarEventId,
        starts_at: startsAt,
        ends_at: endsAt,
        blocked_until: blockedUntil,
      })
      .eq("id", appointmentId);
    if (error) throw new Error(`Appointment completion failed: ${error.message}`, { cause: error });
  }

  async markAppointmentFailed(appointmentId: string, reason: string): Promise<void> {
    const { error } = await this.client
      .from("appointments")
      .update({ status: "FAILED", metadata: { failure_reason: reason.slice(0, 300) } })
      .eq("id", appointmentId);
    if (error) throw new Error(`Appointment failure persistence failed: ${error.message}`, { cause: error });
  }

  async markAppointmentCancelled(appointmentId: string): Promise<void> {
    const { error } = await this.client
      .from("appointments")
      .update({ status: "CANCELLED", cancelled_at: new Date().toISOString() })
      .eq("id", appointmentId);
    if (error) throw new Error(`Appointment cancellation persistence failed: ${error.message}`, { cause: error });
  }

  async updateAppointmentSchedule(
    appointmentId: string,
    startsAt: string,
    endsAt: string,
    blockedUntil: string,
    timezone: string,
  ): Promise<void> {
    const { error } = await this.client
      .from("appointments")
      .update({ starts_at: startsAt, ends_at: endsAt, blocked_until: blockedUntil, timezone, status: "BOOKED" })
      .eq("id", appointmentId);
    if (error) throw new Error(`Appointment reschedule persistence failed: ${error.message}`, { cause: error });
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
