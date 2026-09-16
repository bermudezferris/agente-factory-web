export type TelegramMessage = {
  message_id: number;
  chat: { id: number; type: string };
  text?: string;
};

export type TelegramCallbackQuery = {
  id: string;
  from: { id: number };
  message?: TelegramMessage;
  data?: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

export type TelegramInlineKeyboard = Array<Array<{ text: string; callback_data: string }>>;
