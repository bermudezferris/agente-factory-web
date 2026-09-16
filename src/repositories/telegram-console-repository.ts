import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type TelegramAssignment = {
  id: string;
  operatorChatId: string;
  conversationId: string;
  assignedAt: string;
};

export type TakeResult = {
  result: "TAKEN" | "ALREADY_TAKEN" | "OPERATOR_BUSY" | "NOT_AVAILABLE";
  activeConversationId: string | null;
};

export type ReleaseResult = {
  result: "RELEASED" | "NO_ACTIVE";
  releasedConversationId: string | null;
};

export interface TelegramConsoleRepository {
  claimUpdate(dedupeKey: string, updateId: number, updateType: string): Promise<boolean>;
  claimNotification(idempotencyKey: string, conversationId: string, type: string): Promise<boolean>;
  completeNotification(idempotencyKey: string, telegramMessageId: number): Promise<void>;
  failNotification(idempotencyKey: string, reason: string): Promise<void>;
  getActiveAssignment(operatorChatId: string): Promise<TelegramAssignment | null>;
  getAssignmentForConversation(conversationId: string): Promise<TelegramAssignment | null>;
  takeConversation(operatorChatId: string, conversationId: string): Promise<TakeResult>;
  releaseConversation(operatorChatId: string): Promise<ReleaseResult>;
  recordEvent(conversationId: string, eventType: string, metadata?: Record<string, unknown>): Promise<void>;
  getEscalationReason(conversationId: string): Promise<string | null>;
}

export class SupabaseTelegramConsoleRepository implements TelegramConsoleRepository {
  constructor(private readonly client: SupabaseClient) {}

  async claimUpdate(dedupeKey: string, updateId: number, updateType: string): Promise<boolean> {
    const { error } = await this.client.from("telegram_webhook_updates").insert({
      dedupe_key: dedupeKey,
      update_id: updateId,
      update_type: updateType,
    });
    if (error?.code === "23505") return false;
    if (error) throw new Error(`Telegram update claim failed: ${error.message}`, { cause: error });
    return true;
  }

  async claimNotification(idempotencyKey: string, conversationId: string, type: string): Promise<boolean> {
    const { error } = await this.client.from("telegram_notifications").insert({
      idempotency_key: idempotencyKey,
      conversation_id: conversationId,
      notification_type: type,
    });
    if (error?.code === "23505") return false;
    if (error) throw new Error(`Telegram notification claim failed: ${error.message}`, { cause: error });
    return true;
  }

  async completeNotification(idempotencyKey: string, telegramMessageId: number): Promise<void> {
    const { error } = await this.client.from("telegram_notifications")
      .update({ status: "SENT", telegram_message_id: telegramMessageId, error: null, updated_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey);
    if (error) throw new Error(`Telegram notification completion failed: ${error.message}`, { cause: error });
  }

  async failNotification(idempotencyKey: string, reason: string): Promise<void> {
    const { error } = await this.client.from("telegram_notifications")
      .update({ status: "FAILED", error: reason.slice(0, 300), updated_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey);
    if (error) throw new Error(`Telegram notification failure failed: ${error.message}`, { cause: error });
  }

  async getActiveAssignment(operatorChatId: string): Promise<TelegramAssignment | null> {
    const { data, error } = await this.client.from("telegram_operator_assignments")
      .select("id, operator_chat_id, conversation_id, assigned_at")
      .eq("operator_chat_id", operatorChatId)
      .eq("status", "ACTIVE")
      .maybeSingle();
    if (error) throw new Error(`Telegram assignment lookup failed: ${error.message}`, { cause: error });
    return data ? { id: data.id, operatorChatId: data.operator_chat_id, conversationId: data.conversation_id, assignedAt: data.assigned_at } : null;
  }

  async getAssignmentForConversation(conversationId: string): Promise<TelegramAssignment | null> {
    const { data, error } = await this.client.from("telegram_operator_assignments")
      .select("id, operator_chat_id, conversation_id, assigned_at")
      .eq("conversation_id", conversationId)
      .eq("status", "ACTIVE")
      .maybeSingle();
    if (error) throw new Error(`Telegram conversation assignment lookup failed: ${error.message}`, { cause: error });
    return data ? { id: data.id, operatorChatId: data.operator_chat_id, conversationId: data.conversation_id, assignedAt: data.assigned_at } : null;
  }

  async takeConversation(operatorChatId: string, conversationId: string): Promise<TakeResult> {
    const { data, error } = await this.client.rpc("take_telegram_conversation", {
      p_operator_chat_id: operatorChatId,
      p_conversation_id: conversationId,
    });
    if (error) throw new Error(`Telegram takeover failed: ${error.message}`, { cause: error });
    const row = (Array.isArray(data) ? data[0] : data) as { result: TakeResult["result"]; active_conversation_id: string | null };
    return { result: row.result, activeConversationId: row.active_conversation_id };
  }

  async releaseConversation(operatorChatId: string): Promise<ReleaseResult> {
    const { data, error } = await this.client.rpc("release_telegram_conversation", {
      p_operator_chat_id: operatorChatId,
    });
    if (error) throw new Error(`Telegram release failed: ${error.message}`, { cause: error });
    const row = (Array.isArray(data) ? data[0] : data) as { result: ReleaseResult["result"]; released_conversation_id: string | null };
    return { result: row.result, releasedConversationId: row.released_conversation_id };
  }

  async recordEvent(conversationId: string, eventType: string, metadata: Record<string, unknown> = {}): Promise<void> {
    const { data: conversation, error: lookupError } = await this.client.from("conversations")
      .select("organization_id")
      .eq("id", conversationId)
      .single();
    if (lookupError) throw new Error(`Conversation event lookup failed: ${lookupError.message}`, { cause: lookupError });
    const { error } = await this.client.from("conversation_events").insert({
      organization_id: conversation.organization_id,
      conversation_id: conversationId,
      event_type: eventType,
      actor_type: eventType === "HUMAN_MESSAGE" ? "HUMAN" : "SYSTEM",
      metadata,
    });
    if (error) throw new Error(`Conversation event persistence failed: ${error.message}`, { cause: error });
  }

  async getEscalationReason(conversationId: string): Promise<string | null> {
    const { data, error } = await this.client.from("conversation_events")
      .select("metadata")
      .eq("conversation_id", conversationId)
      .eq("event_type", "HUMAN_REQUIRED")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Escalation reason lookup failed: ${error.message}`, { cause: error });
    const reason = data?.metadata && typeof data.metadata === "object" ? (data.metadata as Record<string, unknown>).reason : null;
    return typeof reason === "string" ? reason : null;
  }
}

export function createTelegramConsoleRepository(url: string, serviceRoleKey: string): TelegramConsoleRepository {
  return new SupabaseTelegramConsoleRepository(createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
}
