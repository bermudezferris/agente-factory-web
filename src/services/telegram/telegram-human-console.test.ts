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
    transitionConversation: vi.fn().mockResolvedValue(undefined),
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
    listRecentConversations: vi.fn().mockResolvedValue([
      { id: conversationId, contactName: "Carlos Pérez", contactAddress: "584121234567", channel: "WhatsApp", status, lastMessage: "Somos tres clínicas.", lastMessageAt: "2026-09-16T10:01:00Z" },
      { id: "22222222-2222-4222-8222-222222222222", contactName: "María Gómez", contactAddress: "584121111111", channel: "WhatsApp", status: "AI_ACTIVE", lastMessage: "¿Cuánto cuesta?", lastMessageAt: "2026-09-16T09:00:00Z" },
    ]),
    getWatch: vi.fn().mockResolvedValue(null),
    startWatching: vi.fn().mockResolvedValue({ operatorChatId, conversationId, startedAt: "2026-09-16T10:03:00Z" }),
    stopWatching: vi.fn().mockResolvedValue(conversationId),
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
    expect(first.telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, expect.stringContaining("Conversación humana activa"), expect.any(Array));
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

  it("lists recent conversations in repository order with the latest message", async () => {
    const { service, telegram, telegramRepository } = setup("AI_ACTIVE");
    await service.handleUpdate(messageUpdate(20, "/recent"));
    expect(telegramRepository.listRecentConversations).toHaveBeenCalledWith(8);
    const text = vi.mocked(telegram.sendMessage).mock.calls[0][1];
    expect(text.indexOf("Carlos Pérez")).toBeLessThan(text.indexOf("María Gómez"));
    expect(text).toContain("Somos tres clínicas.");
    expect(text).not.toContain(conversationId);
  });

  it("opens and refreshes a conversation with the latest readable messages", async () => {
    const { service, telegram, repository } = setup("AI_ACTIVE");
    vi.mocked(repository.getConversationContext).mockResolvedValue({
      ...context("AI_ACTIVE"),
      messages: [
        context("AI_ACTIVE").messages[0],
        { ...context("AI_ACTIVE").messages[1], senderType: "AI_AGENT" },
      ],
    });
    await service.handleUpdate(callbackUpdate(21, "view-21", `view:${conversationId}`));
    await service.handleUpdate(callbackUpdate(22, "refresh-22", `refresh:${conversationId}`));
    expect(repository.getConversationContext).toHaveBeenCalledTimes(2);
    expect(vi.mocked(telegram.sendMessage).mock.calls[0][1]).toContain("👤 Carlos Pérez");
    expect(vi.mocked(telegram.sendMessage).mock.calls[0][1]).toContain("🤖 Valentina (IA)");
  });

  it("starts watching without changing AI_ACTIVE", async () => {
    const { service, telegramRepository, repository } = setup("AI_ACTIVE");
    await service.handleUpdate(callbackUpdate(23, "watch-23", `watch:${conversationId}`));
    expect(telegramRepository.startWatching).toHaveBeenCalledWith(operatorChatId, conversationId);
    expect(repository.transitionConversation).not.toHaveBeenCalled();
  });

  it("mirrors inbound and AI outbound once while watching", async () => {
    const { service, telegramRepository, telegram } = setup("AI_ACTIVE");
    vi.mocked(telegramRepository.getWatch).mockResolvedValue({ operatorChatId, conversationId, startedAt: "2026-09-16T10:00:00Z" });
    const incoming: IngestResult = { organizationId: "org", whatsappChannelId: "channel", contactId: "contact", conversationId, messageId: "watch-message", contactCreated: false, conversationCreated: false, duplicate: false };
    await service.notifyInboundDuringHumanActive(incoming);
    await service.notifyInboundDuringHumanActive(incoming);
    await service.notifyAiOutbound(conversationId, "ai-message", "Eso está interesante.");
    await service.notifyAiOutbound(conversationId, "ai-message", "Eso está interesante.");
    expect(telegram.sendMessage).toHaveBeenCalledTimes(2);
    expect(vi.mocked(telegram.sendMessage).mock.calls[0][1]).toContain("👤 Carlos Pérez");
    expect(vi.mocked(telegram.sendMessage).mock.calls[1][1]).toContain("🤖 Valentina (IA)");
  });

  it("blocks normal text while only watching", async () => {
    const { service, telegramRepository, manualReply, telegram } = setup("AI_ACTIVE");
    vi.mocked(telegramRepository.getActiveAssignment).mockResolvedValueOnce(null);
    vi.mocked(telegramRepository.getWatch).mockResolvedValueOnce({ operatorChatId, conversationId, startedAt: "2026-09-16T10:00:00Z" });
    await service.handleUpdate(messageUpdate(24, "Hola cliente"));
    expect(manualReply.send).not.toHaveBeenCalled();
    expect(telegram.sendMessage).toHaveBeenCalledWith(operatorChatId, expect.stringContaining("primero pulsa ‘Tomar conversación’"));
  });

  it("stops watching from button and command without changing conversation status", async () => {
    const first = setup("AI_ACTIVE");
    await first.service.handleUpdate(callbackUpdate(25, "unwatch-25", `unwatch:${conversationId}`));
    expect(first.telegramRepository.stopWatching).toHaveBeenCalledWith(operatorChatId);
    expect(first.repository.transitionConversation).not.toHaveBeenCalled();
    const second = setup("AI_ACTIVE");
    await second.service.handleUpdate(messageUpdate(26, "/unwatch"));
    expect(second.telegramRepository.stopWatching).toHaveBeenCalledWith(operatorChatId);
  });

  it("takes AI_ACTIVE by reusing the existing HUMAN_REQUIRED takeover and stops watching", async () => {
    const { service, repository, telegramRepository } = setup("AI_ACTIVE");
    await service.handleUpdate(callbackUpdate(27, "take-ai-27", `take:${conversationId}`));
    expect(repository.transitionConversation).toHaveBeenCalledWith(conversationId, "HUMAN_REQUIRED");
    expect(telegramRepository.takeConversation).toHaveBeenCalledWith(operatorChatId, conversationId);
    expect(telegramRepository.stopWatching).toHaveBeenCalledWith(operatorChatId);
  });

  it("shows both active takeover and watch sections in status", async () => {
    const { service, telegramRepository, telegram } = setup("HUMAN_ACTIVE");
    vi.mocked(telegramRepository.getWatch).mockResolvedValueOnce({ operatorChatId, conversationId, startedAt: "2026-09-16T10:00:00Z" });
    await service.handleUpdate(messageUpdate(28, "/status"));
    const text = vi.mocked(telegram.sendMessage).mock.calls[0][1];
    expect(text).toContain("Conversación humana activa");
    expect(text).toContain("Observando");
  });
});
