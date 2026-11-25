import { describe, it, expect } from "vitest";
import { bookingLink } from "./booking-link";

describe("booking routes", () => {
  it("allows a blank referral directly to the existing calendar", () => {
    expect(bookingLink("  ", "https://calendar.app.google/example", "123")).toBe("https://calendar.app.google/example");
  });
  it("preserves spaces, accents and URL characters without sending a message", () => {
    const name = "María José & Ana + Pérez / #1";
    const url = new URL(bookingLink(name, "unused", "123"));
    expect(url.origin + url.pathname).toBe("https://wa.me/123");
    expect(url.searchParams.get("text")).toBe("Quiero reservar la Sesión gratuita de IA para tu negocio. Me recomendó: " + name);
  });
});
