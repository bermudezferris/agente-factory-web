import { describe, expect, it } from "vitest";

import { buildValentinaPlaybook, VALENTINA_PLAYBOOK_VERSION } from "@/config/valentina-playbook";

const baseInput = {
  agentName: "Valentina (IA)",
  directBookingEnabled: true,
  bookingDurationMinutes: 25,
  contactWaId: "584129097101",
  memory: { previousConversationsSummary: "Contacto interesado en automatización." },
  appointment: null,
  now: new Date("2026-11-04T15:00:00.000Z"),
};

describe("Valentina playbook", () => {
  it("keeps the current offers and commercial positioning in one versioned source", () => {
    const playbook = buildValentinaPlaybook(baseInput);

    expect(VALENTINA_PLAYBOOK_VERSION).toBe("2026-11-25.1");
    expect(playbook).toContain("websites por US$499");
    expect(playbook).toContain("sesión inicial gratuita");
    expect(playbook).toContain("US$250");
    expect(playbook).toContain("US$790 al mes");
    expect(playbook).toContain("URGENCIA COMERCIAL CREÍBLE");
    expect(playbook).toContain("Nunca asumas que el contacto tiene una clínica estética");
  });

  it("adds contact context and booking capabilities without changing the manual", () => {
    const playbook = buildValentinaPlaybook(baseInput);

    expect(playbook).toContain("Contacto interesado en automatización.");
    expect(playbook).toContain("Interpreta las horas propuestas sin zona explícita en America/Caracas");
    expect(playbook).toContain("# ACCIONES DE CITA");
    expect(playbook).toContain("Fecha y hora actuales: 2026-11-04T15:00:00.000Z");
  });
});
