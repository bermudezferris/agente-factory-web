export type InboundTextMessage = {
  whatsappMessageId: string;
  phoneNumberId: string;
  senderWaId: string;
  recipientPhoneNumber?: string;
  senderDisplayName?: string;
  text: string;
  occurredAt: string;
  metadata: Record<string, unknown>;
};

export type ParsedWebhook = {
  recognized: boolean;
  messages: InboundTextMessage[];
  ignoredCount: number;
};
