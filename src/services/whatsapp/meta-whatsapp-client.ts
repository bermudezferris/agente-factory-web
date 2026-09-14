export interface WhatsAppClient {
  sendText(phoneNumberId: string, recipientWaId: string, text: string): Promise<string>;
}

export class MetaWhatsAppClient implements WhatsAppClient {
  constructor(
    private readonly accessToken: string,
    private readonly graphVersion = "v26.0",
  ) {}

  async sendText(phoneNumberId: string, recipientWaId: string, text: string): Promise<string> {
    const response = await fetch(
      `https://graph.facebook.com/${this.graphVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientWaId,
          type: "text",
          text: { preview_url: false, body: text },
        }),
      },
    );
    const body = (await response.json().catch(() => null)) as
      | { messages?: Array<{ id?: string }>; error?: { message?: string; code?: number } }
      | null;
    if (!response.ok) {
      throw new Error(
        `Meta send failed: ${body?.error?.message ?? `HTTP ${response.status}`} (${body?.error?.code ?? "unknown"})`,
      );
    }
    const messageId = body?.messages?.[0]?.id;
    if (!messageId) throw new Error("Meta send response did not include a message ID");
    return messageId;
  }
}
