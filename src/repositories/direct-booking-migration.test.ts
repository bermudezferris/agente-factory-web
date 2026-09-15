import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202609150001_direct_calendar_appointments.sql"),
  "utf8",
);

describe("direct calendar appointments migration", () => {
  it("persists provider identity, attendee data, state and contact/conversation associations", () => {
    for (const field of [
      "organization_id",
      "conversation_id",
      "contact_id",
      "calendar_event_id",
      "source_interaction_id",
      "appointment_type",
      "starts_at",
      "ends_at",
      "blocked_until",
      "timezone",
      "attendee_name",
      "attendee_email",
      "company",
      "reason",
    ]) {
      expect(sql).toContain(field);
    }
    expect(sql).toContain("appointments_calendar_slot_exclusion");
    expect(sql).toContain("tstzrange(starts_at, blocked_until, '[)')");
    expect(sql).toContain("status in ('HOLD', 'BOOKED')");
  });

  it("is additive and does not delete existing data", () => {
    expect(sql).not.toMatch(/\b(drop|delete|truncate)\b/i);
  });
});
