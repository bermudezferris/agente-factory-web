export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logger } = await import("@/utils/logger");
    logger.info("server_started", { runtime: "nodejs" });
  }
}
