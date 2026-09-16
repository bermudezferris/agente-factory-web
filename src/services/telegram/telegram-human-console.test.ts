import { describe, expect, it, vi } from "vitest";

import type { ConversationContext, ConversationRepository, IngestResult } from "@/repositories/conversation-repository";
import type { TelegramConsoleRepository } from "@/repositories/telegram-console-repository";
import type { HandoffMemoryExtractor } from "@/services/ai/handoff-memory-extractor";
import type { ManualReplyService } from "@/services/conversations/manual-reply-service";
import type { TelegramClient } from "@/services/telegram/telegram-bot-client";
import { TelegramHumanConsoleService } from "@/services/telegram/telegram-human-console";
import type { Logger } from "@/utils/logger";

const operatorChatId = "1271653065";
const conversationId = "11111111-1111-4111-8111-111111111111";
const assignment = { id: "assignment", operatorChatId, conversationId, assignedAt: "2026-09-16T10:00:00Z" };

function memory() {
  return {
    relevantClientData: ["Empresa: Clínica ABC"],
    needsAndInterests: ["Automatizar atención"],
    agreementsAndCommitments: [],
    appointmentsAndPending: [],
    importantObjections: [],
    humanHandoffNotes: [],
    previousConversationsSummary: "Clínica ABC quiere automatizar su atención.",
  };
}

function context(status: ConversationContext["status"] = "HUMAN_ACTIVE"): ConversationContext {
  return {
    id: conversationId,
    organizationId: "org",
    status,
    channelId: "channel",
    phoneNumberId: "phone-id",
    displayPhoneNumber: "+584129097101",
    contactId: "contact",
    contactWaId: "584121234567",
    contactName: "Carlos Pérez",
    memory: memory(),
    messages: [
      { id: "m1", direction: "INBOUND", senderType: "CONTACT", content: "Somos tres clínicas.", occurredAt: "2026-09-16T10:01:00Z", status: "RECEIVED" },
      { id: "m2", direction: "OUTBOUND", senderType: "HUMAN", content: "Te enviaremos una propuesta.", occurredAt: "2026-09-16T10:02:00Z", status: "SENT" },
    ],
  };
}

function setup(status: ConversationContext["status"] = "HUMAN_ACTIVE") {
  const claimed = new Set<string>();
  const repository = {
    getConversationContext: vi.fn().mockResolvedValue(context(status)),
    mergeContactMemory: vi.fn().mockResolvedValue(undefined),
  } as unknown as ConversationRepository;
  const telegramRepository = {
    claimUpdate: vi.fn(async (key: string) => claimed.has(key) ? false : (claimed.add(key), true)),
    claimNotification: vi.fn(async (key: string) => claimed.has(key) ? false : (claimed.add(key), true)),
    completeNotification: vi.fn().mockResolvedValue(undefined),
    failNotification: vi.fn().mockResolvedValue(undefined),
    getActiveAssignment: vi.fn().mockResolvedValue(assignment),
    getAssignmentForConversation: vi.fn().mockResolvedValue(assignment),
    takeConversation: vi.fn().mockResolvedValue({ result: "TAKEN", activeConversationId: conversationId }),
    releaseConversation: vi.fn().mockResolvedValue({ result: "RELEASED", releasedConversationId: conversationId }),
    recordEvent: vi.fn().mockResolvedValue(undefined),
    getEscalationReason: vi.fn().mockResolvedValue("El cliente pidió una propuesta"),
  } as unknown as TelegramConsoleRepository;
  const telegram = {
    sendMessage: vi.fn().mockResolvedValue(10),
    answerCallback: vi.fn().mockResolvedValue(undefined),
  } as TelegramClient;
  const manualReply = { send: vi.fn().mockResolvedValue(undefined) } as unknown as ManualReplyService;
  const extractor = {
    extract: vi.fn().mockResolvedValue({ relevant: true, memory: {
      ...memory(),
      relevantClientData: ["Tiene tres clínicas"],
      agreementsAndCommitments: ["Enviar propuesta"],
    } }),
  } as HandoffMemoryExtractor;
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as Logger;
  return {
    repository, telegramRepository, telegram, manualReply, extractor,
    service: new TelegramHumanConsoleService(
      repository, telegramRepository, telegram, manualReply, extractor, operatorChatId, logger,
    ),
  };
}

const messageUpdate = (updateId: number, text: string, chatId = Number(operatorChatId)) => ({
  update_id: updateId,
  message: { message_id: updateId, chat: { id: chatId, type: "private" }, text },
});

const callbackUpdate = (updateId: number, callbackId: string, data: string) => ({
  update_id: updateId,
  callback_query: { id: callbackId, from: { id: Number(operatorChatId) }, data },
});

describe("TelegramHumanConsoleService", () => {
  it("sends one idempotent HUMAN_REQUIRED alert with buttons", async () => {
    const { service, telegram, telegramRepository } = setup("HUMAN_REQUIRED");
    await service.alertHumanRequired(conversationId, "Solicitó una persona", "inbound-1");
    await service.alertHumanRequired(conversationId, "Solicitó una persona", "inbound-1");
    expect(telegram.sendMessage).toHaveBeenCalledOnce();
    expect(telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, expect.stringContaining("Intervención requerida"), expect.any(Array));
    expect(telegramRepository.recordEvent).toHaveBeenCalledWith(conversationId, "HUMAN_REQUIRED", { reason: "Solicitó una persona" });
  });

  it("ignores an unauthorized Telegram chat completely", async () => {
    const { service, telegram, telegramRepository } = setup();
    await service.handleUpdate(messageUpdate(1, "/status", 999));
    expect(telegramRepository.claimUpdate).not.toHaveBeenCalled();
    expect(telegram.sendMessage).not.toHaveBeenCalled();
  });

  it("takes a HUMAN_REQUIRED conversation and exposes release controls", async () => {
    const { service, telegram, telegramRepository } = setup("HUMAN_ACTIVE");
    await service.handleUpdate(callbackUpdate(2, "callback-2", `take:${conversationId}`));
    expect(telegramRepository.takeConversation).toHaveBeenCalledWith(operatorChatId, conversationId);
    expect(telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, expect.stringContaining("Conversación tomada"), expect.any(Array));
  });

  it("does not replace another active conversation", async () => {
    const { service, telegram, telegramRepository } = setup();
    vi.mocked(telegramRepository.takeConversation).mockResolvedValueOnce({ result: "OPERATOR_BUSY", activeConversationId: conversationId });
    await service.handleUpdate(callbackUpdate(3, "callback-3", `take:22222222-2222-4222-8222-222222222222`));
    expect(telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, expect.stringContaining("Libérala antes"), expect.any(Array));
  });

  it("forwards normal text only to the active conversation through the existing manual sender", async () => {
    const { service, manualReply, telegramRepository, telegram } = setup();
    await service.handleUpdate(messageUpdate(4, "Te enviaré la propuesta hoy."));
    expect(manualReply.send).toHaveBeenCalledWith(conversationId, "Te enviaré la propuesta hoy.", "telegram-update:4");
    expect(telegramRepository.recordEvent).toHaveBeenCalledWith(conversationId, "HUMAN_MESSAGE", expect.any(Object));
    expect(telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, "✅ Mensaje enviado por WhatsApp.");
  });

  it("never sends WhatsApp text without an active assignment", async () => {
    const { service, manualReply, telegramRepository, telegram } = setup();
    vi.mocked(telegramRepository.getActiveAssignment).mockResolvedValueOnce(null);
    await service.handleUpdate(messageUpdate(5, "Manda esto al número X"));
    expect(manualReply.send).not.toHaveBeenCalled();
    expect(telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, "No tienes ninguna conversación tomada.");
  });

  it("reports Meta failure without claiming success", async () => {
    const { service, manualReply, telegram } = setup();
    vi.mocked(manualReply.send).mockRejectedValueOnce(new Error("Meta failed"));
    await service.handleUpdate(messageUpdate(6, "Hola"));
    expect(telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, "❌ No se pudo enviar el mensaje por WhatsApp.");
  });

  it("notifies the assigned operator when the client writes during HUMAN_ACTIVE", async () => {
    const { service, telegram, telegramRepository } = setup();
    const inbound: IngestResult = { organizationId: "org", whatsappChannelId: "channel", contactId: "contact", conversationId, messageId: "new-inbound", contactCreated: false, conversationCreated: false, duplicate: false };
    await service.notifyInboundDuringHumanActive(inbound);
    expect(telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, expect.stringContaining("Carlos Pérez"), expect.any(Array));
    expect(telegramRepository.completeNotification).toHaveBeenCalledOnce();
  });

  it("does not notify Telegram for AI_ACTIVE inbound", async () => {
    const { service, telegram } = setup("AI_ACTIVE");
    await service.notifyInboundDuringHumanActive({ organizationId: "org", whatsappChannelId: "channel", contactId: "contact", conversationId, messageId: "ai-inbound", contactCreated: false, conversationCreated: false, duplicate: false });
    expect(telegram.sendMessage).not.toHaveBeenCalled();
  });

  it("shows compact context without technical IDs", async () => {
    const { service, telegram } = setup();
    await service.handleUpdate(callbackUpdate(9, "callback-9", `context:${conversationId}`));
    const text = vi.mocked(telegram.sendMessage).mock.calls[0][1];
    expect(text).toContain("Clínica ABC");
    expect(text).toContain("Últimos mensajes");
    expect(text).not.toContain(conversationId);
  });

  it("supports /status and /cancel", async () => {
    const first = setup();
    await first.service.handleUpdate(messageUpdate(10, "/status"));
    expect(first.telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, expect.stringContaining("HUMANO ACTIVO"), expect.any(Array));
    const second = setup();
    await second.service.handleUpdate(messageUpdate(11, "/cancel"));
    expect(second.telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, "No hay ninguna acción pendiente.");
  });

  it("releases to AI_ACTIVE only after merging relevant handoff memory", async () => {
    const { service, repository, telegramRepository, extractor, telegram } = setup();
    await service.handleUpdate(messageUpdate(12, "/release"));
    expect(extractor.extract).toHaveBeenCalledWith(context().memory, context().messages);
    expect(repository.mergeContactMemory).toHaveBeenCalledWith(expect.objectContaining({
      contactId: "contact",
      memory: expect.objectContaining({ relevantClientData: ["Tiene tres clínicas"] }),
    }));
    expect(vi.mocked(repository.mergeContactMemory).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(telegramRepository.releaseConversation).mock.invocationCallOrder[0],
    );
    expect(telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, expect.stringContaining("devuelta a Valentina (IA)"));
  });

  it("handles /release without an active conversation", async () => {
    const { service, telegramRepository, telegram } = setup();
    vi.mocked(telegramRepository.getActiveAssignment).mockResolvedValueOnce(null);
    await service.handleUpdate(messageUpdate(13, "/release"));
    expect(telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, "No tienes ninguna conversación tomada.");
  });

  it("deduplicates Telegram updates and callback queries", async () => {
    const { service, telegramRepository } = setup();
    const update = callbackUpdate(14, "same-callback", `take:${conversationId}`);
    await service.handleUpdate(update);
    await service.handleUpdate(update);
    await service.handleUpdate(callbackUpdate(15, "same-callback", `take:${conversationId}`));
    expect(telegramRepository.takeConversation).toHaveBeenCalledOnce();
  });
});
