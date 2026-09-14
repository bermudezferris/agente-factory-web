import type { ConversationRepository } from "@/repositories/conversation-repository";

export async function takeConversation(repository: ConversationRepository, conversationId: string) {
  await repository.transitionConversation(conversationId, "HUMAN_ACTIVE");
}

export async function resumeAI(repository: ConversationRepository, conversationId: string) {
  await repository.transitionConversation(conversationId, "AI_ACTIVE");
}

export async function requestHuman(repository: ConversationRepository, conversationId: string) {
  await repository.transitionConversation(conversationId, "HUMAN_REQUIRED");
}
