import { describe, expect, it } from "vitest";

import {
  BOOKING_TIME_ZONE,
  BookingSlotUnavailableError,
  validateBookingStart,
} from "@/services/calendar/google-calendar-booking-client";

const now = new Date("2026-09-15T12:00:00.000Z");

describe("Google Calendar booking schedule", () => {
  it("uses Venezuela time without daylight-saving drift", () => {
    expect(BOOKING_TIME_ZONE).toBe("America/Caracas");
  });

  it("accepts a current 25-minute slot on the existing schedule", () => {
    const result = validateBookingStart("2026-09-16T09:00:00-04:00", now);
    expect(result.start.toISOString()).toBe("2026-09-16T13:00:00.000Z");
    expect(result.end.toISOString()).toBe("2026-09-16T13:25:00.000Z");
  });

  it("preserves the 20-minute spacing between appointment starts", () => {
    expect(() => validateBookingStart("2026-09-16T09:30:00-04:00", now)).toThrow(
      BookingSlotUnavailableError,
    );
    expect(() => validateBookingStart("2026-09-16T09:45:00-04:00", now)).not.toThrow();
  });

  it("rejects weekends and requests inside the four-hour lead time", () => {
    expect(() => validateBookingStart("2026-09-19T09:00:00-04:00", now)).toThrow(
      BookingSlotUnavailableError,
    );
    expect(() => validateBookingStart("2026-09-15T11:00:00-04:00", now)).toThrow(
      "al menos 4 horas",
    );
  });
});
