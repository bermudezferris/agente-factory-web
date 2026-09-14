import type { ConversationRepository } from "@/repositories/conversation-repository";
import type { WhatsAppClient } from "@/services/whatsapp/meta-whatsapp-client";

export class ManualReplyService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly whatsapp: WhatsAppClient,
  ) {}

  async send(conversationId: string, content: string, idempotencyKey: string): Promise<void> {
    const conversation = await this.repository.getConversationContext(conversationId);
    if (conversation.status !== "HUMAN_ACTIVE") {
      throw new Error("Manual replies require conversation status HUMAN_ACTIVE");
    }
    const claim = await this.repository.claimOutboundMessage({
      conversation,
      idempotencyKey: `human:${conversationId}:${idempotencyKey}`,
      senderType: "HUMAN",
    });
    if (!claim.claimed || !claim.messageId) return;

    try {
      const whatsappMessageId = await this.whatsapp.sendText(
        conversation.phoneNumberId,
        conversation.contactWaId,
        content,
      );
      await this.repository.completeOutboundMessage(claim.messageId, whatsappMessageId, content);
    } catch (error) {
      await this.repository.failOutboundMessage(
        claim.messageId,
        error instanceof Error ? error.message : "Unknown manual reply error",
      );
      throw error;
    }
  }
}
