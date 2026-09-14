import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202609140002_contact_persistent_memory.sql"),
  "utf8",
);

describe("contact persistent memory migration", () => {
  it("contains every required durable memory category and an idempotent merge RPC", () => {
    for (const field of [
      "relevant_client_data",
      "needs_and_interests",
      "agreements_and_commitments",
      "appointments_and_pending",
      "important_objections",
      "human_handoff_notes",
      "previous_conversations_summary",
    ]) {
      expect(sql).toContain(field);
    }
    expect(sql).toContain("create or replace function public.merge_contact_memory");
    expect(sql).toContain("source_interaction_ids");
    expect(sql).toContain("not (p_source_interaction_id = any(memories.source_interaction_ids))");
  });

  it("is additive and does not delete existing data", () => {
    expect(sql).not.toMatch(/\b(drop|delete|truncate)\b/i);
  });
});
