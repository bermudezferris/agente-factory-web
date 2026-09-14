import { describe, expect, it, vi } from "vitest";

import type { ConversationContext, ConversationRepository, IngestResult } from "@/repositories/conversation-repository";
import type { AiProvider } from "@/services/ai/openai-responses-provider";
import { AutoReplyService } from "@/services/conversations/auto-reply-service";
import type { WhatsAppClient } from "@/services/whatsapp/meta-whatsapp-client";
import type { Logger } from "@/utils/logger";

const inbound: IngestResult = {
  organizationId: "org",
  whatsappChannelId: "channel",
  contactId: "contact",
  conversationId: "conversation",
  messageId: "inbound-message",
  contactCreated: false,
  conversationCreated: false,
  duplicate: false,
};

function context(status: ConversationContext["status"] = "AI_ACTIVE"): ConversationContext {
  return {
    id: "conversation",
    organizationId: "org",
    status,
    channelId: "channel",
    phoneNumberId: "phone-id",
    displayPhoneNumber: "+58000",
    contactId: "contact",
    contactWaId: "contact-wa-id",
    messages: [
      { id: "inbound-message", direction: "INBOUND", senderType: "CONTACT", content: "Hola", occurredAt: "2026-09-14T00:00:00Z", status: "RECEIVED" },
    ],
  };
}

function setup(status: ConversationContext["status"] = "AI_ACTIVE", claimed = true) {
  const repository = {
    getConversationContext: vi.fn().mockResolvedValue(context(status)),
    claimOutboundMessage: vi.fn().mockResolvedValue({ claimed, messageId: claimed ? "outbound" : undefined }),
    completeOutboundMessage: vi.fn().mockResolvedValue(undefined),
    failOutboundMessage: vi.fn().mockResolvedValue(undefined),
  } as unknown as ConversationRepository;
  const ai = { generateReply: vi.fn().mockResolvedValue("¡Hola! ¿Cómo podemos ayudarte?") } as AiProvider;
  const whatsapp = { sendText: vi.fn().mockResolvedValue("wamid.OUTBOUND") } as WhatsAppClient;
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as Logger;
  return { repository, ai, whatsapp, service: new AutoReplyService(repository, ai, whatsapp, logger) };
}

describe("AutoReplyService", () => {
  it("loads history, sends through Meta and persists the returned WhatsApp ID", async () => {
    const { service, repository, ai, whatsapp } = setup();
    await service.process(inbound);

    expect(ai.generateReply).toHaveBeenCalledWith(context().messages);
    expect(whatsapp.sendText).toHaveBeenCalledWith("phone-id", "contact-wa-id", "¡Hola! ¿Cómo podemos ayudarte?");
    expect(repository.completeOutboundMessage).toHaveBeenCalledWith(
      "outbound",
      "wamid.OUTBOUND",
      "¡Hola! ¿Cómo podemos ayudarte?",
    );
  });

  it.each(["HUMAN_REQUIRED", "HUMAN_ACTIVE", "PAUSED", "CLOSED"] as const)(
    "does not reply when conversation status is %s",
    async (status) => {
      const { service, repository, ai, whatsapp } = setup(status);
      await service.process(inbound);
      expect(repository.claimOutboundMessage).not.toHaveBeenCalled();
      expect(ai.generateReply).not.toHaveBeenCalled();
      expect(whatsapp.sendText).not.toHaveBeenCalled();
    },
  );

  it("does not send twice when the outbound claim already exists", async () => {
    const { service, ai, whatsapp } = setup("AI_ACTIVE", false);
    await service.process(inbound);
    expect(ai.generateReply).not.toHaveBeenCalled();
    expect(whatsapp.sendText).not.toHaveBeenCalled();
  });

  it("marks the reserved outbound row failed when generation or delivery fails", async () => {
    const { service, repository, ai } = setup();
    vi.mocked(ai.generateReply).mockRejectedValueOnce(new Error("provider unavailable"));
    await service.process(inbound);
    expect(repository.failOutboundMessage).toHaveBeenCalledWith("outbound", "provider unavailable");
  });
});
