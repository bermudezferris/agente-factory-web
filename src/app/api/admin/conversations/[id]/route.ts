import { getAdminDependencies } from "@/server/admin-dependencies";
import { authorizeAdmin } from "@/utils/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const dependencies = getAdminDependencies();
    const denied = authorizeAdmin(request, dependencies.adminApiKey);
    if (denied) return denied;
    const { id } = await context.params;
    return Response.json({ conversation: await dependencies.repository.getConversationContext(id) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 });
  }
}
