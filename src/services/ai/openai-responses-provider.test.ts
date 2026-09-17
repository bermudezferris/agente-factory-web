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
                    human_handoff_required: false,
                    human_handoff_reason: "",
                    appointment_action: "NONE",
                    appointment_requested_start: null,
                    appointment_timezone: null,
                    attendee_name: null,
                    attendee_email: null,
                    attendee_company: null,
                    appointment_reason: null,
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
      appointment: null,
      contactWaId: "580000000000",
    });

    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(request.store).toBe(false);
    expect(request.instructions).toContain("Empresa: Acme");
    expect(request.instructions).toContain(memory.previousConversationsSummary);
    expect(request.instructions).toContain("Valentina (IA)");
    expect(request.instructions).toContain("Carlos (IA)");
    expect(request.instructions).not.toContain("https://calendar.app.google/");
    expect(request.instructions).toContain("recepción comercial junior");
    expect(request.instructions).toContain("No vendes tecnología: vendes una conversación útil y el siguiente paso");
    expect(request.instructions).toContain("el cierre comercial son que un prospecto con interés deje agendado");
    expect(request.instructions).toContain("Tu empresa tiene personas. Ahora también puede tener agentes.");
    expect(request.instructions).toContain("integrante digital del equipo con un trabajo concreto");
    expect(request.instructions).toContain("ahorrar tiempo, responder más rápido, atender mejor, vender más");
    expect(request.instructions).toContain("Atiende personas, no tickets");
    expect(request.instructions).toContain("escucha → entiende → conecta el problema con un posible agente");
    expect(request.instructions).toContain("Haz una sola pregunta simple por turno");
    expect(request.instructions).toContain("Eso vale la pena verlo bien en el diagnóstico. Si quieres, te busco dos espacios disponibles.");
    expect(request.instructions).toContain("No discutas, no persigas el cierre y no uses urgencia artificial");
    expect(request.instructions).toContain("humor contextual");
    expect(request.instructions).toContain("Yo, por ejemplo, soy uno de esos agentes");
    expect(request.instructions).toContain("No eres la consultora Senior");
    expect(request.instructions).toContain("nunca debe salir de WhatsApp");
    expect(request.instructions).toContain("español venezolano profesional");
    expect(request.instructions).toContain("No uses voseo");
    expect(request.instructions).toContain("Evita como apertura habitual “de una”, “dale”, “tranqui”, “full”");
    expect(request.instructions).toContain("Prefiere “¡Claro! 😊”, “Perfecto”, “Buenísimo”");
    expect(request.instructions).toContain("tienes, quieres, puedes, dime, cuéntame y haces");
    expect(request.instructions).toContain("revisión silenciosa");
    expect(request.instructions).toContain("human_handoff_required=true");
    expect(request.instructions).toContain("Interpreta las horas propuestas sin zona explícita en America/Caracas");
    expect(request.max_output_tokens).toBe(3000);
    expect(request.prompt_cache_key).toBe("agentefactory-valentina-reception-v2");
    expect(request.instructions).toContain("una sola respuesta final compacta por turno");
    expect(request.instructions).toContain("por debajo de 300 caracteres");
    expect(request.instructions).toContain("una sola pregunta o CTA principal");
    expect(request.instructions).toContain("No repitas duración, gratuidad, consultor Senior");
      expect(request.instructions).toContain("¿Cuándo podemos hacer una videollamada?”, usa SUGGEST");
    expect(request.instructions).toContain("Una solicitud antigua o pendiente guardada en memoria no autoriza reutilizar ese horario");
    expect(request.instructions).toContain("usa SUGGEST para consultar Calendar y ofrecer dos espacios reales");
    expect(request.instructions).toContain("Nunca guardes en memoria persistente fechas u horas tentativas");
    expect(request.instructions).toContain("Te entusiasma genuinamente el potencial de la inteligencia artificial");
    expect(request.instructions).toContain("avance, tranquilidad");
    expect(request.instructions).toContain("humor contextual, muy ligero y ocasional");
    expect(request.instructions).toContain("máximo un emoji");
    expect(request.instructions).toContain("El entusiasmo nunca justifica alargar la respuesta");
    expect(request.instructions).toContain("tono robótico o corporativo");
    expect(request.instructions).toContain("Si el contacto está molesto");
    expect(request.instructions).toContain("no respondas “Buenísimo”");
    expect(request.instructions).toContain("Un saludo aislado como hola, buenas, buen día, hey o qué tal nunca retoma agenda");
    expect(request.instructions).toContain("Tenemos tres clínicas");
    expect(request.instructions).toContain("Se nos acumulan los mensajes");
    expect(request.instructions).toContain("¿Qué hacen ustedes?");
    expect(request.instructions).toContain("No añadas un catálogo de tareas, términos técnicos ni CTA automático");
    expect(request.instructions).toContain("¿Dónde están ubicados?");
    expect(request.instructions).toContain("Responde la ubicación sin proponer automáticamente el diagnóstico");
    expect(request.instructions).toContain("¿Qué es un agente?");
    expect(request.instructions).toContain("Quiero saber cuánto cuesta");
    expect(request.instructions).toContain("No estoy seguro");
    expect(request.instructions).toContain("Lo voy a pensar");
    expect(request.instructions).toContain("Quiero agendar");
    expect(request.instructions).toContain("Esto parece complicado");
    expect(request.instructions).toContain("Estoy molesto porque nadie me respondió");
    expect(request.text.verbosity).toBe("low");
    expect(request.input).toEqual([{ role: "user", content: "¿Podemos confirmar la reunión?" }]);
    expect(request.text.format.type).toBe("json_schema");
    expect(result.memoryUpdate.appointmentsAndPending).toEqual(["Reunión confirmada para el viernes"]);
    expect(result.humanHandoffRequired).toBe(false);
    expect(result.appointmentRequest).toBeNull();
  });

  it("reports a response truncated by the output-token limit explicitly", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "incomplete",
      incomplete_details: { reason: "max_output_tokens" },
    }), { status: 200, headers: { "content-type": "application/json" } })));

    await expect(new OpenAIResponsesProvider("secret", "gpt-test").generateReply({
      memory,
      recentHistory: history,
      appointment: null,
    })).rejects.toThrow("OpenAI response incomplete: max_output_tokens");
  });

  it("returns a direct booking request only through the structured schema", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output_text: JSON.stringify({
        reply: "Voy a revisar ese horario.",
        memory_relevant: false,
        human_handoff_required: false,
        human_handoff_reason: "",
        appointment_action: "BOOK",
        appointment_requested_start: "2026-09-16T09:00:00-04:00",
        appointment_timezone: "America/Caracas",
        attendee_name: "María Pérez",
        attendee_email: "maria@example.com",
        attendee_company: "Acme",
        appointment_reason: "Automatizar soporte",
        relevant_client_data: [],
        needs_and_interests: [],
        agreements_and_commitments: [],
        appointments_and_pending: [],
        important_objections: [],
        human_handoff_notes: [],
        previous_conversations_summary: memory.previousConversationsSummary,
      }),
    }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new OpenAIResponsesProvider("secret", "gpt-test", {
      agentName: "Valentina (IA)",
      directBookingEnabled: true,
      bookingDurationMinutes: 25,
    }).generateReply({ memory, recentHistory: history, appointment: null });

    const request = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(request.instructions).toContain("nunca debe salir de WhatsApp");
    expect(request.instructions).toContain("appointment_requested_start");
    expect(request.instructions).toContain("SUGGEST: el contacto quiere agendar");
    expect(request.instructions).toContain("Nunca pidas nombre, correo o empresa antes de resolver el horario");
    expect(request.instructions).not.toContain("https://calendar.app.google/");
    expect(result.appointmentRequest).toEqual({
      action: "BOOK",
      requestedStart: "2026-09-16T09:00:00-04:00",
      timezone: "America/Caracas",
      attendeeName: "María Pérez",
      attendeeEmail: "maria@example.com",
      company: "Acme",
      reason: "Automatizar soporte",
      availabilityDate: null,
      dayPart: "ANY",
    });
  });

  it("treats a calendar action without a start time as conversational ambiguity", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      output_text: JSON.stringify({
        reply: "¿Te refieres a la segunda opción?",
        memory_relevant: false,
        human_handoff_required: false,
        human_handoff_reason: "",
        appointment_action: "CHECK",
        appointment_requested_start: null,
        appointment_timezone: "America/Caracas",
        attendee_name: null,
        attendee_email: null,
        attendee_company: null,
        appointment_reason: null,
        availability_date: null,
        availability_day_part: "ANY",
        relevant_client_data: [],
        needs_and_interests: [],
        agreements_and_commitments: [],
        appointments_and_pending: [],
        important_objections: [],
        human_handoff_notes: [],
        previous_conversations_summary: memory.previousConversationsSummary,
      }),
    }), { status: 200, headers: { "content-type": "application/json" } })));

    const result = await new OpenAIResponsesProvider("secret", "gpt-test").generateReply({
      memory,
      recentHistory: history,
      appointment: null,
    });

    expect(result.reply).toBe("¿Te refieres a la segunda opción?");
    expect(result.appointmentRequest).toBeNull();
    expect(result.humanHandoffRequired).toBe(false);
  });
});
