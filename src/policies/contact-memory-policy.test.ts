import { describe, expect, it } from "vitest";

import type { ContactMemory } from "@/repositories/conversation-repository";
import { stableContactMemory } from "@/policies/contact-memory-policy";

const memory: ContactMemory = {
  relevantClientData: ["Empresa: Acme", "Solicitó agendar mañana a las 3:00 AM"],
  needsAndInterests: ["Automatizar soporte", "Interés en agendar un diagnóstico", "Agendar diagnóstico de IA"],
  agreementsAndCommitments: ["Enviar propuesta comercial", "Cita tentativa el viernes a las 11 AM"],
  appointmentsAndPending: ["Slot pendiente mañana a las 3:00 AM"],
  importantObjections: ["Le preocupa el tiempo de implementación"],
  humanHandoffNotes: ["Prefiere explicaciones breves"],
  previousConversationsSummary: "Acme quiere automatizar soporte. Solicitó agendar mañana a las 3:00 AM.",
};

describe("stableContactMemory", () => {
  it("keeps durable facts and removes transient booking data", () => {
    expect(stableContactMemory(memory)).toEqual({
      relevantClientData: ["Empresa: Acme"],
      needsAndInterests: ["Automatizar soporte"],
      agreementsAndCommitments: ["Enviar propuesta comercial"],
      appointmentsAndPending: [],
      importantObjections: ["Le preocupa el tiempo de implementación"],
      humanHandoffNotes: ["Prefiere explicaciones breves"],
      previousConversationsSummary: "Acme quiere automatizar soporte.",
    });
  });
});
