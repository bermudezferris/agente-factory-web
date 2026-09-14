import type { ContactMemory, ConversationMessage } from "@/repositories/conversation-repository";

export type AiReplyInput = {
  memory: ContactMemory;
  recentHistory: ConversationMessage[];
};

export type AiReplyResult = {
  reply: string;
  memoryRelevant: boolean;
  memoryUpdate: ContactMemory;
};

export interface AiProvider {
  generateReply(input: AiReplyInput): Promise<AiReplyResult>;
}

type ResponsesBody = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  error?: { message?: string };
};

const memorySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" },
    memory_relevant: { type: "boolean" },
    relevant_client_data: { type: "array", items: { type: "string" } },
    needs_and_interests: { type: "array", items: { type: "string" } },
    agreements_and_commitments: { type: "array", items: { type: "string" } },
    appointments_and_pending: { type: "array", items: { type: "string" } },
    important_objections: { type: "array", items: { type: "string" } },
    human_handoff_notes: { type: "array", items: { type: "string" } },
    previous_conversations_summary: { type: "string" },
  },
  required: [
    "reply",
    "memory_relevant",
    "relevant_client_data",
    "needs_and_interests",
    "agreements_and_commitments",
    "appointments_and_pending",
    "important_objections",
    "human_handoff_notes",
    "previous_conversations_summary",
  ],
} as const;

function responseText(body: ResponsesBody | null): string | undefined {
  if (body?.output_text) return body.output_text;
  return body?.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text")
    ?.text;
}

export class OpenAIResponsesProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generateReply(input: AiReplyInput): Promise<AiReplyResult> {
    const recentHistory = input.recentHistory
      .filter((message) => message.content && message.status !== "FAILED")
      .map((message) => ({
        role: message.direction === "INBOUND" ? "user" : "assistant",
        content:
          message.senderType === "HUMAN"
            ? `[Mensaje previo del equipo humano] ${message.content as string}`
            : (message.content as string),
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
        instructions: [
          "Eres el agente general de AgenteFactory. Responde en el idioma del cliente, de forma clara, breve y profesional.",
          "Ayuda con información comercial, servicios y próximos pasos. No inventes precios, disponibilidad ni capacidades.",
          "Si el cliente pide hablar con una persona, confirma que el equipo dará seguimiento y no finjas ser humano.",
          "Usa la memoria persistente como contexto, pero no la menciones salvo que sea natural y útil.",
          "Extrae únicamente información durable y relevante: datos del cliente, necesidades, intereses, acuerdos, compromisos, citas, pendientes, objeciones y notas explícitas de handoff humano.",
          "No guardes saludos, charla casual, datos triviales, inferencias inciertas ni información sensible que no sea necesaria para atender al cliente.",
          "Devuelve en las listas solo hechos nuevos de esta interacción; el servidor los combinará y eliminará duplicados.",
          "Marca memory_relevant=false si no hay información durable nueva y devuelve las listas vacías.",
          "previous_conversations_summary debe ser un resumen acumulado, conciso y actualizado usando el resumen anterior y la interacción actual; si no cambia, conserva exactamente el resumen anterior.",
          `MEMORIA PERSISTENTE DEL CONTACTO Y RESUMEN ANTERIOR:\n${JSON.stringify(input.memory)}`,
        ].join("\n"),
        input: recentHistory,
        text: {
          format: {
            type: "json_schema",
            name: "agent_reply_and_contact_memory",
            strict: true,
            schema: memorySchema,
          },
        },
      }),
    });
    const body = (await response.json().catch(() => null)) as ResponsesBody | null;
    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${body?.error?.message ?? `HTTP ${response.status}`}`);
    }

    const text = responseText(body)?.trim();
    if (!text) throw new Error("OpenAI returned an empty response");

    let result: {
      reply: string;
      memory_relevant: boolean;
      relevant_client_data: string[];
      needs_and_interests: string[];
      agreements_and_commitments: string[];
      appointments_and_pending: string[];
      important_objections: string[];
      human_handoff_notes: string[];
      previous_conversations_summary: string;
    };
    try {
      result = JSON.parse(text) as typeof result;
    } catch {
      throw new Error("OpenAI returned invalid structured memory JSON");
    }
    if (!result.reply.trim()) throw new Error("OpenAI returned an empty reply");

    return {
      reply: result.reply.trim(),
      memoryRelevant: result.memory_relevant,
      memoryUpdate: {
        relevantClientData: result.relevant_client_data,
        needsAndInterests: result.needs_and_interests,
        agreementsAndCommitments: result.agreements_and_commitments,
        appointmentsAndPending: result.appointments_and_pending,
        importantObjections: result.important_objections,
        humanHandoffNotes: result.human_handoff_notes,
        previousConversationsSummary: result.previous_conversations_summary.trim(),
      },
    };
  }
}
