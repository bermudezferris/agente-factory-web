import type { AiProvider } from "@/services/ai/openai-responses-provider";
import type { WhatsAppClient } from "@/services/whatsapp/meta-whatsapp-client";
import type { ConversationRepository, IngestResult } from "@/repositories/conversation-repository";
import type { Logger } from "@/utils/logger";

export class AutoReplyService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly ai: AiProvider,
    private readonly whatsapp: WhatsAppClient,
    private readonly logger: Logger,
  ) {}

  async process(inbound: IngestResult): Promise<void> {
    let outboundMessageId: string | undefined;
    try {
      let conversation = await this.repository.getConversationContext(inbound.conversationId);
      if (conversation.status !== "AI_ACTIVE") {
        this.logger.info("ai_reply_skipped", { conversationId: conversation.id, status: conversation.status });
        return;
      }

      const claim = await this.repository.claimOutboundMessage({
        conversation,
        idempotencyKey: `ai:${inbound.messageId}`,
        senderType: "AI_AGENT",
      });
      if (!claim.claimed || !claim.messageId) {
        this.logger.info("ai_reply_duplicate_ignored", { inboundMessageId: inbound.messageId });
        return;
      }
      outboundMessageId = claim.messageId;

      conversation = await this.repository.getConversationContext(inbound.conversationId);
      if (conversation.status !== "AI_ACTIVE") {
        await this.repository.failOutboundMessage(outboundMessageId, "conversation_state_changed");
        return;
      }
      const generated = await this.ai.generateReply({
        memory: conversation.memory,
        recentHistory: conversation.messages,
      });
      if (generated.memoryRelevant) {
        await this.repository.mergeContactMemory({
          contactId: conversation.contactId,
          sourceInteractionId: inbound.messageId,
          memory: generated.memoryUpdate,
        });
      }

      conversation = await this.repository.getConversationContext(inbound.conversationId);
      if (conversation.status !== "AI_ACTIVE") {
        await this.repository.failOutboundMessage(outboundMessageId, "conversation_state_changed");
        return;
      }
      const whatsappMessageId = await this.whatsapp.sendText(
        conversation.phoneNumberId,
        conversation.contactWaId,
        generated.reply,
      );
      await this.repository.completeOutboundMessage(outboundMessageId, whatsappMessageId, generated.reply);
      this.logger.info("ai_reply_sent", { conversationId: conversation.id, messageId: outboundMessageId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown auto-reply error";
      if (outboundMessageId) {
        try {
          await this.repository.failOutboundMessage(outboundMessageId, message);
        } catch (persistenceError) {
          this.logger.error("ai_reply_failure_persistence_error", {
            error: persistenceError instanceof Error ? persistenceError.message : "Unknown error",
          });
        }
      }
      this.logger.error("ai_reply_error", { error: message, inboundMessageId: inbound.messageId });
    }
  }
}
