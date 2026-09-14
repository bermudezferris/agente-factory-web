export function metaTextWebhook(overrides?: {
  messageId?: string;
  phoneNumberId?: string;
  from?: string;
  text?: string;
}) {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "WABA_ID",
        changes: [
          {
            field: "messages",
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15550001111",
                phone_number_id: overrides?.phoneNumberId ?? "PHONE_NUMBER_ID",
              },
              contacts: [
                {
                  profile: { name: "Ada Example" },
                  wa_id: overrides?.from ?? "15551234567",
                },
              ],
              messages: [
                {
                  from: overrides?.from ?? "15551234567",
                  id: overrides?.messageId ?? "wamid.TEST_MESSAGE",
                  timestamp: "1789257600",
                  text: { body: overrides?.text ?? "Hola" },
                  type: "text",
                },
              ],
            },
          },
        ],
      },
    ],
  };
}
