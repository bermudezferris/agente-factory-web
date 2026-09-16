import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import {
  handleWebhookReceipt,
  handleWebhookVerification,
  type WebhookDependencies,
} from "@/controllers/whatsapp-webhook-controller";
import type {
  ConversationRepository,
  IngestResult,
} from "@/repositories/conversation-repository";
import { InboundMessageService } from "@/services/conversations/ingest-inbound-messages";
import { MetaWhatsAppAdapter } from "@/services/whatsapp/meta-whatsapp-adapter";
import { metaTextWebhook } from "@/test/fixtures/meta-webhook";
import type { InboundTextMessage } from "@/types/whatsapp";
import type { Logger } from "@/utils/logger";

const noopLogger: Logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

class MemoryRepository implements ConversationRepository {
  readonly messages = new Map<string, IngestResult>();
  fail = false;

  async ingestInboundTextMessage(message: InboundTextMessage): Promise<IngestResult> {
    if (this.fail) throw new Error("database unavailable");

    const existing = this.messages.get(message.whatsappMessageId);
    if (existing) return { ...existing, contactCreated: false, conversationCreated: false, duplicate: true };

    const result: IngestResult = {
      organizationId: "org-1",
      whatsappChannelId: `channel-for-${message.phoneNumberId}`,
      contactId: `contact-for-${message.senderWaId}`,
      conversationId: `conversation-for-${message.senderWaId}`,
      messageId: `message-${this.messages.size + 1}`,
      contactCreated: true,
      conversationCreated: true,
      duplicate: false,
    };
    this.messages.set(message.whatsappMessageId, result);
    return result;
  }

  async getConversationContext(): Promise<never> { throw new Error("not used"); }
  async getConversationStatus(): Promise<never> { throw new Error("not used"); }
  async claimOutboundMessage(): Promise<never> { throw new Error("not used"); }
  async completeOutboundMessage(): Promise<void> { throw new Error("not used"); }
  async failOutboundMessage(): Promise<void> { throw new Error("not used"); }
  async mergeContactMemory(): Promise<void> { throw new Error("not used"); }
  async getCurrentAppointment(): Promise<never> { throw new Error("not used"); }
  async createAppointmentHold(): Promise<never> { throw new Error("not used"); }
  async markAppointmentBooked(): Promise<void> { throw new Error("not used"); }
  async markAppointmentFailed(): Promise<void> { throw new Error("not used"); }
  async markAppointmentCancelled(): Promise<void> { throw new Error("not used"); }
  async updateAppointmentSchedule(): Promise<void> { throw new Error("not used"); }
  async listConversations(): Promise<never> { throw new Error("not used"); }
  async transitionConversation(): Promise<void> { throw new Error("not used"); }
}

function dependencies(repository = new MemoryRepository()): WebhookDependencies {
  return {
    verifyToken: "verify-token",
    appSecret: "app-secret",
    adapter: new MetaWhatsAppAdapter(),
    ingestionService: new InboundMessageService(repository, noopLogger),
    logger: noopLogger,
  };
}

function signedRequest(payload: unknown, secret = "app-secret"): Request {
  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  return new Request("https://example.test/api/webhooks/whatsapp", {
    method: "POST",
    headers: { "x-hub-signature-256": `sha256=${signature}` },
    body,
  });
}

describe("WhatsApp webhook controller", () => {
  it("returns Meta's challenge for valid verification parameters", async () => {
    const request = new Request(
      "https://example.test/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=12345",
    );
    const response = handleWebhookVerification(request, dependencies());

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("12345");
  });

  it("rejects an invalid verification token", () => {
    const request = new Request(
      "https://example.test/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345",
    );

    expect(handleWebhookVerification(request, dependencies()).status).toBe(403);
  });

  it("identifies channel/contact/conversation and persists a valid payload", async () => {
    const repository = new MemoryRepository();
    const response = await handleWebhookReceipt(signedRequest(metaTextWebhook()), dependencies(repository));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, processed: 1, duplicates: 0 });
    expect(repository.messages.size).toBe(1);
    const stored = repository.messages.get("wamid.TEST_MESSAGE");
    expect(stored).toMatchObject({
      whatsappChannelId: "channel-for-PHONE_NUMBER_ID",
      contactId: "contact-for-15551234567",
      conversationId: "conversation-for-15551234567",
    });
  });

  it("notifies the human console after persisting a new inbound message", async () => {
    const repository = new MemoryRepository();
    const humanConsoleNotifier = {
      alertHumanRequired: vi.fn(),
      notifyInboundDuringHumanActive: vi.fn().mockResolvedValue(undefined),
    };
    const deps = { ...dependencies(repository), humanConsoleNotifier };

    const response = await handleWebhookReceipt(signedRequest(metaTextWebhook()), deps);

    expect(response.status).toBe(200);
    expect(humanConsoleNotifier.notifyInboundDuringHumanActive).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: "conversation-for-15551234567" }),
    );
  });

  it("is idempotent when Meta retries the same message", async () => {
    const repository = new MemoryRepository();
    const autoReplyService = { process: vi.fn().mockResolvedValue(undefined) };
    const deps = { ...dependencies(repository), autoReplyService } as unknown as WebhookDependencies;

    await handleWebhookReceipt(signedRequest(metaTextWebhook()), deps);
    const retry = await handleWebhookReceipt(signedRequest(metaTextWebhook()), deps);

    expect(repository.messages.size).toBe(1);
    expect(autoReplyService.process).toHaveBeenCalledOnce();
    expect(await retry.json()).toEqual({ received: true, processed: 0, duplicates: 1 });
  });

  it("acknowledges an unrecognized payload without persistence", async () => {
    const repository = new MemoryRepository();
    const response = await handleWebhookReceipt(
      signedRequest({ object: "whatsapp_business_account", entry: [] }),
      dependencies(repository),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, processed: 0, duplicates: 0 });
    expect(repository.messages.size).toBe(0);
  });

  it("rejects invalid signatures", async () => {
    const response = await handleWebhookReceipt(
      signedRequest(metaTextWebhook(), "wrong-secret"),
      dependencies(),
    );

    expect(response.status).toBe(401);
  });

  it("returns a safe error when persistence fails", async () => {
    const repository = new MemoryRepository();
    repository.fail = true;
    const response = await handleWebhookReceipt(signedRequest(metaTextWebhook()), dependencies(repository));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Webhook processing failed" });
  });
});
