import { describe, expect, it, vi } from "vitest";

import type { Appointment, ConversationContext, ConversationRepository, IngestResult } from "@/repositories/conversation-repository";
import type { AiProvider } from "@/services/ai/openai-responses-provider";
import { AutoReplyService } from "@/services/conversations/auto-reply-service";
import type { WhatsAppClient } from "@/services/whatsapp/meta-whatsapp-client";
import type { Logger } from "@/utils/logger";
import type { CalendarBookingClient } from "@/services/calendar/google-calendar-booking-client";

const inbound: IngestResult = {
  organizationId: "org",
  whatsappChannelId: "channel",
  contactId: "contact",
  conversationId: "conversation",
  messageId: "inbound-message",
  contactCreated: false,
  conversationCreated: false,
  duplicate: false,
};

function context(status: ConversationContext["status"] = "AI_ACTIVE"): ConversationContext {
  return {
    id: "conversation",
    organizationId: "org",
    status,
    channelId: "channel",
    phoneNumberId: "phone-id",
    displayPhoneNumber: "+58000",
    contactId: "contact",
    contactWaId: "contact-wa-id",
    contactName: "María",
    memory: {
      relevantClientData: ["Empresa: Ejemplo C.A."],
      needsAndInterests: ["Automatizar soporte por WhatsApp"],
      agreementsAndCommitments: [],
      appointmentsAndPending: [],
      importantObjections: [],
      humanHandoffNotes: [],
      previousConversationsSummary: "El cliente consultó sobre automatización.",
    },
    messages: [
      { id: "inbound-message", direction: "INBOUND", senderType: "CONTACT", content: "Hola", occurredAt: "2026-09-14T00:00:00Z", status: "RECEIVED" },
    ],
  };
}

function appointment(): Appointment {
  return {
    id: "appointment",
    organizationId: "org",
    conversationId: "conversation",
    contactId: "contact",
    calendarId: "bermudez.ferris@gmail.com",
    calendarEventId: "calendar-event",
    status: "BOOKED",
    appointmentType: "Diagnóstico Estratégico de IA",
    startsAt: "2026-09-16T13:00:00.000Z",
    endsAt: "2026-09-16T13:25:00.000Z",
    blockedUntil: "2026-09-16T13:45:00.000Z",
    timezone: "America/Caracas",
    attendeeName: "María Pérez",
    attendeeEmail: "maria@example.com",
    company: "Ejemplo C.A.",
    reason: "Automatizar soporte",
  };
}

function setup(status: ConversationContext["status"] = "AI_ACTIVE", claimed = true) {
  const repository = {
    getConversationContext: vi.fn().mockResolvedValue(context(status)),
    getConversationStatus: vi.fn().mockResolvedValue(status),
    claimOutboundMessage: vi.fn().mockResolvedValue({ claimed, messageId: claimed ? "outbound" : undefined }),
    completeOutboundMessage: vi.fn().mockResolvedValue(undefined),
    failOutboundMessage: vi.fn().mockResolvedValue(undefined),
    mergeContactMemory: vi.fn().mockResolvedValue(undefined),
    getCurrentAppointment: vi.fn().mockResolvedValue(null),
    createAppointmentHold: vi.fn().mockResolvedValue({ id: "appointment-hold" }),
    markAppointmentBooked: vi.fn().mockResolvedValue(undefined),
    markAppointmentFailed: vi.fn().mockResolvedValue(undefined),
    markAppointmentCancelled: vi.fn().mockResolvedValue(undefined),
    updateAppointmentSchedule: vi.fn().mockResolvedValue(undefined),
    transitionConversation: vi.fn().mockResolvedValue(undefined),
  } as unknown as ConversationRepository;
  const ai = {
    generateReply: vi.fn().mockResolvedValue({
      reply: "¡Hola! ¿Cómo podemos ayudarte?",
      memoryRelevant: true,
      humanHandoffRequired: false,
      humanHandoffReason: "",
      appointmentRequest: null,
      memoryUpdate: {
        relevantClientData: [],
        needsAndInterests: ["Solicita una demostración"],
        agreementsAndCommitments: [],
        appointmentsAndPending: ["Coordinar demostración"],
        importantObjections: [],
        humanHandoffNotes: [],
        previousConversationsSummary: "El cliente busca automatización y solicita una demostración.",
      },
    }),
  } as AiProvider;
  const whatsapp = { sendText: vi.fn().mockResolvedValue("wamid.OUTBOUND") } as WhatsAppClient;
  const calendar = {
    checkAvailability: vi.fn().mockResolvedValue({ available: true, alternatives: [], reason: null }),
    create: vi.fn().mockResolvedValue({
      eventId: "calendar-event",
      start: "2026-09-16T13:00:00.000Z",
      end: "2026-09-16T13:25:00.000Z",
      meetLink: "https://meet.google.com/abc-defg-hij",
      calendarLink: "https://calendar.google.com/event?eid=test",
      duplicate: false,
    }),
    reschedule: vi.fn(),
    cancel: vi.fn(),
    get: vi.fn(),
  } as unknown as CalendarBookingClient;
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as Logger;
  return {
    repository,
    ai,
    whatsapp,
    calendar,
    service: new AutoReplyService(repository, ai, whatsapp, logger, calendar, {
      calendarId: "bermudez.ferris@gmail.com",
      timeZone: "America/New_York",
      durationMinutes: 25,
      bufferMinutes: 20,
    }),
  };
}

describe("AutoReplyService", () => {
  it("loads history, sends through Meta and persists the returned WhatsApp ID", async () => {
    const { service, repository, ai, whatsapp } = setup();
    await service.process(inbound);

    expect(ai.generateReply).toHaveBeenCalledWith({
      memory: context().memory,
      recentHistory: context().messages,
      appointment: null,
      contactWaId: "contact-wa-id",
    });
    expect(repository.getConversationContext).toHaveBeenCalledOnce();
    expect(repository.getConversationStatus).toHaveBeenCalledTimes(2);
    expect(repository.mergeContactMemory).toHaveBeenCalledWith({
      contactId: "contact",
      sourceInteractionId: "inbound-message",
      memory: expect.objectContaining({ needsAndInterests: ["Solicita una demostración"] }),
    });
    expect(whatsapp.sendText).toHaveBeenCalledWith("phone-id", "contact-wa-id", "¡Hola! ¿Cómo podemos ayudarte?");
    expect(repository.completeOutboundMessage).toHaveBeenCalledWith(
      "outbound",
      "wamid.OUTBOUND",
      "¡Hola! ¿Cómo podemos ayudarte?",
    );
    expect(vi.mocked(whatsapp.sendText).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(repository.mergeContactMemory).mock.invocationCallOrder[0],
    );
  });

  it("does not persist irrelevant interaction data", async () => {
    const { service, repository, ai } = setup();
    vi.mocked(ai.generateReply).mockResolvedValueOnce({
      reply: "¡Hola!",
      memoryRelevant: false,
      humanHandoffRequired: false,
      humanHandoffReason: "",
      appointmentRequest: null,
      memoryUpdate: context().memory,
    });
    await service.process(inbound);
    expect(repository.mergeContactMemory).not.toHaveBeenCalled();
  });

  it.each(["HUMAN_REQUIRED", "HUMAN_ACTIVE", "PAUSED", "CLOSED"] as const)(
    "does not reply when conversation status is %s",
    async (status) => {
      const { service, repository, ai, whatsapp } = setup(status);
      await service.process(inbound);
      expect(repository.claimOutboundMessage).not.toHaveBeenCalled();
      expect(ai.generateReply).not.toHaveBeenCalled();
      expect(whatsapp.sendText).not.toHaveBeenCalled();
    },
  );

  it("does not send twice when the outbound claim already exists", async () => {
    const { service, ai, whatsapp } = setup("AI_ACTIVE", false);
    await service.process(inbound);
    expect(ai.generateReply).not.toHaveBeenCalled();
    expect(whatsapp.sendText).not.toHaveBeenCalled();
  });

  it("marks the reserved outbound row failed when generation or delivery fails", async () => {
    const { service, repository, ai } = setup();
    vi.mocked(ai.generateReply).mockRejectedValueOnce(new Error("provider unavailable"));
    await service.process(inbound);
    expect(repository.failOutboundMessage).toHaveBeenCalledWith("outbound", "provider unavailable");
  });

  it("keeps a sent reply successful when the later memory update fails", async () => {
    const { service, repository, whatsapp } = setup();
    vi.mocked(repository.mergeContactMemory).mockRejectedValueOnce(new Error("memory unavailable"));

    await service.process(inbound);

    expect(whatsapp.sendText).toHaveBeenCalledOnce();
    expect(repository.completeOutboundMessage).toHaveBeenCalledOnce();
    expect(repository.failOutboundMessage).not.toHaveBeenCalled();
  });

  it("moves the conversation to HUMAN_REQUIRED after sending a handoff reply", async () => {
    const { service, repository, ai, whatsapp } = setup();
    vi.mocked(ai.generateReply).mockResolvedValueOnce({
      reply: "Esto prefiero pasárselo al equipo para darte una respuesta bien aterrizada.",
      memoryRelevant: false,
      humanHandoffRequired: true,
      humanHandoffReason: "El contacto solicitó una propuesta formal",
      appointmentRequest: null,
      memoryUpdate: context().memory,
    });

    await service.process(inbound);

    expect(whatsapp.sendText).toHaveBeenCalledOnce();
    expect(repository.completeOutboundMessage).toHaveBeenCalledOnce();
    expect(repository.transitionConversation).toHaveBeenCalledWith("conversation", "HUMAN_REQUIRED");
  });

  it("books directly, confirms by WhatsApp and remembers the appointment", async () => {
    const { service, ai, calendar, whatsapp, repository } = setup();
    vi.mocked(ai.generateReply).mockResolvedValueOnce({
      reply: "Voy a reservarlo.",
      memoryRelevant: false,
      humanHandoffRequired: false,
      humanHandoffReason: "",
      appointmentRequest: {
        action: "BOOK",
        requestedStart: "2026-09-16T09:00:00-04:00",
        timezone: "America/Caracas",
        attendeeName: "María Pérez",
        attendeeEmail: "maria@example.com",
        company: "Ejemplo C.A.",
        reason: "Automatizar soporte",
      },
      memoryUpdate: context().memory,
    });

    await service.process(inbound);

    expect(calendar.checkAvailability).toHaveBeenCalledWith("2026-09-16T09:00:00-04:00");
    expect(calendar.create).toHaveBeenCalledWith({
      requestedStart: "2026-09-16T09:00:00-04:00",
      sourceInteractionId: "inbound-message",
      conversationId: "conversation",
      contactWaId: "contact-wa-id",
      name: "María Pérez",
      email: "maria@example.com",
      company: "Ejemplo C.A.",
      reason: "Automatizar soporte",
    });
    expect(whatsapp.sendText).toHaveBeenCalledWith(
      "phone-id",
      "contact-wa-id",
      expect.stringContaining("Te dejé agendado"),
    );
    expect(repository.mergeContactMemory).toHaveBeenCalledWith(expect.objectContaining({
      memory: expect.objectContaining({ appointmentsAndPending: expect.arrayContaining([
        expect.stringContaining("appointment_status=BOOKED"),
      ]) }),
    }));
  });

  it("offers real nearby alternatives without sending a booking link", async () => {
    const { service, ai, calendar, whatsapp } = setup();
    vi.mocked(ai.generateReply).mockResolvedValueOnce({
      reply: "Déjame revisar.",
      memoryRelevant: false,
      humanHandoffRequired: false,
      humanHandoffReason: "",
      appointmentRequest: {
        action: "CHECK",
        requestedStart: "2026-09-16T09:00:00-04:00",
        timezone: "America/Caracas",
        attendeeName: null,
        attendeeEmail: null,
        company: null,
        reason: null,
      },
      memoryUpdate: context().memory,
    });
    vi.mocked(calendar.checkAvailability).mockResolvedValueOnce({
      available: false,
      alternatives: ["2026-09-16T13:45:00.000Z", "2026-09-16T14:30:00.000Z"],
      reason: "busy",
    });

    await service.process(inbound);

    const reply = vi.mocked(whatsapp.sendText).mock.calls[0][2];
    expect(reply).toContain("pero tengo");
    expect(reply).not.toContain("http");
  });

  it("cancels the existing calendar event and updates Supabase", async () => {
    const { service, ai, calendar, repository, whatsapp } = setup();
    vi.mocked(repository.getCurrentAppointment).mockResolvedValueOnce(appointment());
    vi.mocked(ai.generateReply).mockResolvedValueOnce({
      reply: "Voy a cancelarla.",
      memoryRelevant: false,
      humanHandoffRequired: false,
      humanHandoffReason: "",
      appointmentRequest: {
        action: "CANCEL",
        requestedStart: null,
        timezone: null,
        attendeeName: null,
        attendeeEmail: null,
        company: null,
        reason: null,
      },
      memoryUpdate: context().memory,
    });

    await service.process(inbound);

    expect(calendar.cancel).toHaveBeenCalledWith("calendar-event");
    expect(repository.markAppointmentCancelled).toHaveBeenCalledWith("appointment");
    expect(vi.mocked(whatsapp.sendText).mock.calls[0][2]).toContain("cancelé tu cita");
  });

  it("reschedules the same appointment instead of creating a second one", async () => {
    const { service, ai, calendar, repository } = setup();
    vi.mocked(repository.getCurrentAppointment).mockResolvedValueOnce(appointment());
    vi.mocked(calendar.reschedule).mockResolvedValueOnce({
      eventId: "calendar-event",
      start: "2026-09-17T13:00:00.000Z",
      end: "2026-09-17T13:25:00.000Z",
      meetLink: null,
      calendarLink: null,
      duplicate: false,
    });
    vi.mocked(ai.generateReply).mockResolvedValueOnce({
      reply: "Voy a moverla.",
      memoryRelevant: false,
      humanHandoffRequired: false,
      humanHandoffReason: "",
      appointmentRequest: {
        action: "RESCHEDULE",
        requestedStart: "2026-09-17T09:00:00-04:00",
        timezone: "America/Caracas",
        attendeeName: "María Pérez",
        attendeeEmail: "maria@example.com",
        company: "Ejemplo C.A.",
        reason: "Automatizar soporte",
      },
      memoryUpdate: context().memory,
    });

    await service.process(inbound);

    expect(calendar.reschedule).toHaveBeenCalledWith("calendar-event", expect.any(Object));
    expect(calendar.create).not.toHaveBeenCalled();
    expect(repository.updateAppointmentSchedule).toHaveBeenCalledWith(
      "appointment",
      "2026-09-17T13:00:00.000Z",
      "2026-09-17T13:25:00.000Z",
      "2026-09-17T13:45:00.000Z",
      "America/Caracas",
    );
  });

  it("retrieves the existing event from Google before describing it", async () => {
    const { service, ai, calendar, repository, whatsapp } = setup();
    vi.mocked(repository.getCurrentAppointment).mockResolvedValueOnce(appointment());
    vi.mocked(calendar.get).mockResolvedValueOnce({
      eventId: "calendar-event",
      start: "2026-09-16T13:00:00.000Z",
      end: "2026-09-16T13:25:00.000Z",
      meetLink: null,
      calendarLink: null,
      duplicate: true,
    });
    vi.mocked(ai.generateReply).mockResolvedValueOnce({
      reply: "Voy a buscarla.",
      memoryRelevant: false,
      humanHandoffRequired: false,
      humanHandoffReason: "",
      appointmentRequest: {
        action: "LOOKUP",
        requestedStart: null,
        timezone: null,
        attendeeName: null,
        attendeeEmail: null,
        company: null,
        reason: null,
      },
      memoryUpdate: context().memory,
    });

    await service.process(inbound);

    expect(calendar.get).toHaveBeenCalledWith("calendar-event");
    expect(vi.mocked(whatsapp.sendText).mock.calls[0][2]).toContain("está agendado");
  });
});
