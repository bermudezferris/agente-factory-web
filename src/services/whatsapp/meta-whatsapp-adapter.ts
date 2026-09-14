import { createHmac, timingSafeEqual } from "node:crypto";

import type { InboundTextMessage, ParsedWebhook } from "@/types/whatsapp";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export class MetaWhatsAppAdapter {
  verifySignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
    if (!signatureHeader?.startsWith("sha256=") || !appSecret) return false;

    const suppliedHex = signatureHeader.slice("sha256=".length);
    if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;

    const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest();
    const supplied = Buffer.from(suppliedHex, "hex");

    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
  }

  parse(payload: unknown): ParsedWebhook {
    if (!isRecord(payload) || payload.object !== "whatsapp_business_account") {
      return { recognized: false, messages: [], ignoredCount: 1 };
    }

    const messages: InboundTextMessage[] = [];
    let ignoredCount = 0;
    const entries = Array.isArray(payload.entry) ? payload.entry : [];

    for (const entry of entries) {
      if (!isRecord(entry) || !Array.isArray(entry.changes)) {
        ignoredCount += 1;
        continue;
      }

      for (const change of entry.changes) {
        if (!isRecord(change) || change.field !== "messages" || !isRecord(change.value)) {
          ignoredCount += 1;
          continue;
        }

        const value = change.value;
        const metadata = isRecord(value.metadata) ? value.metadata : {};
        const phoneNumberId = stringValue(metadata.phone_number_id);
        const recipientPhoneNumber = stringValue(metadata.display_phone_number);
        const contacts = Array.isArray(value.contacts) ? value.contacts : [];
        const namesByWaId = new Map<string, string>();

        for (const contact of contacts) {
          if (!isRecord(contact)) continue;
          const waId = stringValue(contact.wa_id);
          const profile = isRecord(contact.profile) ? contact.profile : {};
          const name = stringValue(profile.name);
          if (waId && name) namesByWaId.set(waId, name);
        }

        const rawMessages = Array.isArray(value.messages) ? value.messages : [];
        if (rawMessages.length === 0) ignoredCount += 1;

        for (const rawMessage of rawMessages) {
          if (!isRecord(rawMessage)) {
            ignoredCount += 1;
            continue;
          }

          const text = isRecord(rawMessage.text) ? stringValue(rawMessage.text.body) : undefined;
          const id = stringValue(rawMessage.id);
          const from = stringValue(rawMessage.from);
          const timestamp = stringValue(rawMessage.timestamp);

          if (rawMessage.type !== "text" || !text || !id || !from || !phoneNumberId || !timestamp) {
            ignoredCount += 1;
            continue;
          }

          const seconds = Number(timestamp);
          if (!Number.isFinite(seconds)) {
            ignoredCount += 1;
            continue;
          }

          const contextualMetadata: Record<string, unknown> = { meta_message_type: "text" };
          if (isRecord(rawMessage.context)) contextualMetadata.context = rawMessage.context;
          if (isRecord(rawMessage.referral)) contextualMetadata.referral = rawMessage.referral;

          messages.push({
            whatsappMessageId: id,
            phoneNumberId,
            senderWaId: from,
            recipientPhoneNumber,
            senderDisplayName: namesByWaId.get(from),
            text,
            occurredAt: new Date(seconds * 1000).toISOString(),
            metadata: contextualMetadata,
          });
        }
      }
    }

    return { recognized: true, messages, ignoredCount };
  }
}
