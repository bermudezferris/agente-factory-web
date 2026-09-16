import type { InboundTextMessage } from "@/types/whatsapp";

export type IngestResult = {
  organizationId: string;
  whatsappChannelId: string;
  contactId: string;
  conversationId: string;
  messageId: string;
  contactCreated: boolean;
  conversationCreated: boolean;
  duplicate: boolean;
};

export type ConversationStatus =
  | "AI_ACTIVE"
  | "HUMAN_REQUIRED"
  | "HUMAN_ACTIVE"
  | "PAUSED"
  | "CLOSED";

export type ConversationMessage = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  senderType: "CONTACT" | "AI_AGENT" | "HUMAN" | "SYSTEM";
  content: string | null;
  occurredAt: string;
  status: string;
};

export type ContactMemory = {
  relevantClientData: string[];
  needsAndInterests: string[];
  agreementsAndCommitments: string[];
  appointmentsAndPending: string[];
  importantObjections: string[];
  humanHandoffNotes: string[];
  previousConversationsSummary: string;
};

export type ConversationContext = {
  id: string;
  organizationId: string;
  status: ConversationStatus;
  channelId: string;
  phoneNumberId: string;
  displayPhoneNumber: string | null;
  contactId: string;
  contactWaId: string;
  contactName: string | null;
  memory: ContactMemory;
  messages: ConversationMessage[];
};

export type ConversationSummary = {
  id: string;
  status: ConversationStatus;
  contactName: string | null;
  contactWaId: string;
  lastMessageAt: string | null;
  updatedAt: string;
};

export type OutboundClaim = { claimed: boolean; messageId?: string };

export type AppointmentStatus = "HOLD" | "BOOKED" | "CANCELLED" | "FAILED";

export type Appointment = {
  id: string;
  organizationId: string;
  conversationId: string;
  contactId: string;
  calendarId: string;
  calendarEventId: string | null;
  status: AppointmentStatus;
  appointmentType: string;
  startsAt: string;
  endsAt: string;
  blockedUntil: string;
  timezone: string;
  attendeeName: string;
  attendeeEmail: string;
  company: string | null;
  reason: string | null;
};

export class AppointmentSlotConflictError extends Error {
  constructor() {
    super("The requested appointment slot is already reserved");
    this.name = "AppointmentSlotConflictError";
  }
}

export interface ConversationRepository {
  ingestInboundTextMessage(message: InboundTextMessage): Promise<IngestResult>;
  getConversationContext(conversationId: string): Promise<ConversationContext>;
  getConversationStatus(conversationId: string): Promise<ConversationStatus>;
  claimOutboundMessage(input: {
    conversation: ConversationContext;
    idempotencyKey: string;
    senderType: "AI_AGENT" | "HUMAN";
  }): Promise<OutboundClaim>;
  completeOutboundMessage(messageId: string, whatsappMessageId: string, content: string): Promise<void>;
  failOutboundMessage(messageId: string, reason: string): Promise<void>;
  mergeContactMemory(input: {
    contactId: string;
    sourceInteractionId: string;
    memory: ContactMemory;
  }): Promise<void>;
  getCurrentAppointment(contactId: string): Promise<Appointment | null>;
  getRecentOfferedSlots(conversationId: string): Promise<string[]>;
  recordOfferedSlots(input: {
    conversation: ConversationContext;
    sourceInteractionId: string;
    slots: string[];
  }): Promise<void>;
  createAppointmentHold(input: Omit<Appointment, "id" | "calendarEventId" | "status"> & {
    sourceInteractionId: string;
  }): Promise<Appointment>;
  markAppointmentBooked(appointmentId: string, calendarEventId: string, startsAt: string, endsAt: string, blockedUntil: string): Promise<void>;
  markAppointmentFailed(appointmentId: string, reason: string): Promise<void>;
  markAppointmentCancelled(appointmentId: string): Promise<void>;
  updateAppointmentSchedule(appointmentId: string, startsAt: string, endsAt: string, blockedUntil: string, timezone: string): Promise<void>;
  listConversations(): Promise<ConversationSummary[]>;
  transitionConversation(conversationId: string, status: ConversationStatus): Promise<void>;
}
