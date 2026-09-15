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
  listConversations(): Promise<ConversationSummary[]>;
  transitionConversation(conversationId: string, status: ConversationStatus): Promise<void>;
}
