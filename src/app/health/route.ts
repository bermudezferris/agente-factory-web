import { handleHealth } from "@/controllers/health-controller";
import { logger } from "@/utils/logger";

export const dynamic = "force-dynamic";

export function GET(): Response {
  logger.info("health_check");
  return handleHealth();
}
