import { getAppEnv } from "@/config/env";
import { createSupabaseConversationRepository } from "@/repositories/supabase-conversation-repository";
import { ManualReplyService } from "@/services/conversations/manual-reply-service";
import { MetaWhatsAppClient } from "@/services/whatsapp/meta-whatsapp-client";

export function getAdminDependencies() {
  const env = getAppEnv();
  const repository = createSupabaseConversationRepository(env.supabaseUrl, env.supabaseServiceRoleKey);
  return {
    adminApiKey: env.adminApiKey,
    repository,
    manualReplyService: env.metaAccessToken
      ? new ManualReplyService(repository, new MetaWhatsAppClient(env.metaAccessToken))
      : undefined,
  };
}
