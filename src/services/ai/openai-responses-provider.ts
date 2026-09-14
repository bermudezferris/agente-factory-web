import type { ConversationMessage } from "@/repositories/conversation-repository";

export interface AiProvider {
  generateReply(history: ConversationMessage[]): Promise<string>;
}

export class OpenAIResponsesProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generateReply(history: ConversationMessage[]): Promise<string> {
    const input = history
      .filter((message) => message.content && message.status !== "FAILED")
      .map((message) => ({
        role: message.direction === "INBOUND" ? "user" : "assistant",
        content: message.content as string,
      }));

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        store: false,
        instructions:
          "Eres el agente general de AgenteFactory. Responde en el idioma del cliente, de forma clara, breve y profesional. Ayuda con información comercial, servicios y próximos pasos. No inventes precios, disponibilidad ni capacidades. Si el cliente pide hablar con una persona, confirma que el equipo dará seguimiento y no finjas ser humano.",
        input,
      }),
    });
    const body = (await response.json().catch(() => null)) as
      | { output_text?: string; error?: { message?: string } }
      | null;
    if (!response.ok) throw new Error(`OpenAI request failed: ${body?.error?.message ?? `HTTP ${response.status}`}`);

    const text = body?.output_text?.trim();
    if (!text) throw new Error("OpenAI returned an empty response");
    return text;
  }
}
