import type { TelegramInlineKeyboard } from "@/types/telegram";

type TelegramResponse<T> = { ok: boolean; result?: T; description?: string };

export interface TelegramClient {
  sendMessage(chatId: string, text: string, keyboard?: TelegramInlineKeyboard): Promise<number>;
  answerCallback(callbackQueryId: string, text?: string): Promise<void>;
}

export class TelegramBotClient implements TelegramClient {
  constructor(private readonly token: string) {}

  private async call<T>(method: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null) as TelegramResponse<T> | null;
    if (!response.ok || !payload?.ok || payload.result === undefined) {
      throw new Error(`Telegram ${method} failed: ${payload?.description ?? `HTTP ${response.status}`}`);
    }
    return payload.result;
  }

  async sendMessage(chatId: string, text: string, keyboard?: TelegramInlineKeyboard): Promise<number> {
    const result = await this.call<{ message_id: number }>("sendMessage", {
      chat_id: chatId,
      text,
      ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
    });
    return result.message_id;
  }

  async answerCallback(callbackQueryId: string, text?: string): Promise<void> {
    await this.call("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      ...(text ? { text } : {}),
    });
  }
}
