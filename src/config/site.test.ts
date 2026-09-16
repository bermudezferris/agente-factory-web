import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";

describe("Valentina WhatsApp CTA", () => {
  it("uses the production number and exact encoded prefilled message", () => {
    const message = "Hola Valentina, cuéntame cómo AgenteFactory podría ayudarme.";

    expect(siteConfig.contact.whatsappNumber).toBe("584129097101");
    expect(siteConfig.contact.whatsappMessage).toBe(message);
    expect(siteConfig.contact.whatsappHref).toBe(
      `https://wa.me/584129097101?text=${encodeURIComponent(message)}`,
    );
  });
});
