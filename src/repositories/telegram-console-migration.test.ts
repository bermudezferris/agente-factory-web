import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/202609160001_telegram_human_console.sql"), "utf8");

describe("Telegram Human Console migration", () => {
  it("adds assignments, update and notification idempotency plus atomic RPCs", () => {
    expect(sql).toContain("telegram_operator_assignments");
    expect(sql).toContain("telegram_webhook_updates");
    expect(sql).toContain("telegram_notifications");
    expect(sql).toContain("take_telegram_conversation");
    expect(sql).toContain("release_telegram_conversation");
    expect(sql).toContain("where status = 'ACTIVE'");
    expect(sql).toContain("HUMAN_TAKEOVER");
    expect(sql).toContain("HUMAN_RELEASE");
    expect(sql).toContain("AI_RESUMED");
  });

  it("is additive and non-destructive", () => {
    expect(sql).not.toMatch(/\bdrop\b/i);
    expect(sql).not.toMatch(/\bdelete\b/i);
    expect(sql).not.toMatch(/\btruncate\b/i);
  });
});
