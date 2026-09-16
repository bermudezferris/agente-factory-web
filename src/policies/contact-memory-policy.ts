import type { ContactMemory } from "@/repositories/conversation-repository";

const BOOKING_TOPIC = /\b(?:agend|reserv|cita|sesión|sesion|diagnóstico|diagnostico|videollamada|calendar)\w*/i;
const TRANSIENT_STATE = /\b(?:pendiente|tentativ|disponib|slot|confirmar|confirmación|confirmacion|waiting[_\s-]for|mañana|pasado mañana|hoy|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo|\d{1,2}:\d{2}|\d{1,2}\s*(?:a\.?\s*m\.?|p\.?\s*m\.?))\b/i;
const BOOKING_INTENT = /\b(?:quier[eo]|desea|solicit|interés|interes|intención|intencion)\w*\s+(?:en\s+)?(?:agend|reserv)\w*/i;
const DIRECT_BOOKING_INTENT = /^\s*(?:agend|reserv)\w*\b/i;
const EXPLICIT_BOOKING_STATE = /\b(?:slot\s+pendiente|horario\s+tentativ|disponibilidad\s+consultada|waiting[_\s-]for)\w*/i;

export function isTransientBookingMemory(value: string): boolean {
  return EXPLICIT_BOOKING_STATE.test(value)
    || DIRECT_BOOKING_INTENT.test(value)
    || BOOKING_INTENT.test(value)
    || (BOOKING_TOPIC.test(value) && TRANSIENT_STATE.test(value));
}

function stableItems(items: string[]): string[] {
  return items.filter((item) => !isTransientBookingMemory(item));
}

function stableSummary(value: string): string {
  return value
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !isTransientBookingMemory(sentence))
    .join(" ")
    .trim();
}

export function stableContactMemory(memory: ContactMemory): ContactMemory {
  return {
    relevantClientData: stableItems(memory.relevantClientData),
    needsAndInterests: stableItems(memory.needsAndInterests),
    agreementsAndCommitments: stableItems(memory.agreementsAndCommitments),
    appointmentsAndPending: stableItems(memory.appointmentsAndPending),
    importantObjections: memory.importantObjections,
    humanHandoffNotes: memory.humanHandoffNotes,
    previousConversationsSummary: stableSummary(memory.previousConversationsSummary),
  };
}
