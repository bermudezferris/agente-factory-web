import { timingSafeEqual } from "node:crypto";

export function authorizeAdmin(request: Request, expected?: string): Response | null {
  if (!expected) return Response.json({ error: "Admin API is not configured" }, { status: 503 });
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
