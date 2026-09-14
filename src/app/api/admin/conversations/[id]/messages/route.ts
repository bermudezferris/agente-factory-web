import { getAdminDependencies } from "@/server/admin-dependencies";
import { authorizeAdmin } from "@/utils/admin-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const dependencies = getAdminDependencies();
    const denied = authorizeAdmin(request, dependencies.adminApiKey);
    if (denied) return denied;
    if (!dependencies.manualReplyService) {
      return Response.json({ error: "Meta access token is not configured" }, { status: 503 });
    }
    const idempotencyKey = request.headers.get("idempotency-key")?.trim();
    if (!idempotencyKey) return Response.json({ error: "Idempotency-Key header is required" }, { status: 400 });
    const body = (await request.json()) as { content?: unknown };
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content || content.length > 4096) {
      return Response.json({ error: "content must contain 1 to 4096 characters" }, { status: 400 });
    }
    const { id } = await context.params;
    await dependencies.manualReplyService.send(id, content, idempotencyKey);
    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 });
  }
}
