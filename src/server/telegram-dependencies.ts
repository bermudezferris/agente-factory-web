import { createHash } from "node:crypto";

import { getAppEnv } from "@/config/env";
import { createSupabaseConversationRepository } from "@/repositories/supabase-conversation-repository";
import { createTelegramConsoleRepository } from "@/repositories/telegram-console-repository";
import { OpenAIHandoffMemoryExtractor } from "@/services/ai/handoff-memory-extractor";
import { ManualReplyService } from "@/services/conversations/manual-reply-service";
import { TelegramBotClient } from "@/services/telegram/telegram-bot-client";
import { TelegramHumanConsoleService } from "@/services/telegram/telegram-human-console";
import { MetaWhatsAppClient } from "@/services/whatsapp/meta-whatsapp-client";
import { logger } from "@/utils/logger";

let dependencies: ReturnType<typeof buildDependencies> | undefined;

function buildDependencies() {
  const env = getAppEnv();
  if (!env.telegramBotToken) throw new Error("Missing required environment variable: TELEGRAM_BOT_TOKEN");
  if (!env.telegramOperatorChatId) throw new Error("Missing required environment variable: TELEGRAM_OPERATOR_CHAT_ID");
  if (!env.metaAccessToken) throw new Error("Missing required environment variable: META_ACCESS_TOKEN");
  if (!env.openAiApiKey) throw new Error("Missing required environment variable: OPENAI_API_KEY");

  const repository = createSupabaseConversationRepository(env.supabaseUrl, env.supabaseServiceRoleKey);
  const telegramRepository = createTelegramConsoleRepository(env.supabaseUrl, env.supabaseServiceRoleKey);
  const telegram = new TelegramBotClient(env.telegramBotToken);
  const service = new TelegramHumanConsoleService(
    repository,
    telegramRepository,
    telegram,
    new ManualReplyService(repository, new MetaWhatsAppClient(env.metaAccessToken)),
    new OpenAIHandoffMemoryExtractor(env.openAiApiKey, env.openAiModel),
    env.telegramOperatorChatId,
    logger,
  );
  return {
    service,
    webhookSecret: createHash("sha256").update(env.telegramBotToken).digest("hex"),
  };
}

export function getTelegramDependencies() {
  dependencies ??= buildDependencies();
  return dependencies;
}
