import type { AiProvider, AppointmentAction } from "@/services/ai/openai-responses-provider";
import type { WhatsAppClient } from "@/services/whatsapp/meta-whatsapp-client";
import {
  AppointmentSlotConflictError,
  type Appointment,
  type ContactMemory,
  type ConversationRepository,
  type IngestResult,
} from "@/repositories/conversation-repository";
import type { Logger } from "@/utils/logger";
import type { HumanConsoleNotifier } from "@/services/telegram/telegram-human-console";
import { isExplicitHumanRequest } from "@/services/conversations/human-request-detector";
import {
  BookingSlotUnavailableError,
  type CalendarAvailability,
  type CalendarBookingClient,
  type CalendarEventInput,
  type CalendarReservation,
} from "@/services/calendar/google-calendar-booking-client";

type BookingConfig = {
  calendarId: string;
  timeZone: string;
  durationMinutes: number;
  bufferMinutes: number;
};

type BookingTimeProvenance = "CURRENT_MESSAGE" | "RECENT_CONTEXT" | "CONFIRMED_APPOINTMENT";

const DATE_EVIDENCE = /\b(?:hoy|mañana|pasado mañana|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|\d{1,2}\s+de\s+(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)|\d{1,2}[/-]\d{1,2})\b/i;
const TIME_EVIDENCE = /\b(?:a\s+las?\s+\d{1,2}(?::\d{2})?|\d{1,2}:\d{2}|\d{1,2}\s*(?:a\.?\s*m\.?|p\.?\s*m\.?))\b/i;
const BOOKING_CONTINUATION = /\b(?:agend|reserv|confirm|esa hora|ese día|ese dia|mi nombre|correo|email|empresa|sí|si|perfecto|listo)\b/i;
const BOOKING_RESET = /\b(?:cancel|olvida|descarta|ya no|no quiero)\w*/i;
const GREETING_ONLY = /^(?:¡|¿|[\s])*?(?:hola|buenas|buen\s+d[ií]a|buenas\s+tardes|buenas\s+noches|hey|qu[eé]\s+tal)(?:[!¡?¿.,\s])*$/i;
const CURRENT_BOOKING_INTENT = /\b(?:agend\w*|reserv\w*|cita|diagn[oó]stico|videollamada|calendar(?:io)?|horario|disponibilidad|reprogram\w*|m(?:ue|o)v\w*|cancel\w*\s+(?:la\s+)?cita)\b/i;
const BOOKING_CONTINUATION_REPLY = /\b(?:s[ií]|confirm\w*|otra\w*|ninguna|ninguno|primera|segunda|correo|email|mi nombre|empresa|ma[nñ]ana|tarde|temprano)\b|@|\d{1,2}(?::\d{2})?/i;

function hasExplicitDateAndTime(value: string): boolean {
  return DATE_EVIDENCE.test(value) && TIME_EVIDENCE.test(value);
}

function hasSpecificDateOrTime(value: string): boolean {
  return DATE_EVIDENCE.test(value) || TIME_EVIDENCE.test(value);
}

function isGreetingOnly(value: string): boolean {
  return GREETING_ONLY.test(value.trim());
}

function hasImmediateBookingContinuation(
  messages: Awaited<ReturnType<ConversationRepository["getConversationContext"]>>["messages"],
  inboundMessageId: string,
): boolean {
  const currentIndex = messages.findIndex((message) => message.id === inboundMessageId);
  if (currentIndex <= 0) return false;
  const current = messages[currentIndex];
  const previous = messages[currentIndex - 1];
  if (!current?.content || isGreetingOnly(current.content) || previous?.direction !== "OUTBOUND" || !previous.content) return false;
  const bookingPrompt = /(?:cu[aá]l te funciona|nombre completo|correo|dejarlo confirmado|horario|cita|agend)/i.test(previous.content);
  const closeEnough = new Date(current.occurredAt).getTime() - new Date(previous.occurredAt).getTime() <= 30 * 60 * 1000;
  return bookingPrompt && closeEnough && BOOKING_CONTINUATION_REPLY.test(current.content);
}

function professionalizeTone(value: string): string {
  return value
    .replace(/¡?de una(?: vez)?!?/gi, "¡Claro!")
    .replace(/\bdale\b[,.!]?/gi, "Perfecto,")
    .replace(/\btranqui\b/gi, "no te preocupes")
    .replace(/\bfull\s+interesante\b/gi, "muy interesante")
    .replace(/\bbrutal\b/gi, "excelente")
    .replace(/\bqu[eé]\s+nota\b/gi, "qué bien")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function supportsAvailabilityDate(value: string): boolean {
  const withoutDayPart = value.replace(/\b(?:por\s+la\s+mañana|en\s+la\s+mañana)\b/gi, "");
  return DATE_EVIDENCE.test(withoutDayPart);
}

function supportedDayPart(
  value: string,
  requested: "ANY" | "MORNING" | "AFTERNOON" | "EARLIEST" | undefined,
): "ANY" | "MORNING" | "AFTERNOON" | "EARLIEST" {
  if (requested === "MORNING" && /\b(?:por\s+la\s+mañana|en\s+la\s+mañana)\b/i.test(value)) return requested;
  if (requested === "AFTERNOON" && /\b(?:tarde|después\s+de\s+almuerzo|despues\s+de\s+almuerzo)\b/i.test(value)) return requested;
  if (requested === "EARLIEST" && /\b(?:más\s+temprano|mas\s+temprano|primera\s+hora)\b/i.test(value)) return requested;
  return "ANY";
}

function bookingTimeProvenance(
  messages: Awaited<ReturnType<ConversationRepository["getConversationContext"]>>["messages"],
  inboundMessageId: string,
  appointment: Appointment | null,
): BookingTimeProvenance | null {
  const currentIndex = messages.findIndex((message) => message.id === inboundMessageId);
  const current = currentIndex >= 0 ? messages[currentIndex] : undefined;
  const currentText = current?.content ?? "";
  if (hasExplicitDateAndTime(currentText)) return "CURRENT_MESSAGE";

  if (current && BOOKING_CONTINUATION.test(currentText)) {
    const currentTime = new Date(current.occurredAt).getTime();
    const resetIndex = messages
      .slice(0, currentIndex)
      .map((message, index) => ({ message, index }))
      .filter(({ message }) => message.content && BOOKING_RESET.test(message.content))
      .at(-1)?.index ?? -1;
    const recentText = messages
      .slice(Math.max(resetIndex + 1, currentIndex - 6), currentIndex)
      .filter((message) =>
        message.direction === "INBOUND"
        && message.content
        && currentTime - new Date(message.occurredAt).getTime() <= 30 * 60 * 1000,
      )
      .map((message) => message.content)
      .join(" ");
    if (hasExplicitDateAndTime(`${recentText} ${currentText}`)) return "RECENT_CONTEXT";
  }

  if (
    appointment?.status === "BOOKED"
    && appointment.calendarEventId
    && /\b(?:cita|diagnóstico|diagnostico|agend|reserv|reprogram|cancel|cuándo|cuando|hora)\b/i.test(currentText)
  ) {
    return "CONFIRMED_APPOINTMENT";
  }
  return null;
}

function removeUnsupportedTemporalMemory(memory: ContactMemory, previousSummary: string): ContactMemory {
  const withoutSlots = (items: string[]) => items.filter((item) => !hasSpecificDateOrTime(item));
  return {
    ...memory,
    relevantClientData: withoutSlots(memory.relevantClientData),
    agreementsAndCommitments: withoutSlots(memory.agreementsAndCommitments),
    appointmentsAndPending: withoutSlots(memory.appointmentsAndPending),
    previousConversationsSummary: previousSummary,
  };
}

function formatDate(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value)).replace(/\.$/, "");
}

function alternativesReply(availability: CalendarAvailability, timeZone: string): string {
  if (availability.alternatives.length === 0) {
    return "Ese horario no está disponible. Dime qué otro día te funciona y reviso opciones reales.";
  }
  const alternatives = availability.alternatives.slice(0, 2).map((slot) => formatDate(slot, timeZone));
  const list = alternatives.length === 1
    ? alternatives[0]
    : `${alternatives.slice(0, -1).join(", ")} o ${alternatives.at(-1)}`;
  return `Ese horario ya no está disponible, pero tengo ${list}. ¿Cuál te funciona mejor?`;
}

function pickDifferentiatedSlots(slots: string[]): string[] {
  if (slots.length <= 1) return slots;
  const first = slots[0];
  const separated = slots.find((slot) => new Date(slot).getTime() - new Date(first).getTime() >= 2 * 60 * 60 * 1000);
  return [first, separated ?? slots[1]];
}

function offeredSlotsReply(slots: string[], timeZone: string): string {
  if (slots.length === 0) return "No encontré un espacio cercano que cumpla el horario. ¿Prefieres mañana o tarde para ampliar la búsqueda?";
  const labels = slots.map((slot) => formatDate(slot, timeZone));
  if (labels.length === 1) return `Tengo libre ${labels[0]} 😊 ¿Te funciona?`;
  return `¡Claro! 😊 Tengo libre ${labels[0]} o ${labels[1]}. ¿Cuál te funciona mejor?`;
}

type OfferedSlotResolution =
  | { kind: "SELECTED"; requestedStart: string }
  | { kind: "CLARIFY"; reply: string }
  | { kind: "NONE" };

function localClock(value: string, timeZone: string): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  return {
    hour: Number(parts.find((part) => part.type === "hour")?.value),
    minute: Number(parts.find((part) => part.type === "minute")?.value),
  };
}

function displayClock(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value)).replace(/\.$/, "");
}

function resolveOfferedSlotSelection(
  input: string,
  offeredSlots: string[],
  timeZone: string,
): OfferedSlotResolution {
  const slots = offeredSlots.slice(0, 2);
  if (slots.length === 0) return { kind: "NONE" };
  const normalized = input.toLocaleLowerCase("es").trim();
  const ordinal = /\b(?:la\s+)?primera(?:\s+opci[oó]n)?\b/.test(normalized)
    ? 0
    : /\b(?:la\s+)?segunda(?:\s+opci[oó]n)?\b/.test(normalized)
      ? 1
      : null;
  if (ordinal !== null && slots[ordinal]) return { kind: "SELECTED", requestedStart: slots[ordinal] };

  if (/\bla\s+de\s+la\s+ma[nñ]ana\b/.test(normalized)) {
    const morning = slots.filter((slot) => localClock(slot, timeZone).hour < 12);
    if (morning.length === 1) return { kind: "SELECTED", requestedStart: morning[0] };
  }

  const timeMatch = normalized.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?\s*m\.?|p\.?\s*m\.?)?\b/);
  if (!timeMatch) return { kind: "NONE" };
  const statedHour = Number(timeMatch[1]);
  const statedMinute = Number(timeMatch[2] ?? "0");
  const statedMeridiem = timeMatch[3]?.replace(/[.\s]/g, "").startsWith("p") ? "PM"
    : timeMatch[3] ? "AM" : null;
  const matching = slots.find((slot) => {
    const clock = localClock(slot, timeZone);
    const twelveHour = clock.hour % 12 || 12;
    return twelveHour === statedHour && clock.minute === statedMinute;
  });
  if (!matching) return { kind: "NONE" };

  const matchingClock = localClock(matching, timeZone);
  const offeredMeridiem = matchingClock.hour >= 12 ? "PM" : "AM";
  if (statedMeridiem && statedMeridiem !== offeredMeridiem) {
    if (/^no\b/.test(normalized)) {
      const hourDelta = statedMeridiem === "PM" ? 12 : -12;
      return {
        kind: "SELECTED",
        requestedStart: new Date(new Date(matching).getTime() + hourDelta * 60 * 60 * 1000).toISOString(),
      };
    }
    const option = slots.indexOf(matching) === 0 ? "primera" : "segunda";
    return {
      kind: "CLARIFY",
      reply: `¿${displayClock(matching, timeZone)}, la ${option} opción que te pasé? 😊`,
    };
  }
  return { kind: "SELECTED", requestedStart: matching };
}

function dateSearchRange(date: string | null | undefined): { from?: string; to?: string } {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return {};
  const from = new Date(`${date}T00:00:00-04:00`);
  if (Number.isNaN(from.getTime())) return {};
  return { from: from.toISOString(), to: new Date(from.getTime() + 24 * 60 * 60 * 1000).toISOString() };
}

function bookedReply(
  reservation: CalendarReservation,
  attendeeName: string,
  config: BookingConfig,
  attendeeTimeZone: string,
): string {
  const firstName = attendeeName.trim().split(/\s+/)[0];
  const zoneLabel = attendeeTimeZone === "America/Caracas" ? "hora de Venezuela" : attendeeTimeZone;
  return `Listo, ${firstName} 🙌.\n\nTe dejé agendado para el ${formatDate(reservation.start, attendeeTimeZone)}, ${zoneLabel}.\n\nDiagnóstico Estratégico de IA\nDuración: ${config.durationMinutes} minutos\n\nTambién te debería llegar la invitación al correo. ¡Nos vemos ahí!`;
}

function appointmentInput(
  request: NonNullable<Awaited<ReturnType<AiProvider["generateReply"]>>["appointmentRequest"]>,
  inbound: IngestResult,
  conversation: Awaited<ReturnType<ConversationRepository["getConversationContext"]>>,
): CalendarEventInput | null {
  if (!request.requestedStart || !request.attendeeName || !request.attendeeEmail) return null;
  return {
    requestedStart: request.requestedStart,
    sourceInteractionId: inbound.messageId,
    conversationId: conversation.id,
    contactWaId: conversation.contactWaId,
    name: request.attendeeName,
    email: request.attendeeEmail,
    company: request.company,
    reason: request.reason,
  };
}

export class AutoReplyService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly ai: AiProvider,
    private readonly whatsapp: WhatsAppClient,
    private readonly logger: Logger,
    private readonly calendar?: CalendarBookingClient,
    private readonly bookingConfig?: BookingConfig,
    private readonly humanConsoleNotifier?: HumanConsoleNotifier,
  ) {}

  async process(inbound: IngestResult): Promise<void> {
    let outboundMessageId: string | undefined;
    try {
      const conversation = await this.repository.getConversationContext(inbound.conversationId);
      if (
        ["AI_ACTIVE", "HUMAN_REQUIRED"].includes(conversation.status)
        && isExplicitHumanRequest(conversation.messages, inbound.messageId)
      ) {
        const claim = await this.repository.claimOutboundMessage({
          conversation,
          idempotencyKey: `human-request:${inbound.messageId}`,
          senderType: "AI_AGENT",
        });
        if (!claim.claimed || !claim.messageId) return;
        outboundMessageId = claim.messageId;
        const reason = "El contacto pidió hablar directamente con una persona del equipo.";
        if (conversation.status === "AI_ACTIVE") {
          await this.repository.transitionConversation(conversation.id, "HUMAN_REQUIRED");
        }
        await this.notifyHumanRequired(conversation.id, reason, inbound.messageId);
        const acknowledgement = "Claro. Ya le avisé al equipo para que puedan continuar contigo directamente por aquí.";
        const whatsappMessageId = await this.whatsapp.sendText(
          conversation.phoneNumberId,
          conversation.contactWaId,
          acknowledgement,
        );
        await this.repository.completeOutboundMessage(claim.messageId, whatsappMessageId, acknowledgement);
        await this.notifyAiOutbound(conversation.id, claim.messageId, acknowledgement);
        this.logger.info("human_request_fast_path", { conversationId: conversation.id });
        return;
      }
      if (conversation.status !== "AI_ACTIVE") {
        this.logger.info("ai_reply_skipped", { conversationId: conversation.id, status: conversation.status });
        return;
      }

      const claim = await this.repository.claimOutboundMessage({
        conversation,
        idempotencyKey: `ai:${inbound.messageId}`,
        senderType: "AI_AGENT",
      });
      if (!claim.claimed || !claim.messageId) {
        this.logger.info("ai_reply_duplicate_ignored", { inboundMessageId: inbound.messageId });
        return;
      }
      outboundMessageId = claim.messageId;

      if ((await this.repository.getConversationStatus(inbound.conversationId)) !== "AI_ACTIVE") {
        await this.repository.failOutboundMessage(outboundMessageId, "conversation_state_changed");
        return;
      }
      const currentAppointment = this.calendar
        ? await this.repository.getCurrentAppointment(conversation.contactId)
        : null;
      const currentText = conversation.messages.find((message) => message.id === inbound.messageId)?.content ?? "";
      const offeredSlots = this.calendar && this.bookingConfig
        ? await this.repository.getRecentOfferedSlots(conversation.id)
        : [];
      if (isGreetingOnly(currentText)) {
        const greeting = "¡Hola! 😊 ¿Cómo te puedo ayudar?";
        const whatsappMessageId = await this.whatsapp.sendText(
          conversation.phoneNumberId,
          conversation.contactWaId,
          greeting,
        );
        await this.repository.completeOutboundMessage(outboundMessageId, whatsappMessageId, greeting);
        await this.notifyAiOutbound(conversation.id, outboundMessageId, greeting);
        if (offeredSlots.length > 0) {
          await this.repository.clearRecentOfferedSlots({
            conversation,
            sourceInteractionId: inbound.messageId,
            reason: "TOPIC_CHANGED",
          });
        }
        this.logger.info("greeting_fast_path", { conversationId: conversation.id });
        return;
      }
      const offeredSlotResolution = this.bookingConfig
        ? resolveOfferedSlotSelection(currentText, offeredSlots, this.bookingConfig.timeZone)
        : { kind: "NONE" as const };
      if (offeredSlotResolution.kind === "CLARIFY") {
        const whatsappMessageId = await this.whatsapp.sendText(
          conversation.phoneNumberId,
          conversation.contactWaId,
          offeredSlotResolution.reply,
        );
        await this.repository.completeOutboundMessage(outboundMessageId, whatsappMessageId, offeredSlotResolution.reply);
        await this.notifyAiOutbound(conversation.id, outboundMessageId, offeredSlotResolution.reply);
        this.logger.info("booking_offered_slot_clarification", { conversationId: conversation.id });
        return;
      }
      let generated: Awaited<ReturnType<AiProvider["generateReply"]>>;
      if (offeredSlotResolution.kind === "SELECTED") {
        generated = {
          reply: "Voy a comprobar esa opción.",
          memoryRelevant: false,
          humanHandoffRequired: false,
          humanHandoffReason: "",
          appointmentRequest: {
            action: "CHECK",
            requestedStart: offeredSlotResolution.requestedStart,
            timezone: this.bookingConfig?.timeZone ?? null,
            attendeeName: null,
            attendeeEmail: null,
            company: null,
            reason: null,
          },
          memoryUpdate: conversation.memory,
        };
        this.logger.info("booking_offered_slot_resolved", {
          conversationId: conversation.id,
          requestedStart: offeredSlotResolution.requestedStart,
        });
      } else try {
        generated = await this.ai.generateReply({
          memory: conversation.memory,
          recentHistory: conversation.messages,
          appointment: currentAppointment,
          contactWaId: conversation.contactWaId,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown AI generation error";
        this.logger.error("ai_generation_error", { error: message, inboundMessageId: inbound.messageId });
        if ((await this.repository.getConversationStatus(inbound.conversationId)) !== "AI_ACTIVE") {
          await this.repository.failOutboundMessage(outboundMessageId, "conversation_state_changed");
          return;
        }
        const fallback = "Estoy teniendo un pequeño inconveniente para procesar tu solicitud. Ya se lo paso al equipo para ayudarte por aquí.";
        const whatsappMessageId = await this.whatsapp.sendText(
          conversation.phoneNumberId,
          conversation.contactWaId,
          fallback,
        );
        await this.repository.completeOutboundMessage(outboundMessageId, whatsappMessageId, fallback);
        await this.notifyAiOutbound(conversation.id, outboundMessageId, fallback);
        await this.repository.transitionConversation(conversation.id, "HUMAN_REQUIRED");
        await this.notifyHumanRequired(conversation.id, message, inbound.messageId);
        this.logger.info("ai_generation_fallback_sent", { conversationId: conversation.id, messageId: outboundMessageId });
        return;
      }
      if ((await this.repository.getConversationStatus(inbound.conversationId)) !== "AI_ACTIVE") {
        await this.repository.failOutboundMessage(outboundMessageId, "conversation_state_changed");
        return;
      }

      let reply = generated.reply;
      let humanHandoffRequired = generated.humanHandoffRequired;
      let humanHandoffReason = generated.humanHandoffReason;
      let memoryRelevant = generated.memoryRelevant;
      let memoryUpdate = generated.memoryUpdate;
      const currentBookingEvidence = CURRENT_BOOKING_INTENT.test(currentText)
        || hasSpecificDateOrTime(currentText)
        || offeredSlotResolution.kind === "SELECTED"
        || hasImmediateBookingContinuation(conversation.messages, inbound.messageId);
      if (generated.appointmentRequest && !currentBookingEvidence) {
        this.logger.warn("booking_action_rejected_without_current_intent", {
          conversationId: conversation.id,
          inboundMessageId: inbound.messageId,
          action: generated.appointmentRequest.action,
        });
        generated.appointmentRequest = null;
        if (offeredSlots.length > 0) {
          await this.repository.clearRecentOfferedSlots({
            conversation,
            sourceInteractionId: inbound.messageId,
            reason: "TOPIC_CHANGED",
          });
        }
      }

      const timeProvenance = bookingTimeProvenance(
        conversation.messages,
        inbound.messageId,
        currentAppointment,
      ) ?? (offeredSlotResolution.kind === "SELECTED" ? "RECENT_CONTEXT" : null);
      const generatedSlot = generated.appointmentRequest?.requestedStart;
      const unsupportedSlot = Boolean(generatedSlot && !timeProvenance);
      const isSuggestion = generated.appointmentRequest?.action === "SUGGEST";
      if (isSuggestion && generated.appointmentRequest) {
        if (generated.appointmentRequest.availabilityDate && !supportsAvailabilityDate(currentText)) {
          generated.appointmentRequest.availabilityDate = null;
        }
        generated.appointmentRequest.dayPart = supportedDayPart(
          currentText,
          generated.appointmentRequest.dayPart,
        );
      }
      const unsupportedReplyTime = !isSuggestion && !timeProvenance && hasSpecificDateOrTime(reply);
      if (unsupportedSlot || unsupportedReplyTime) {
        this.logger.warn("booking_time_provenance_rejected", {
          conversationId: conversation.id,
          inboundMessageId: inbound.messageId,
        });
        reply = "¿Qué día y hora te vienen bien?";
        generated.appointmentRequest = null;
        memoryUpdate = removeUnsupportedTemporalMemory(
          memoryUpdate,
          conversation.memory.previousConversationsSummary,
        );
        memoryRelevant = memoryRelevant && Object.values(memoryUpdate).some((value) =>
          Array.isArray(value) ? value.length > 0 : value !== conversation.memory.previousConversationsSummary,
        );
      } else if (timeProvenance) {
        this.logger.info("booking_time_provenance_accepted", {
          conversationId: conversation.id,
          inboundMessageId: inbound.messageId,
          provenance: timeProvenance,
        });
      }

      if (generated.appointmentRequest) {
        const handled = await this.handleAppointmentAction(
          generated.appointmentRequest.action,
          generated.appointmentRequest,
          currentAppointment,
          inbound,
          conversation,
          memoryUpdate,
          offeredSlots,
        );
        reply = handled.reply;
        memoryRelevant ||= handled.memoryRelevant;
        memoryUpdate = handled.memoryUpdate;
        humanHandoffRequired ||= handled.humanHandoffRequired;
        if (handled.humanHandoffReason) humanHandoffReason = handled.humanHandoffReason;
      }

      reply = professionalizeTone(reply);
      const whatsappMessageId = await this.whatsapp.sendText(
        conversation.phoneNumberId,
        conversation.contactWaId,
        reply,
      );
      await this.repository.completeOutboundMessage(outboundMessageId, whatsappMessageId, reply);
      await this.notifyAiOutbound(conversation.id, outboundMessageId, reply);
      if (humanHandoffRequired) {
        await this.repository.transitionConversation(conversation.id, "HUMAN_REQUIRED");
        this.logger.info("ai_handoff_requested", { conversationId: conversation.id, reason: humanHandoffReason });
        await this.notifyHumanRequired(conversation.id, humanHandoffReason, inbound.messageId);
      }
      if (memoryRelevant) {
        try {
          await this.repository.mergeContactMemory({
            contactId: conversation.contactId,
            sourceInteractionId: inbound.messageId,
            memory: memoryUpdate,
          });
        } catch (memoryError) {
          this.logger.error("contact_memory_update_error", {
            conversationId: conversation.id,
            error: memoryError instanceof Error ? memoryError.message : "Unknown memory error",
          });
        }
      }
      this.logger.info("ai_reply_sent", { conversationId: conversation.id, messageId: outboundMessageId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown auto-reply error";
      if (outboundMessageId) {
        try {
          await this.repository.failOutboundMessage(outboundMessageId, message);
        } catch (persistenceError) {
          this.logger.error("ai_reply_failure_persistence_error", {
            error: persistenceError instanceof Error ? persistenceError.message : "Unknown error",
          });
        }
      }
      this.logger.error("ai_reply_error", { error: message, inboundMessageId: inbound.messageId });
    }
  }

  private async notifyHumanRequired(conversationId: string, reason: string, sourceMessageId: string): Promise<void> {
    if (!this.humanConsoleNotifier) return;
    try {
      await this.humanConsoleNotifier.alertHumanRequired(conversationId, reason, sourceMessageId);
    } catch (error) {
      this.logger.error("telegram_handoff_alert_error", {
        conversationId,
        error: error instanceof Error ? error.message : "Unknown Telegram alert error",
      });
    }
  }

  private async notifyAiOutbound(conversationId: string, messageId: string, content: string): Promise<void> {
    if (!this.humanConsoleNotifier) return;
    try {
      await this.humanConsoleNotifier.notifyAiOutbound(conversationId, messageId, content);
    } catch (error) {
      this.logger.error("telegram_watch_outbound_error", {
        conversationId,
        error: error instanceof Error ? error.message : "Unknown Telegram mirror error",
      });
    }
  }

  private async handleAppointmentAction(
    action: Exclude<AppointmentAction, "NONE">,
    request: NonNullable<Awaited<ReturnType<AiProvider["generateReply"]>>["appointmentRequest"]>,
    current: Appointment | null,
    inbound: IngestResult,
    conversation: Awaited<ReturnType<ConversationRepository["getConversationContext"]>>,
    memoryUpdate: ContactMemory,
    recentOfferedSlots: string[],
  ): Promise<{
    reply: string;
    memoryRelevant: boolean;
    memoryUpdate: ContactMemory;
    humanHandoffRequired: boolean;
    humanHandoffReason: string;
  }> {
    const unchanged = (reply: string) => ({
      reply,
      memoryRelevant: false,
      memoryUpdate,
      humanHandoffRequired: false,
      humanHandoffReason: "",
    });
    if (!this.calendar || !this.bookingConfig) {
      return {
        ...unchanged("Estoy teniendo un pequeño problema para confirmar el calendario. Dame un momento y te ayudo con eso."),
        humanHandoffRequired: true,
        humanHandoffReason: "La integración de Google Calendar no está configurada",
      };
    }

    try {
      if (action === "LOOKUP") {
        if (!current?.calendarEventId) return unchanged("No encuentro una cita activa a tu nombre. Si quieres, revisamos un horario ahora mismo.");
        const event = await this.calendar.get(current.calendarEventId);
        if (!event) throw new Error("La cita guardada no existe en Google Calendar");
        return unchanged(`Claro. Tu Diagnóstico Estratégico de IA está agendado para el ${formatDate(event.start, current.timezone)}.`);
      }

      if (action === "CANCEL") {
        if (!current?.calendarEventId) return unchanged("No encuentro una cita activa para cancelar.");
        await this.calendar.cancel(current.calendarEventId);
        await this.repository.markAppointmentCancelled(current.id);
        await this.repository.clearRecentOfferedSlots({
          conversation,
          sourceInteractionId: inbound.messageId,
          reason: "CANCELLED",
        });
        return {
          ...unchanged("Listo, cancelé tu cita. Si quieres coordinar otra fecha más adelante, me dices."),
          memoryRelevant: true,
          memoryUpdate: {
            ...memoryUpdate,
            appointmentsAndPending: [...memoryUpdate.appointmentsAndPending, `Cita ${current.calendarEventId} cancelada`],
          },
        };
      }

      if (action === "SUGGEST") {
        const range = dateSearchRange(request.availabilityDate);
        const candidates = await this.calendar.findAvailableSlots({
          ...range,
          dayPart: request.dayPart ?? "ANY",
          exclude: recentOfferedSlots,
          count: 12,
        });
        const slots = pickDifferentiatedSlots(candidates).slice(0, 2);
        if (slots.length > 0) {
          await this.repository.recordOfferedSlots({
            conversation,
            sourceInteractionId: inbound.messageId,
            slots,
          });
        }
        return unchanged(offeredSlotsReply(slots, request.timezone ?? this.bookingConfig.timeZone));
      }

      if (!request.requestedStart) return unchanged("¿Qué día, hora y zona horaria te funcionan?");

      if (action === "CHECK") {
        const availability = await this.calendar.checkAvailability(request.requestedStart);
        if (!availability.available) return unchanged(alternativesReply(availability, request.timezone ?? this.bookingConfig.timeZone));
        const missing = [!request.attendeeName && "nombre completo", !request.attendeeEmail && "correo"].filter(Boolean);
        const date = formatDate(request.requestedStart, request.timezone ?? this.bookingConfig.timeZone);
        if (missing.length > 0) {
          return unchanged(`Sí, el ${date} está disponible 👍. Para dejarlo confirmado, ¿me das tu ${missing.join(" y ")}?`);
        }
        return unchanged(`Sí, el ${date} está disponible 👍. ¿Quieres que lo deje confirmado?`);
      }

      const eventInput = appointmentInput(request, inbound, conversation);
      if (!eventInput) return unchanged("Para dejarlo confirmado solo me faltan tu nombre completo y correo.");

      if (action === "RESCHEDULE") {
        if (!current?.calendarEventId) return unchanged("No encuentro una cita activa para reprogramar. Podemos reservar una nueva fecha.");
        if (new Date(current.startsAt).getTime() === new Date(eventInput.requestedStart).getTime()) {
          return unchanged(`Tu cita ya está confirmada para el ${formatDate(current.startsAt, current.timezone)}.`);
        }
        const reservation = await this.calendar.reschedule(current.calendarEventId, eventInput);
        await this.repository.updateAppointmentSchedule(
          current.id,
          reservation.start,
          reservation.end,
          new Date(new Date(reservation.end).getTime() + this.bookingConfig.bufferMinutes * 60000).toISOString(),
          request.timezone ?? this.bookingConfig.timeZone,
        );
        return {
          ...unchanged(`Listo, moví tu cita para el ${formatDate(reservation.start, request.timezone ?? this.bookingConfig.timeZone)}. La invitación del correo también quedó actualizada.`),
          memoryRelevant: true,
          memoryUpdate: {
            ...memoryUpdate,
            appointmentsAndPending: [...memoryUpdate.appointmentsAndPending, `Cita ${reservation.eventId} reprogramada para ${reservation.start}`],
          },
        };
      }

      if (current?.status === "BOOKED" && current.calendarEventId) {
        return unchanged(`Ya tienes un diagnóstico agendado para el ${formatDate(current.startsAt, current.timezone)}. Si quieres moverlo, dime la nueva fecha y hora.`);
      }

      const availability = await this.calendar.checkAvailability(eventInput.requestedStart);
      if (!availability.available) return unchanged(alternativesReply(availability, request.timezone ?? this.bookingConfig.timeZone));
      const start = new Date(eventInput.requestedStart);
      const end = new Date(start.getTime() + this.bookingConfig.durationMinutes * 60000);
      const hold = await this.repository.createAppointmentHold({
        organizationId: conversation.organizationId,
        conversationId: conversation.id,
        contactId: conversation.contactId,
        calendarId: this.bookingConfig.calendarId,
        appointmentType: "Diagnóstico Estratégico de IA",
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        blockedUntil: new Date(end.getTime() + this.bookingConfig.bufferMinutes * 60000).toISOString(),
        timezone: request.timezone ?? this.bookingConfig.timeZone,
        attendeeName: eventInput.name,
        attendeeEmail: eventInput.email,
        company: eventInput.company,
        reason: eventInput.reason,
        sourceInteractionId: inbound.messageId,
      });
      try {
        const reservation = await this.calendar.create(eventInput);
        await this.repository.markAppointmentBooked(
          hold.id,
          reservation.eventId,
          reservation.start,
          reservation.end,
          new Date(new Date(reservation.end).getTime() + this.bookingConfig.bufferMinutes * 60000).toISOString(),
        );
        await this.repository.clearRecentOfferedSlots({
          conversation,
          sourceInteractionId: inbound.messageId,
          reason: "BOOKED",
        });
        this.logger.info("calendar_booking_created", {
          conversationId: conversation.id,
          eventId: reservation.eventId,
          duplicate: reservation.duplicate,
        });
        return {
          ...unchanged(bookedReply(
            reservation,
            eventInput.name,
            this.bookingConfig,
            request.timezone ?? this.bookingConfig.timeZone,
          )),
          memoryRelevant: true,
          memoryUpdate: {
            ...memoryUpdate,
            appointmentsAndPending: [
              ...memoryUpdate.appointmentsAndPending,
              `appointment_status=BOOKED; appointment_datetime=${reservation.start}; appointment_timezone=${request.timezone ?? this.bookingConfig.timeZone}; appointment_event_id=${reservation.eventId}; appointment_type=Diagnóstico Estratégico de IA; company=${eventInput.company ?? "no indicada"}; attendee_email=${eventInput.email}; contexto=${eventInput.reason ?? "diagnóstico"}`,
            ],
          },
        };
      } catch (error) {
        await this.repository.markAppointmentFailed(hold.id, error instanceof Error ? error.message : "Unknown calendar error");
        throw error;
      }
    } catch (error) {
      if (error instanceof BookingSlotUnavailableError || error instanceof AppointmentSlotConflictError) {
        const availability = request.requestedStart
          ? await this.calendar.checkAvailability(request.requestedStart)
          : { available: false, alternatives: [], reason: error.message };
        return unchanged(alternativesReply(availability, request.timezone ?? this.bookingConfig.timeZone));
      }
      this.logger.error("calendar_booking_error", {
        conversationId: conversation.id,
        action,
        error: error instanceof Error ? error.message : "Unknown calendar error",
      });
      return {
        ...unchanged("Déjame revisar bien la agenda antes de darte una hora que no sea 😅."),
        humanHandoffRequired: true,
        humanHandoffReason: `Falló la acción ${action} en Google Calendar`,
      };
    }
  }
}
