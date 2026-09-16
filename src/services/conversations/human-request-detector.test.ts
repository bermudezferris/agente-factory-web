import { describe, expect, it } from "vitest";

import type { ConversationMessage } from "@/repositories/conversation-repository";
import { isExplicitHumanRequest } from "@/services/conversations/human-request-detector";

function messages(...content: string[]): ConversationMessage[] {
  return content.map((text, index) => ({
    id: `message-${index + 1}`,
    direction: "INBOUND",
    senderType: "CONTACT",
    content: text,
    occurredAt: `2026-09-16T14:${40 + index}:00Z`,
    status: "RECEIVED",
  }));
}

describe("isExplicitHumanRequest", () => {
  it.each([
    "quiero hablar con Alejandro",
    "quiero hablar con el asesor",
    "me puedes comunicar con el asesor?",
    "me puedes comun icar con el asesor?",
    "quisiera hablar con una persona",
    "quiero chatear con alguien",
    "pásame con un consultor",
    "necesito hablar con alguien del equipo",
    "quiero hablar con el asesor antes del diagnóstico",
  ])("detects explicit human request: %s", (content) => {
    expect(isExplicitHumanRequest(messages(content), "message-1")).toBe(true);
  });

  it.each([
    "el asesor me explicó algo ayer",
    "quiero saber qué hace un asesor",
    "¿el diagnóstico lo hace un consultor?",
    "quisiera chatear con el",
  ])("does not escalate ordinary or incomplete mentions: %s", (content) => {
    expect(isExplicitHumanRequest(messages(content), "message-1")).toBe(false);
  });

  it("uses the immediately preceding inbound when it completes an unfinished request", () => {
    const history = messages("quisiera chatear con el", "asesor");
    expect(isExplicitHumanRequest(history, "message-2")).toBe(true);
  });
});
