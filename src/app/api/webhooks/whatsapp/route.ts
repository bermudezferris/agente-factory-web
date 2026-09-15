import { getAppEnv } from "@/config/env";
import {
  handleWebhookReceipt,
  handleWebhookVerification,
  type WebhookDependencies,
} from "@/controllers/whatsapp-webhook-controller";
import { createSupabaseConversationRepository } from "@/repositories/supabase-conversation-repository";
import { InboundMessageService } from "@/services/conversations/ingest-inbound-messages";
import { MetaWhatsAppAdapter } from "@/services/whatsapp/meta-whatsapp-adapter";
import { logger } from "@/utils/logger";
import { AutoReplyService } from "@/services/conversations/auto-reply-service";
import { OpenAIResponsesProvider } from "@/services/ai/openai-responses-provider";
import { MetaWhatsAppClient } from "@/services/whatsapp/meta-whatsapp-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let dependencies: WebhookDependencies | undefined;

function getDependencies(): WebhookDependencies {
  if (dependencies) return dependencies;

  const env = getAppEnv();
  const repository = createSupabaseConversationRepository(
    env.supabaseUrl,
    env.supabaseServiceRoleKey,
  );

  dependencies = {
    verifyToken: env.metaWebhookVerifyToken,
    appSecret: env.metaAppSecret,
    adapter: new MetaWhatsAppAdapter(),
    ingestionService: new InboundMessageService(repository, logger),
    logger,
    autoReplyService:
      env.openAiApiKey && env.metaAccessToken
        ? new AutoReplyService(
            repository,
            new OpenAIResponsesProvider(env.openAiApiKey, env.openAiModel, {
              agentName: env.agentName,
              bookingUrl: env.bookingUrl,
            }),
            new MetaWhatsAppClient(env.metaAccessToken),
            logger,
          )
        : undefined,
  };

  logger.info("whatsapp_webhook_initialized");
  return dependencies;
}

export function GET(request: Request): Response {
  try {
    return handleWebhookVerification(request, getDependencies());
  } catch (error) {
    logger.error("webhook_configuration_error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ error: "Server configuration error" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    return await handleWebhookReceipt(request, getDependencies());
  } catch (error) {
    logger.error("webhook_request_error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ error: "Webhook request failed" }, { status: 500 });
  }
}
