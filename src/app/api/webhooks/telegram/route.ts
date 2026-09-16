import { handleTelegramWebhook } from "@/controllers/telegram-webhook-controller";
import { getTelegramDependencies } from "@/server/telegram-dependencies";
import { logger } from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  try {
    const dependencies = getTelegramDependencies();
    return await handleTelegramWebhook(request, { ...dependencies, logger });
  } catch (error) {
    logger.error("telegram_webhook_configuration_error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json({ error: "Server configuration error" }, { status: 500 });
  }
}
