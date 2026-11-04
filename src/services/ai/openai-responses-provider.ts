import { buildValentinaPlaybook } from "@/config/valentina-playbook";
import type { Appointment, ContactMemory, ConversationMessage } from "@/repositories/conversation-repository";

export type AiReplyInput = {
  memory: ContactMemory;
  recentHistory: ConversationMessage[];
  appointment: Appointment | null;
  contactWaId?: string;
};

export type AppointmentAction = "NONE" | "SUGGEST" | "CHECK" | "BOOK" | "RESCHEDULE" | "CANCEL" | "LOOKUP";

export type AiReplyResult = {
  reply: string;
  memoryRelevant: boolean;
  memoryUpdate: ContactMemory;
  humanHandoffRequired: boolean;
  humanHandoffReason: string;
  appointmentRequest: {
    action: Exclude<AppointmentAction, "NONE">;
    requestedStart: string | null;
    timezone: string | null;
    attendeeName: string | null;
    attendeeEmail: string | null;
    company: string | null;
    reason: string | null;
    availabilityDate?: string | null;
    dayPart?: "ANY" | "MORNING" | "AFTERNOON" | "EARLIEST";
  } | null;
};

export interface AiProvider {
  generateReply(input: AiReplyInput): Promise<AiReplyResult>;
}

type ResponsesBody = {
  status?: "completed" | "incomplete" | "failed";
  incomplete_details?: { reason?: string } | null;
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
    human_handoff_required: { type: "boolean" },
    human_handoff_reason: { type: "string" },
    appointment_action: { type: "string", enum: ["NONE", "SUGGEST", "CHECK", "BOOK", "RESCHEDULE", "CANCEL", "LOOKUP"] },
    appointment_requested_start: { type: ["string", "null"] },
    appointment_timezone: { type: ["string", "null"] },
    attendee_name: { type: ["string", "null"] },
    attendee_email: { type: ["string", "null"] },
    attendee_company: { type: ["string", "null"] },
    appointment_reason: { type: ["string", "null"] },
    availability_date: { type: ["string", "null"] },
    availability_day_part: { type: "string", enum: ["ANY", "MORNING", "AFTERNOON", "EARLIEST"] },
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
    "human_handoff_required",
    "human_handoff_reason",
    "appointment_action",
    "appointment_requested_start",
    "appointment_timezone",
    "attendee_name",
    "attendee_email",
    "attendee_company",
    "appointment_reason",
    "availability_date",
    "availability_day_part",
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
    private readonly config: {
      agentName: string;
      directBookingEnabled: boolean;
      bookingDurationMinutes: number;
    } = {
      agentName: "Valentina (IA)",
      directBookingEnabled: false,
      bookingDurationMinutes: 25,
    },
  ) {}

  async generateReply(input: AiReplyInput): Promise<AiReplyResult> {
    const recentHistory = input.recentHistory
      .filter((message) => message.content && message.status !== "FAILED")
      .slice(-10)
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
        max_output_tokens: 3000,
        prompt_cache_key: "agentefactory-valentina-reception-v3",
        instructions: buildValentinaPlaybook({
          agentName: this.config.agentName,
          directBookingEnabled: this.config.directBookingEnabled,
          bookingDurationMinutes: this.config.bookingDurationMinutes,
          contactWaId: input.contactWaId,
          memory: input.memory,
          appointment: input.appointment,
        }),
        input: recentHistory,
        text: {
          verbosity: "low",
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
    if (body?.status === "incomplete") {
      throw new Error(`OpenAI response incomplete: ${body.incomplete_details?.reason ?? "unknown reason"}`);
    }

    const text = responseText(body)?.trim();
    if (!text) throw new Error("OpenAI returned an empty response");

    let result: {
      reply: string;
      memory_relevant: boolean;
      human_handoff_required: boolean;
      human_handoff_reason: string;
      appointment_action: AppointmentAction;
      appointment_requested_start: string | null;
      appointment_timezone: string | null;
      attendee_name: string | null;
      attendee_email: string | null;
      attendee_company: string | null;
      appointment_reason: string | null;
      availability_date: string | null;
      availability_day_part: "ANY" | "MORNING" | "AFTERNOON" | "EARLIEST";
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
    const appointmentAction = ["CHECK", "BOOK", "RESCHEDULE"].includes(result.appointment_action)
      && !result.appointment_requested_start
      ? "NONE"
      : result.appointment_action;

    return {
      reply: result.reply.trim(),
      memoryRelevant: result.memory_relevant,
      humanHandoffRequired: result.human_handoff_required,
      humanHandoffReason: result.human_handoff_reason.trim(),
      appointmentRequest: appointmentAction === "NONE" ? null : {
        action: appointmentAction,
        requestedStart: result.appointment_requested_start,
        timezone: result.appointment_timezone,
        attendeeName: result.attendee_name,
        attendeeEmail: result.attendee_email,
        company: result.attendee_company,
        reason: result.appointment_reason,
        availabilityDate: result.availability_date ?? null,
        dayPart: result.availability_day_part ?? "ANY",
      },
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
