import type { ContactMemory, ConversationMessage } from "@/repositories/conversation-repository";

export type HandoffMemoryResult = { relevant: boolean; memory: ContactMemory };

export interface HandoffMemoryExtractor {
  extract(memory: ContactMemory, messages: ConversationMessage[]): Promise<HandoffMemoryResult>;
}

type ResponseBody = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  error?: { message?: string };
};

function outputText(body: ResponseBody | null): string | undefined {
  if (body?.output_text) return body.output_text;
  return body?.output?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text")?.text;
}

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    relevant: { type: "boolean" },
    relevant_client_data: { type: "array", items: { type: "string" } },
    needs_and_interests: { type: "array", items: { type: "string" } },
    agreements_and_commitments: { type: "array", items: { type: "string" } },
    appointments_and_pending: { type: "array", items: { type: "string" } },
    important_objections: { type: "array", items: { type: "string" } },
    human_handoff_notes: { type: "array", items: { type: "string" } },
    previous_conversations_summary: { type: "string" },
  },
  required: [
    "relevant", "relevant_client_data", "needs_and_interests", "agreements_and_commitments",
    "appointments_and_pending", "important_objections", "human_handoff_notes",
    "previous_conversations_summary",
  ],
} as const;

export class OpenAIHandoffMemoryExtractor implements HandoffMemoryExtractor {
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async extract(memory: ContactMemory, messages: ConversationMessage[]): Promise<HandoffMemoryResult> {
    if (messages.length === 0) return { relevant: false, memory };
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${this.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        store: false,
        max_output_tokens: 2500,
        instructions: [
          "Extrae únicamente memoria durable y comercialmente relevante surgida durante una intervención humana de WhatsApp.",
          "Incluye datos confirmados del cliente, necesidades, intereses, acuerdos, compromisos, citas, pendientes, objeciones y notas útiles de handoff.",
          "Ignora saludos, charla casual, repeticiones, instrucciones internas y datos inciertos. No inventes información.",
          "Devuelve en las listas solo hechos nuevos; el servidor deduplica mediante el mecanismo de memoria existente.",
          "Actualiza el resumen acumulado de forma concisa. Si no hay nada durable nuevo, relevant=false, listas vacías y conserva el resumen anterior.",
          `MEMORIA EXISTENTE:\n${JSON.stringify(memory)}`,
        ].join("\n"),
        input: messages.map((message) => ({
          role: message.direction === "INBOUND" ? "user" : "assistant",
          content: message.content ?? "",
        })),
        text: { format: { type: "json_schema", name: "handoff_memory", strict: true, schema } },
      }),
    });
    const body = await response.json().catch(() => null) as ResponseBody | null;
    if (!response.ok) throw new Error(`OpenAI handoff memory failed: ${body?.error?.message ?? `HTTP ${response.status}`}`);
    const text = outputText(body);
    if (!text) throw new Error("OpenAI handoff memory returned no output");
    const result = JSON.parse(text) as {
      relevant: boolean;
      relevant_client_data: string[];
      needs_and_interests: string[];
      agreements_and_commitments: string[];
      appointments_and_pending: string[];
      important_objections: string[];
      human_handoff_notes: string[];
      previous_conversations_summary: string;
    };
    return {
      relevant: result.relevant,
      memory: {
        relevantClientData: result.relevant_client_data,
        needsAndInterests: result.needs_and_interests,
        agreementsAndCommitments: result.agreements_and_commitments,
        appointmentsAndPending: result.appointments_and_pending,
        importantObjections: result.important_objections,
        humanHandoffNotes: result.human_handoff_notes,
        previousConversationsSummary: result.previous_conversations_summary,
      },
    };
  }
}
