import type { InboundMessageService } from "@/services/conversations/ingest-inbound-messages";
import type { MetaWhatsAppAdapter } from "@/services/whatsapp/meta-whatsapp-adapter";
import type { Logger } from "@/utils/logger";
import type { AutoReplyService } from "@/services/conversations/auto-reply-service";
import type { HumanConsoleNotifier } from "@/services/telegram/telegram-human-console";

export type WebhookDependencies = {
  verifyToken: string;
  appSecret: string;
  adapter: MetaWhatsAppAdapter;
  ingestionService: InboundMessageService;
  logger: Logger;
  autoReplyService?: AutoReplyService;
  humanConsoleNotifier?: HumanConsoleNotifier;
};

export function handleWebhookVerification(request: Request, dependencies: WebhookDependencies): Response {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  dependencies.logger.info("webhook_verification_request", {
    mode,
    hasChallenge: challenge !== null,
  });

  if (mode === "subscribe" && token === dependencies.verifyToken && challenge !== null) {
    return new Response(challenge, { status: 200, headers: { "content-type": "text/plain" } });
  }

  return Response.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function handleWebhookReceipt(
  request: Request,
  dependencies: WebhookDependencies,
): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!dependencies.adapter.verifySignature(rawBody, signature, dependencies.appSecret)) {
    dependencies.logger.warn("webhook_signature_invalid");
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    dependencies.logger.warn("webhook_json_invalid");
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  dependencies.logger.info("webhook_received", { contentLength: rawBody.length });
  const parsed = dependencies.adapter.parse(payload);

  if (!parsed.recognized || parsed.messages.length === 0) {
    dependencies.logger.info("payload_ignored", {
      recognized: parsed.recognized,
      ignoredCount: parsed.ignoredCount,
    });
    return Response.json({ received: true, processed: 0, duplicates: 0 });
  }

  dependencies.logger.info("payload_identified", {
    textMessageCount: parsed.messages.length,
    ignoredCount: parsed.ignoredCount,
  });

  try {
    const { results, ...summary } = await dependencies.ingestionService.ingest(parsed.messages);
    if (dependencies.humanConsoleNotifier) {
      for (const result of results) {
        if (!result.duplicate) await dependencies.humanConsoleNotifier.notifyInboundDuringHumanActive(result);
      }
    }
    if (dependencies.autoReplyService) {
      for (const result of results) await dependencies.autoReplyService.process(result);
    } else {
      dependencies.logger.info("ai_reply_disabled", { reason: "missing_configuration" });
    }
    return Response.json({ received: true, ...summary });
  } catch (error) {
    dependencies.logger.error("webhook_processing_error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
