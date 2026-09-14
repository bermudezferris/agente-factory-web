import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { MetaWhatsAppAdapter } from "@/services/whatsapp/meta-whatsapp-adapter";
import { metaTextWebhook } from "@/test/fixtures/meta-webhook";

describe("MetaWhatsAppAdapter", () => {
  const adapter = new MetaWhatsAppAdapter();

  it("validates Meta's sha256 webhook signature", () => {
    const body = JSON.stringify({ hello: "world" });
    const secret = "test-secret";
    const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

    expect(adapter.verifySignature(body, signature, secret)).toBe(true);
    expect(adapter.verifySignature(body, "sha256=" + "0".repeat(64), secret)).toBe(false);
    expect(adapter.verifySignature(body, null, secret)).toBe(false);
  });

  it("parses a minimal inbound text message", () => {
    const result = adapter.parse(metaTextWebhook());

    expect(result).toEqual({
      recognized: true,
      ignoredCount: 0,
      messages: [
        {
          whatsappMessageId: "wamid.TEST_MESSAGE",
          phoneNumberId: "PHONE_NUMBER_ID",
          senderWaId: "15551234567",
          recipientPhoneNumber: "15550001111",
          senderDisplayName: "Ada Example",
          text: "Hola",
          occurredAt: "2026-09-13T00:00:00.000Z",
          metadata: { meta_message_type: "text" },
        },
      ],
    });
  });

  it("ignores statuses, unsupported message types and unrelated payloads", () => {
    expect(adapter.parse({ object: "page", entry: [] })).toEqual({
      recognized: false,
      messages: [],
      ignoredCount: 1,
    });

    const statusPayload = metaTextWebhook() as Record<string, unknown>;
    const entry = statusPayload.entry as Array<Record<string, unknown>>;
    const changes = entry[0].changes as Array<Record<string, unknown>>;
    changes[0].value = { statuses: [{ id: "wamid.STATUS", status: "delivered" }] };

    expect(adapter.parse(statusPayload)).toEqual({
      recognized: true,
      messages: [],
      ignoredCount: 1,
    });
  });
});
