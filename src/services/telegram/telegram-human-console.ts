import type {
  ContactMemory,
  ConversationContext,
  ConversationRepository,
  IngestResult,
} from "@/repositories/conversation-repository";
import type {
  TelegramConsoleRepository,
} from "@/repositories/telegram-console-repository";
import type { HandoffMemoryExtractor } from "@/services/ai/handoff-memory-extractor";
import type { ManualReplyService } from "@/services/conversations/manual-reply-service";
import type { TelegramClient } from "@/services/telegram/telegram-bot-client";
import type { TelegramUpdate } from "@/types/telegram";
import type { Logger } from "@/utils/logger";

const NO_ACTIVE = "No tienes ninguna conversación tomada.";

function displayName(context: ConversationContext): string {
  return context.contactName?.trim() || "Cliente de WhatsApp";
}

function phone(context: ConversationContext): string {
  return context.contactWaId.startsWith("+") ? context.contactWaId : `+${context.contactWaId}`;
}

function company(memory: ContactMemory): string | null {
  return memory.relevantClientData.find((item) => /^(empresa|compañía|organización)\s*:/i.test(item))
    ?.replace(/^[^:]+:\s*/, "") ?? null;
}

function latestMessage(context: ConversationContext): string {
  return [...context.messages].reverse().find((message) => message.content)?.content ?? "Sin mensajes recientes";
}

function compactSummary(memory: ContactMemory): string {
  if (memory.previousConversationsSummary.trim()) return memory.previousConversationsSummary.trim();
  return [...memory.needsAndInterests, ...memory.agreementsAndCommitments, ...memory.humanHandoffNotes]
    .slice(0, 3).join(" · ") || "Sin resumen disponible todavía.";
}

function takeKeyboard(conversationId: string) {
  return [[
    { text: "Tomar conversación", callback_data: `take:${conversationId}` },
    { text: "Ver contexto", callback_data: `context:${conversationId}` },
  ]];
}

function releaseKeyboard(conversationId: string) {
  return [[
    { text: "Ver contexto", callback_data: `context:${conversationId}` },
    { text: "Devolver a Valentina (IA)", callback_data: `release:${conversationId}` },
  ]];
}

function observerKeyboard(conversationId: string, watching = false) {
  return [
    [
      { text: "Actualizar", callback_data: `refresh:${conversationId}` },
      watching
        ? { text: "Dejar de seguir", callback_data: `unwatch:${conversationId}` }
        : { text: "Seguir en vivo", callback_data: `watch:${conversationId}` },
    ],
    [
      { text: "Tomar conversación", callback_data: `take:${conversationId}` },
      { text: "Cerrar", callback_data: `close:${conversationId}` },
    ],
  ];
}

export interface HumanConsoleNotifier {
  alertHumanRequired(conversationId: string, reason: string, sourceMessageId: string): Promise<void>;
  notifyInboundDuringHumanActive(inbound: IngestResult): Promise<void>;
  notifyAiOutbound(conversationId: string, messageId: string, content: string): Promise<void>;
}

export class TelegramHumanConsoleService implements HumanConsoleNotifier {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly telegramRepository: TelegramConsoleRepository,
    private readonly telegram: TelegramClient,
    private readonly manualReply: ManualReplyService,
    private readonly memoryExtractor: HandoffMemoryExtractor,
    private readonly operatorChatId: string,
    private readonly logger: Logger,
  ) {}

  async handleUpdate(update: TelegramUpdate): Promise<void> {
    const chatId = update.message?.chat.id ?? update.callback_query?.from.id;
    if (String(chatId ?? "") !== this.operatorChatId) {
      this.logger.warn("telegram_unauthorized_update", { updateId: update.update_id });
      return;
    }

    if (!await this.telegramRepository.claimUpdate(`update:${update.update_id}`, update.update_id, update.callback_query ? "callback" : "message")) {
      return;
    }
    if (update.callback_query && !await this.telegramRepository.claimUpdate(
      `callback:${update.callback_query.id}`,
      update.update_id,
      "callback_query",
    )) return;

    if (update.callback_query) {
      await this.handleCallback(update.callback_query.id, update.callback_query.data ?? "");
      return;
    }

    const text = update.message?.text?.trim();
    if (!text) return;
    if (text.startsWith("/status")) return this.sendStatus();
    if (text.startsWith("/recent")) return this.sendRecent();
    if (text.startsWith("/unwatch")) return this.stopWatching();
    if (text.startsWith("/release")) return this.releaseActive();
    if (text.startsWith("/cancel")) {
      await this.telegram.sendMessage(this.operatorChatId, "No hay ninguna acción pendiente.");
      return;
    }
    if (text.startsWith("/")) {
      await this.telegram.sendMessage(this.operatorChatId, "Comando no reconocido. Usa /recent, /status, /unwatch, /release o /cancel.");
      return;
    }
    await this.forwardHumanMessage(update.update_id, text);
  }

  async alertHumanRequired(conversationId: string, reason: string, sourceMessageId: string): Promise<void> {
    const key = `human-required:${sourceMessageId}`;
    if (!await this.telegramRepository.claimNotification(key, conversationId, "HUMAN_REQUIRED")) return;
    try {
      await this.telegramRepository.recordEvent(conversationId, "HUMAN_REQUIRED", { reason });
      const context = await this.repository.getConversationContext(conversationId);
      const messageId = await this.telegram.sendMessage(
        this.operatorChatId,
        [
          "🔔 Intervención requerida",
          "",
          `Cliente: ${displayName(context)}`,
          ...(company(context.memory) ? [`Empresa: ${company(context.memory)}`] : []),
          `WhatsApp: ${phone(context)}`,
          `Motivo: ${reason || "Intervención humana solicitada"}`,
          "",
          "Último mensaje:",
          `“${latestMessage(context)}”`,
          "",
          "Resumen:",
          compactSummary(context.memory),
        ].join("\n").slice(0, 4000),
        takeKeyboard(conversationId),
      );
      await this.telegramRepository.completeNotification(key, messageId);
    } catch (error) {
      await this.telegramRepository.failNotification(key, error instanceof Error ? error.message : "Unknown alert error");
      throw error;
    }
  }

  async notifyInboundDuringHumanActive(inbound: IngestResult): Promise<void> {
    const context = await this.repository.getConversationContext(inbound.conversationId);
    const assignment = context.status === "HUMAN_ACTIVE"
      ? await this.telegramRepository.getAssignmentForConversation(context.id)
      : null;
    const watch = assignment ? null : await this.telegramRepository.getWatch(this.operatorChatId);
    if (!assignment && watch?.conversationId !== context.id) return;
    const key = `${assignment ? "human-active" : "watch"}-inbound:${inbound.messageId}`;
    if (!await this.telegramRepository.claimNotification(key, context.id, "HUMAN_ACTIVE_MESSAGE")) return;
    try {
      const messageId = await this.telegram.sendMessage(
        assignment?.operatorChatId ?? this.operatorChatId,
        `👤 ${displayName(context)}\n${latestMessage(context)}`,
        assignment ? releaseKeyboard(context.id) : observerKeyboard(context.id, true),
      );
      await this.telegramRepository.completeNotification(key, messageId);
    } catch (error) {
      await this.telegramRepository.failNotification(key, error instanceof Error ? error.message : "Unknown inbound notification error");
      throw error;
    }
  }

  async notifyAiOutbound(conversationId: string, messageId: string, content: string): Promise<void> {
    const watch = await this.telegramRepository.getWatch(this.operatorChatId);
    if (watch?.conversationId !== conversationId) return;
    const key = `watch-ai-outbound:${messageId}`;
    if (!await this.telegramRepository.claimNotification(key, conversationId, "WATCH_AI_MESSAGE")) return;
    try {
      const telegramMessageId = await this.telegram.sendMessage(
        this.operatorChatId,
        `🤖 Valentina (IA)\n${content}`,
        observerKeyboard(conversationId, true),
      );
      await this.telegramRepository.completeNotification(key, telegramMessageId);
    } catch (error) {
      await this.telegramRepository.failNotification(key, error instanceof Error ? error.message : "Unknown outbound mirror error");
      throw error;
    }
  }

  private async handleCallback(callbackId: string, data: string): Promise<void> {
    const [action, conversationId] = data.split(":", 2);
    try {
      if (!conversationId || !["take", "context", "view", "refresh", "watch", "unwatch", "close", "release"].includes(action)) {
        await this.telegram.answerCallback(callbackId, "Acción inválida");
        return;
      }
      if (action === "take") await this.take(conversationId);
      if (action === "context" || action === "view" || action === "refresh") await this.sendContext(conversationId);
      if (action === "watch") await this.startWatching(conversationId);
      if (action === "unwatch") await this.stopWatching();
      if (action === "close") await this.telegram.sendMessage(this.operatorChatId, "Vista cerrada.");
      if (action === "release") await this.releaseActive(conversationId);
      await this.telegram.answerCallback(callbackId);
    } catch (error) {
      await this.telegram.answerCallback(callbackId, "No se pudo completar la acción").catch(() => undefined);
      throw error;
    }
  }

  private async take(conversationId: string): Promise<void> {
    const before = await this.repository.getConversationContext(conversationId);
    if (before.status === "AI_ACTIVE") await this.repository.transitionConversation(conversationId, "HUMAN_REQUIRED");
    const result = await this.telegramRepository.takeConversation(this.operatorChatId, conversationId);
    if (result.result === "OPERATOR_BUSY" && result.activeConversationId) {
      const active = await this.repository.getConversationContext(result.activeConversationId);
      await this.telegram.sendMessage(
        this.operatorChatId,
        `Ya tienes una conversación activa con ${displayName(active)}. Libérala antes de tomar otra.`,
        releaseKeyboard(active.id),
      );
      return;
    }
    if (result.result === "NOT_AVAILABLE") {
      await this.telegram.sendMessage(this.operatorChatId, "La conversación ya no está disponible para tomar.");
      return;
    }
    await this.telegramRepository.stopWatching(this.operatorChatId);
    const context = await this.repository.getConversationContext(result.activeConversationId ?? conversationId);
    await this.telegram.sendMessage(
      this.operatorChatId,
      `✅ Conversación tomada\n\n${displayName(context)}\nEstado: HUMANO ACTIVO\n\nAhora puedes responder desde Telegram.`,
      releaseKeyboard(context.id),
    );
  }

  private async forwardHumanMessage(updateId: number, text: string): Promise<void> {
    const assignment = await this.telegramRepository.getActiveAssignment(this.operatorChatId);
    if (!assignment) {
      const watch = await this.telegramRepository.getWatch(this.operatorChatId);
      if (watch) {
        await this.telegram.sendMessage(
          this.operatorChatId,
          "Estás observando esta conversación. Para responder al cliente, primero pulsa ‘Tomar conversación’.",
        );
        return;
      }
      await this.telegram.sendMessage(this.operatorChatId, NO_ACTIVE);
      return;
    }
    try {
      await this.manualReply.send(assignment.conversationId, text, `telegram-update:${updateId}`);
      await this.telegramRepository.recordEvent(assignment.conversationId, "HUMAN_MESSAGE", {
        operator_chat_id: this.operatorChatId,
        telegram_update_id: updateId,
      });
      await this.telegram.sendMessage(this.operatorChatId, "✅ Mensaje enviado por WhatsApp.");
    } catch (error) {
      this.logger.error("telegram_human_reply_error", {
        conversationId: assignment.conversationId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      await this.telegram.sendMessage(this.operatorChatId, "❌ No se pudo enviar el mensaje por WhatsApp.");
    }
  }

  private async sendStatus(): Promise<void> {
    const assignment = await this.telegramRepository.getActiveAssignment(this.operatorChatId);
    const watch = await this.telegramRepository.getWatch(this.operatorChatId);
    const activeContext = assignment ? await this.repository.getConversationContext(assignment.conversationId) : null;
    const watchContext = watch ? await this.repository.getConversationContext(watch.conversationId) : null;
    await this.telegram.sendMessage(this.operatorChatId, [
      "🧑 Conversación humana activa:",
      activeContext ? displayName(activeContext) : "Ninguna",
      "",
      "👀 Observando:",
      watchContext ? `${displayName(watchContext)} · WhatsApp · ${watchContext.status}` : "Ninguna",
    ].join("\n"), activeContext ? releaseKeyboard(activeContext.id) : watchContext ? observerKeyboard(watchContext.id, true) : undefined);
  }

  private async sendRecent(): Promise<void> {
    const recent = await this.telegramRepository.listRecentConversations(8);
    if (recent.length === 0) {
      await this.telegram.sendMessage(this.operatorChatId, "📋 No hay conversaciones recientes.");
      return;
    }
    const text = ["📋 Conversaciones recientes", "", ...recent.flatMap((item) => [
      item.contactName || item.contactAddress,
      `${item.channel} · ${item.status}`,
      `“${(item.lastMessage ?? "Sin mensajes").slice(0, 90)}”`,
      "",
    ])].join("\n").slice(0, 4000);
    const keyboard = recent.map((item) => [
      { text: `Ver · ${(item.contactName || item.contactAddress).slice(0, 24)}`, callback_data: `view:${item.id}` },
      ...(item.status === "HUMAN_REQUIRED" ? [{ text: "Tomar", callback_data: `take:${item.id}` }] : []),
    ]);
    await this.telegram.sendMessage(this.operatorChatId, text, keyboard);
  }

  private async startWatching(conversationId: string): Promise<void> {
    const context = await this.repository.getConversationContext(conversationId);
    await this.telegramRepository.startWatching(this.operatorChatId, conversationId);
    await this.telegram.sendMessage(
      this.operatorChatId,
      `👀 Siguiendo a ${displayName(context)}. Valentina (IA) continúa activa normalmente.`,
      observerKeyboard(conversationId, true),
    );
  }

  private async stopWatching(): Promise<void> {
    await this.telegramRepository.stopWatching(this.operatorChatId);
    await this.telegram.sendMessage(this.operatorChatId, "Ya no estás siguiendo esta conversación.");
  }

  private async sendContext(conversationId: string): Promise<void> {
    const context = await this.repository.getConversationContext(conversationId);
    const reason = await this.telegramRepository.getEscalationReason(conversationId);
    const relevant = [
      ...context.memory.relevantClientData,
      ...context.memory.needsAndInterests,
      ...context.memory.agreementsAndCommitments,
      ...context.memory.appointmentsAndPending,
      ...context.memory.importantObjections,
      ...context.memory.humanHandoffNotes,
    ].slice(0, 8);
    const messages = context.messages.slice(-15).map((message) =>
      `${message.direction === "INBOUND" ? `👤 ${displayName(context)}` : message.senderType === "HUMAN" ? "🧑 Alejandro" : "🤖 Valentina (IA)"}\n${message.content}`
    );
    const watch = await this.telegramRepository.getWatch(this.operatorChatId);
    await this.telegram.sendMessage(this.operatorChatId, [
      `👤 ${displayName(context)}`,
      ...(company(context.memory) ? [`Empresa: ${company(context.memory)}`] : []),
      `WhatsApp: ${phone(context)}`,
      `Estado: ${context.status}`,
      `Motivo: ${reason ?? "No especificado"}`,
      "",
      "Memoria relevante:",
      relevant.length ? relevant.map((item) => `• ${item}`).join("\n") : "Sin datos relevantes todavía.",
      "",
      "Resumen:",
      compactSummary(context.memory),
      "",
      "Últimos mensajes:",
      messages.join("\n") || "Sin mensajes.",
    ].join("\n").slice(0, 4000), context.status === "HUMAN_ACTIVE" ? releaseKeyboard(context.id) : observerKeyboard(context.id, watch?.conversationId === context.id));
  }

  private async releaseActive(expectedConversationId?: string): Promise<void> {
    const assignment = await this.telegramRepository.getActiveAssignment(this.operatorChatId);
    if (!assignment || (expectedConversationId && assignment.conversationId !== expectedConversationId)) {
      await this.telegram.sendMessage(this.operatorChatId, NO_ACTIVE);
      return;
    }
    const context = await this.repository.getConversationContext(assignment.conversationId);
    const handoffMessages = context.messages.filter((message) =>
      new Date(message.occurredAt).getTime() >= new Date(assignment.assignedAt).getTime()
    );
    const extracted = await this.memoryExtractor.extract(context.memory, handoffMessages);
    if (extracted.relevant) {
      await this.repository.mergeContactMemory({
        contactId: context.contactId,
        sourceInteractionId: `telegram-release:${assignment.id}`,
        memory: extracted.memory,
      });
    }
    const released = await this.telegramRepository.releaseConversation(this.operatorChatId);
    if (released.result === "NO_ACTIVE") {
      await this.telegram.sendMessage(this.operatorChatId, NO_ACTIVE);
      return;
    }
    await this.telegram.sendMessage(
      this.operatorChatId,
      "🤖 Conversación devuelta a Valentina (IA)\n\nElla continuará con el contexto actualizado.",
    );
  }
}
