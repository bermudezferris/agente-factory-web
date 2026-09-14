import { getAdminDependencies } from "@/server/admin-dependencies";
import { requestHuman } from "@/services/conversations/handoff-service";
import { authorizeAdmin } from "@/utils/admin-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const dependencies = getAdminDependencies();
    const denied = authorizeAdmin(request, dependencies.adminApiKey);
    if (denied) return denied;
    const { id } = await context.params;
    await requestHuman(dependencies.repository, id);
    return Response.json({ status: "HUMAN_REQUIRED" });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 });
  }
}
