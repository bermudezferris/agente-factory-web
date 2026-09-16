import { timingSafeEqual } from "node:crypto";

import type { TelegramHumanConsoleService } from "@/services/telegram/telegram-human-console";
import type { TelegramUpdate } from "@/types/telegram";
import type { Logger } from "@/utils/logger";

export type TelegramWebhookDependencies = {
  webhookSecret: string;
  service: TelegramHumanConsoleService;
  logger: Logger;
};

function secretMatches(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function handleTelegramWebhook(
  request: Request,
  dependencies: TelegramWebhookDependencies,
): Promise<Response> {
  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"), dependencies.webhookSecret)) {
    dependencies.logger.warn("telegram_webhook_secret_invalid");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  let update: TelegramUpdate;
  try {
    update = await request.json() as TelegramUpdate;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Number.isSafeInteger(update.update_id)) return Response.json({ error: "Invalid update" }, { status: 400 });
  try {
    await dependencies.service.handleUpdate(update);
    return Response.json({ received: true });
  } catch (error) {
    dependencies.logger.error("telegram_webhook_processing_error", {
      updateId: update.update_id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
