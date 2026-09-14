import type { ConversationRepository } from "@/repositories/conversation-repository";
import type { InboundTextMessage } from "@/types/whatsapp";
import type { Logger } from "@/utils/logger";

export type IngestionSummary = {
  processed: number;
  duplicates: number;
  results: Awaited<ReturnType<ConversationRepository["ingestInboundTextMessage"]>>[];
};

export class InboundMessageService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly logger: Logger,
  ) {}

  async ingest(messages: InboundTextMessage[]): Promise<IngestionSummary> {
    let processed = 0;
    let duplicates = 0;
    const results: IngestionSummary["results"] = [];

    for (const message of messages) {
      const result = await this.repository.ingestInboundTextMessage(message);
      results.push(result);

      this.logger.info("channel_identified", {
        whatsappChannelId: result.whatsappChannelId,
        organizationId: result.organizationId,
      });
      this.logger.info(result.contactCreated ? "contact_created" : "contact_found", {
        contactId: result.contactId,
      });
      this.logger.info(result.conversationCreated ? "conversation_created" : "conversation_found", {
        conversationId: result.conversationId,
      });

      if (result.duplicate) {
        duplicates += 1;
        this.logger.info("duplicate_ignored", {
          whatsappMessageId: message.whatsappMessageId,
          messageId: result.messageId,
        });
      } else {
        processed += 1;
        this.logger.info("message_persisted", {
          whatsappMessageId: message.whatsappMessageId,
          messageId: result.messageId,
        });
      }
    }

    return { processed, duplicates, results };
  }
}
