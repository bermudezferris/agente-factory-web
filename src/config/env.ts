export type AppEnv = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  metaWebhookVerifyToken: string;
  metaAppSecret: string;
  metaAccessToken?: string;
  openAiApiKey?: string;
  openAiModel: string;
  agentName: string;
  bookingUrl: string;
  googleCalendarId?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleRefreshToken?: string;
  bookingDurationMinutes: number;
  bookingBufferMinutes: number;
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
    agentName: process.env.AGENT_NAME?.trim() || "Valentina (IA)",
    bookingUrl:
      process.env.BOOKING_URL?.trim() || "https://calendar.app.google/g1tSBXA9rHXQ8tLW8",
    googleCalendarId: process.env.GOOGLE_CALENDAR_ID?.trim() || undefined,
    googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || undefined,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || undefined,
    googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN?.trim() || undefined,
    bookingDurationMinutes: Number(process.env.BOOKING_DURATION_MINUTES?.trim() || "25"),
    bookingBufferMinutes: Number(process.env.BOOKING_BUFFER_MINUTES?.trim() || "20"),
    adminApiKey: process.env.ADMIN_API_KEY?.trim() || undefined,
  };
}
