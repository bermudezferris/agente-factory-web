import type { ConversationMessage } from "@/repositories/conversation-repository";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const HUMAN_TARGET = /\b(?:alejandro|alguien|persona|humano|asesor|consultor|especialista)(?:\s+del\s+equipo)?\b/;
const DIRECT_TRANSFER = /\b(?:pasa|pasame|comunica|comunicame)\s+(?:por\s+favor\s+)?con\b/;
const REQUEST_VERB = /\b(?:quiero|quisiera|necesito|prefiero|puedo|podria|deseo|me\s+puedes|me\s+podrias)\b/;
const CONTACT_ACTION = /\b(?:hablar|chatear|contactar|comun\s*icar)\b/;

function matchesExplicitRequest(value: string): boolean {
  const text = normalize(value);
  if (!HUMAN_TARGET.test(text)) return false;
  if (DIRECT_TRANSFER.test(text)) return true;
  if (!REQUEST_VERB.test(text) || !CONTACT_ACTION.test(text)) return false;

  const requestIndex = text.search(REQUEST_VERB);
  const actionIndex = text.search(CONTACT_ACTION);
  const targetIndex = text.search(HUMAN_TARGET);
  return requestIndex <= actionIndex && actionIndex <= targetIndex;
}

export function isExplicitHumanRequest(messages: ConversationMessage[], inboundMessageId: string): boolean {
  const currentIndex = messages.findIndex((message) => message.id === inboundMessageId);
  if (currentIndex < 0) return false;
  const current = messages[currentIndex];
  if (current.direction !== "INBOUND" || !current.content) return false;
  if (matchesExplicitRequest(current.content)) return true;

  const previousInbound = messages
    .slice(0, currentIndex)
    .reverse()
    .find((message) => message.direction === "INBOUND" && message.content);
  return previousInbound?.content
    ? matchesExplicitRequest(`${previousInbound.content} ${current.content}`)
    : false;
}
