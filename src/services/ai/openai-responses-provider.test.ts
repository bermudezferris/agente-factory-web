import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContactMemory, ConversationMessage } from "@/repositories/conversation-repository";
import { OpenAIResponsesProvider } from "@/services/ai/openai-responses-provider";

const memory: ContactMemory = {
  relevantClientData: ["Empresa: Acme"],
  needsAndInterests: ["Atención automatizada"],
  agreementsAndCommitments: ["Enviar propuesta"],
  appointmentsAndPending: ["Reunión el viernes"],
  importantObjections: ["Preocupación por tiempo de implementación"],
  humanHandoffNotes: ["Prefiere contacto por la mañana"],
  previousConversationsSummary: "Acme evaluó automatizar soporte durante una conversación anterior.",
};

const history: ConversationMessage[] = [
  {
    id: "message-2",
    direction: "INBOUND",
    senderType: "CONTACT",
    content: "¿Podemos confirmar la reunión?",
    occurredAt: "2026-09-14T12:00:00Z",
    status: "RECEIVED",
  },
];

afterEach(() => vi.unstubAllGlobals());

describe("OpenAIResponsesProvider persistent memory", () => {
  it("sends cross-conversation memory, its summary and current history before replying", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output: [
            {
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({
                    reply: "Sí, confirmemos la reunión del viernes.",
                    memory_relevant: true,
                    relevant_client_data: [],
                    needs_and_interests: [],
                    agreements_and_commitments: ["Confirmar reunión"],
                    appointments_and_pending: ["Reunión confirmada para el viernes"],
                    important_objections: [],
                    human_handoff_notes: [],
                    previous_conversations_summary:
                      "Acme evalúa automatizar soporte y confirmó una reunión para el viernes.",
                  }),
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new OpenAIResponsesProvider("secret", "gpt-test").generateReply({
      memory,
      recentHistory: history,
    });

    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(request.store).toBe(false);
    expect(request.instructions).toContain("Empresa: Acme");
    expect(request.instructions).toContain(memory.previousConversationsSummary);
    expect(request.input).toEqual([{ role: "user", content: "¿Podemos confirmar la reunión?" }]);
    expect(request.text.format.type).toBe("json_schema");
    expect(result.memoryUpdate.appointmentsAndPending).toEqual(["Reunión confirmada para el viernes"]);
  });
});
