import { describe, expect, it, vi } from "vitest";

import { handleTelegramWebhook } from "@/controllers/telegram-webhook-controller";
import type { TelegramHumanConsoleService } from "@/services/telegram/telegram-human-console";
import type { Logger } from "@/utils/logger";

const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as Logger;
const service = { handleUpdate: vi.fn().mockResolvedValue(undefined) } as unknown as TelegramHumanConsoleService;

describe("Telegram webhook controller", () => {
  it("rejects requests without the Telegram webhook secret before reading updates", async () => {
    const response = await handleTelegramWebhook(new Request("https://example.test", {
      method: "POST",
      body: JSON.stringify({ update_id: 1 }),
    }), { webhookSecret: "secret", service, logger });
    expect(response.status).toBe(401);
    expect(service.handleUpdate).not.toHaveBeenCalled();
  });

  it("accepts an authenticated Telegram update", async () => {
    const update = { update_id: 2, message: { message_id: 2, chat: { id: 1271653065, type: "private" }, text: "/status" } };
    const response = await handleTelegramWebhook(new Request("https://example.test", {
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": "secret" },
      body: JSON.stringify(update),
    }), { webhookSecret: "secret", service, logger });
    expect(response.status).toBe(200);
    expect(service.handleUpdate).toHaveBeenCalledWith(update);
  });
});
