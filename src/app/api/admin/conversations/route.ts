import { getAdminDependencies } from "@/server/admin-dependencies";
import { authorizeAdmin } from "@/utils/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const dependencies = getAdminDependencies();
    const denied = authorizeAdmin(request, dependencies.adminApiKey);
    if (denied) return denied;
    return Response.json({ conversations: await dependencies.repository.listConversations() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 });
  }
}
