export type AppEnv = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  metaWebhookVerifyToken: string;
  metaAppSecret: string;
  metaAccessToken?: string;
  openAiApiKey?: string;
  openAiModel: string;
  adminApiKey?: string;
};

function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAppEnv(): AppEnv {
  return {
    supabaseUrl: required("SUPABASE_URL"),
    supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    metaWebhookVerifyToken: required("META_WEBHOOK_VERIFY_TOKEN"),
    metaAppSecret: required("META_APP_SECRET"),
    metaAccessToken: process.env.META_ACCESS_TOKEN?.trim() || undefined,
    openAiApiKey: process.env.OPENAI_API_KEY?.trim() || undefined,
    openAiModel: process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
    adminApiKey: process.env.ADMIN_API_KEY?.trim() || undefined,
  };
}
