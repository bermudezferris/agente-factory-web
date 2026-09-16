import { createHash } from "node:crypto";
import { OAuth2Client } from "google-auth-library";

export const BOOKING_TIME_ZONE = "America/Caracas";
export const BOOKING_MIN_LEAD_HOURS = 4;
export const BOOKING_MAX_ADVANCE_DAYS = 60;

type AvailabilityWindow = readonly [startMinutes: number, endMinutes: number];

// Mirrors the existing Google appointment schedule. Sunday=0, Saturday=6.
export const WEEKLY_AVAILABILITY: Readonly<Record<number, readonly AvailabilityWindow[]>> = {
  0: [],
  1: [[600, 720], [780, 840], [930, 1020]],
  2: [[540, 630], [870, 990], [1080, 1140]],
  3: [[540, 720], [840, 930], [1110, 1170]],
  4: [[540, 630], [690, 750], [870, 1020]],
  5: [[660, 780]],
  6: [],
};

export type BookingSchedule = {
  timeZone: string;
  durationMinutes: number;
  bufferMinutes: number;
  minLeadHours: number;
  maxAdvanceDays: number;
};

export const DEFAULT_BOOKING_SCHEDULE: BookingSchedule = {
  timeZone: BOOKING_TIME_ZONE,
  durationMinutes: 25,
  bufferMinutes: 20,
  minLeadHours: BOOKING_MIN_LEAD_HOURS,
  maxAdvanceDays: BOOKING_MAX_ADVANCE_DAYS,
};

export type CalendarEventInput = {
  requestedStart: string;
  sourceInteractionId: string;
  conversationId: string;
  contactWaId: string;
  name: string;
  email: string;
  company: string | null;
  reason: string | null;
};

export type CalendarReservation = {
  eventId: string;
  start: string;
  end: string;
  meetLink: string | null;
  calendarLink: string | null;
  duplicate: boolean;
};

export type CalendarAvailability = {
  available: boolean;
  alternatives: string[];
  reason: string | null;
};

export type CalendarSlotSearch = {
  from?: string | null;
  to?: string | null;
  dayPart?: "ANY" | "MORNING" | "AFTERNOON" | "EARLIEST";
  exclude?: string[];
  count?: number;
};

export interface CalendarBookingClient {
  checkAvailability(requestedStart: string): Promise<CalendarAvailability>;
  findAvailableSlots(search?: CalendarSlotSearch): Promise<string[]>;
  create(input: CalendarEventInput): Promise<CalendarReservation>;
  reschedule(eventId: string, input: CalendarEventInput): Promise<CalendarReservation>;
  cancel(eventId: string): Promise<void>;
  get(eventId: string): Promise<CalendarReservation | null>;
}

export class BookingSlotUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingSlotUnavailableError";
  }
}

type GoogleEvent = {
  id?: string;
  htmlLink?: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
  hangoutLink?: string;
  conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
  error?: { message?: string };
};

type FreeBusyResponse = {
  calendars?: Record<string, { busy?: Array<{ start?: string; end?: string }>; errors?: unknown[] }>;
  error?: { message?: string };
};

type BusyPeriod = { start: Date; end: Date };

function eventIdFor(sourceInteractionId: string): string {
  return `af${createHash("sha256").update(sourceInteractionId).digest("hex").slice(0, 40)}`;
}

function localParts(date: Date, timeZone: string): { weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(value("weekday") ?? "");
  return { weekday, minutes: Number(value("hour")) * 60 + Number(value("minute")) };
}

function parseRequestedStart(requestedStart: string): Date {
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(requestedStart)) {
    throw new BookingSlotUnavailableError("La hora solicitada debe incluir una zona horaria");
  }
  const start = new Date(requestedStart);
  if (Number.isNaN(start.getTime())) throw new BookingSlotUnavailableError("La fecha solicitada no es válida");
  return start;
}

function isScheduleSlot(start: Date, schedule: BookingSchedule, now: Date): boolean {
  const earliest = new Date(now.getTime() + schedule.minLeadHours * 60 * 60 * 1000);
  const latest = new Date(now.getTime() + schedule.maxAdvanceDays * 24 * 60 * 60 * 1000);
  if (start < earliest || start > latest) return false;
  const { weekday, minutes } = localParts(start, schedule.timeZone);
  return (WEEKLY_AVAILABILITY[weekday] ?? []).some(([windowStart, windowEnd]) => {
    const offset = minutes - windowStart;
    return offset >= 0 && offset % (schedule.durationMinutes + schedule.bufferMinutes) === 0 &&
      minutes + schedule.durationMinutes <= windowEnd;
  });
}

export function validateBookingStart(
  requestedStart: string,
  now = new Date(),
  schedule = DEFAULT_BOOKING_SCHEDULE,
): { start: Date; end: Date } {
  const start = parseRequestedStart(requestedStart);
  const earliest = new Date(now.getTime() + schedule.minLeadHours * 60 * 60 * 1000);
  const latest = new Date(now.getTime() + schedule.maxAdvanceDays * 24 * 60 * 60 * 1000);
  if (start < earliest) throw new BookingSlotUnavailableError(`La cita requiere al menos ${schedule.minLeadHours} horas de anticipación`);
  if (start > latest) throw new BookingSlotUnavailableError(`La cita solo puede reservarse con hasta ${schedule.maxAdvanceDays} días de anticipación`);
  if (!isScheduleSlot(start, schedule, now)) {
    throw new BookingSlotUnavailableError("La hora solicitada no forma parte de la disponibilidad actual");
  }
  return { start, end: new Date(start.getTime() + schedule.durationMinutes * 60 * 1000) };
}

function reservationFromEvent(event: GoogleEvent, duplicate: boolean): CalendarReservation {
  if (!event.id || !event.start?.dateTime || !event.end?.dateTime) {
    throw new Error("Google Calendar returned an incomplete event");
  }
  const meetLink = event.hangoutLink ?? event.conferenceData?.entryPoints?.find(
    (entry) => entry.entryPointType === "video",
  )?.uri ?? null;
  return {
    eventId: event.id,
    start: event.start.dateTime,
    end: event.end.dateTime,
    meetLink,
    calendarLink: event.htmlLink ?? null,
    duplicate,
  };
}

function overlapsBusy(start: Date, end: Date, busy: BusyPeriod[], bufferMinutes: number): boolean {
  const bufferMs = bufferMinutes * 60 * 1000;
  const protectedStart = start.getTime() - bufferMs;
  const protectedEnd = end.getTime() + bufferMs;
  return busy.some((period) => period.start.getTime() < protectedEnd && period.end.getTime() > protectedStart);
}

export class GoogleCalendarBookingClient implements CalendarBookingClient {
  private readonly auth: OAuth2Client;

  constructor(
    clientId: string,
    clientSecret: string,
    refreshToken: string,
    private readonly calendarId: string,
    private readonly schedule: BookingSchedule = DEFAULT_BOOKING_SCHEDULE,
  ) {
    this.auth = new OAuth2Client(clientId, clientSecret);
    this.auth.setCredentials({ refresh_token: refreshToken });
  }

  private async accessToken(): Promise<string> {
    const result = await this.auth.getAccessToken();
    const token = typeof result === "string" ? result : result.token;
    if (!token) throw new Error("Google Calendar OAuth returned no access token");
    return token;
  }

  private async request(url: string, init: RequestInit, accessToken: string): Promise<Response> {
    return fetch(url, {
      ...init,
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        ...init.headers,
      },
    });
  }

  private eventUrl(eventId: string): string {
    return `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events/${eventId}`;
  }

  private async busyPeriods(timeMin: Date, timeMax: Date, accessToken: string): Promise<BusyPeriod[]> {
    const response = await this.request("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      body: JSON.stringify({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: this.schedule.timeZone,
        items: [{ id: this.calendarId }],
      }),
    }, accessToken);
    const body = await response.json().catch(() => null) as FreeBusyResponse | null;
    if (!response.ok) {
      throw new Error(`Google Calendar availability check failed: ${body?.error?.message ?? `HTTP ${response.status}`}`);
    }
    const calendar = body?.calendars?.[this.calendarId];
    if (calendar?.errors?.length) throw new Error("Google Calendar could not read calendar availability");
    return (calendar?.busy ?? []).flatMap((period) => {
      if (!period.start || !period.end) return [];
      return [{ start: new Date(period.start), end: new Date(period.end) }];
    });
  }

  private async alternativesNear(
    requested: Date,
    accessToken: string,
    count = 3,
    options: Pick<CalendarSlotSearch, "to" | "dayPart" | "exclude"> = {},
  ): Promise<string[]> {
    const now = new Date();
    const searchStart = new Date(Math.max(requested.getTime(), now.getTime() + this.schedule.minLeadHours * 3600000));
    searchStart.setUTCSeconds(0, 0);
    searchStart.setUTCMinutes(Math.ceil(searchStart.getUTCMinutes() / 5) * 5);
    const requestedEnd = options.to ? new Date(options.to).getTime() : Number.POSITIVE_INFINITY;
    const searchEnd = new Date(Math.min(
      requestedEnd,
      searchStart.getTime() + 14 * 24 * 3600000,
      now.getTime() + this.schedule.maxAdvanceDays * 24 * 3600000,
    ));
    const busy = await this.busyPeriods(
      new Date(searchStart.getTime() - this.schedule.bufferMinutes * 60000),
      new Date(searchEnd.getTime() + this.schedule.bufferMinutes * 60000),
      accessToken,
    );
    const alternatives: string[] = [];
    const excluded = new Set((options.exclude ?? []).map((value) => new Date(value).toISOString()));
    for (let timestamp = searchStart.getTime(); timestamp <= searchEnd.getTime(); timestamp += 5 * 60000) {
      const start = new Date(timestamp);
      if (!isScheduleSlot(start, this.schedule, now)) continue;
      const { minutes } = localParts(start, this.schedule.timeZone);
      if (options.dayPart === "MORNING" && minutes >= 12 * 60) continue;
      if (options.dayPart === "AFTERNOON" && minutes < 12 * 60) continue;
      if (excluded.has(start.toISOString())) continue;
      const end = new Date(timestamp + this.schedule.durationMinutes * 60000);
      if (!overlapsBusy(start, end, busy, this.schedule.bufferMinutes)) alternatives.push(start.toISOString());
      if (alternatives.length === count) break;
    }
    return alternatives;
  }

  async findAvailableSlots(search: CalendarSlotSearch = {}): Promise<string[]> {
    const now = new Date();
    const from = search.from ? new Date(search.from) : now;
    if (Number.isNaN(from.getTime())) throw new BookingSlotUnavailableError("La fecha de búsqueda no es válida");
    return this.alternativesNear(
      from,
      await this.accessToken(),
      search.count ?? 8,
      search,
    );
  }

  async checkAvailability(requestedStart: string): Promise<CalendarAvailability> {
    const requested = parseRequestedStart(requestedStart);
    const accessToken = await this.accessToken();
    let slot: { start: Date; end: Date };
    try {
      slot = validateBookingStart(requestedStart, new Date(), this.schedule);
    } catch (error) {
      if (!(error instanceof BookingSlotUnavailableError)) throw error;
      return { available: false, alternatives: await this.alternativesNear(requested, accessToken), reason: error.message };
    }
    const busy = await this.busyPeriods(
      new Date(slot.start.getTime() - this.schedule.bufferMinutes * 60000),
      new Date(slot.end.getTime() + this.schedule.bufferMinutes * 60000),
      accessToken,
    );
    if (!overlapsBusy(slot.start, slot.end, busy, this.schedule.bufferMinutes)) {
      return { available: true, alternatives: [], reason: null };
    }
    return {
      available: false,
      alternatives: await this.alternativesNear(requested, accessToken),
      reason: "Ese horario ya no está disponible",
    };
  }

  async get(eventId: string): Promise<CalendarReservation | null> {
    const response = await this.request(this.eventUrl(eventId), { method: "GET" }, await this.accessToken());
    if (response.status === 404 || response.status === 410) return null;
    const event = await response.json().catch(() => null) as GoogleEvent | null;
    if (!response.ok || !event) throw new Error(`Google Calendar event lookup failed: ${event?.error?.message ?? `HTTP ${response.status}`}`);
    return reservationFromEvent(event, true);
  }

  async create(input: CalendarEventInput): Promise<CalendarReservation> {
    const { start, end } = validateBookingStart(input.requestedStart, new Date(), this.schedule);
    const accessToken = await this.accessToken();
    const eventId = eventIdFor(input.sourceInteractionId);
    const existing = await this.request(this.eventUrl(eventId), { method: "GET" }, accessToken);
    if (existing.ok) return reservationFromEvent(await existing.json() as GoogleEvent, true);
    if (existing.status !== 404) throw new Error(`Google Calendar event lookup failed: HTTP ${existing.status}`);

    const busy = await this.busyPeriods(
      new Date(start.getTime() - this.schedule.bufferMinutes * 60000),
      new Date(end.getTime() + this.schedule.bufferMinutes * 60000),
      accessToken,
    );
    if (overlapsBusy(start, end, busy, this.schedule.bufferMinutes)) {
      throw new BookingSlotUnavailableError("Ese horario ya no está disponible");
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`;
    const response = await this.request(url, {
      method: "POST",
      body: JSON.stringify({
        id: eventId,
        summary: `Diagnóstico Estratégico de IA (${input.name})`,
        description: [
          "Reserva creada directamente por Valentina (IA) desde WhatsApp.",
          `Contacto: ${input.name}`,
          `Empresa: ${input.company ?? "No indicada"}`,
          `WhatsApp: ${input.contactWaId}`,
          `Motivo: ${input.reason ?? "Diagnóstico Estratégico de IA"}`,
          `Conversación: ${input.conversationId}`,
        ].join("\n"),
        attendees: [{ email: input.email, displayName: input.name }],
        start: { dateTime: start.toISOString(), timeZone: this.schedule.timeZone },
        end: { dateTime: end.toISOString(), timeZone: this.schedule.timeZone },
        conferenceData: {
          createRequest: { requestId: eventId, conferenceSolutionKey: { type: "hangoutsMeet" } },
        },
        guestsCanInviteOthers: false,
        guestsCanModify: false,
        extendedProperties: {
          private: {
            source: "agentefactory_whatsapp",
            sourceInteractionId: input.sourceInteractionId,
            conversationId: input.conversationId,
          },
        },
      }),
    }, accessToken);
    const event = await response.json().catch(() => null) as GoogleEvent | null;
    if (response.status === 409) {
      const duplicate = await this.request(this.eventUrl(eventId), { method: "GET" }, accessToken);
      if (duplicate.ok) return reservationFromEvent(await duplicate.json() as GoogleEvent, true);
    }
    if (!response.ok || !event) throw new Error(`Google Calendar event creation failed: ${event?.error?.message ?? `HTTP ${response.status}`}`);
    return reservationFromEvent(event, false);
  }

  async reschedule(eventId: string, input: CalendarEventInput): Promise<CalendarReservation> {
    const { start, end } = validateBookingStart(input.requestedStart, new Date(), this.schedule);
    const availability = await this.checkAvailability(input.requestedStart);
    if (!availability.available) throw new BookingSlotUnavailableError(availability.reason ?? "Ese horario no está disponible");
    const response = await this.request(
      `${this.eventUrl(eventId)}?conferenceDataVersion=1&sendUpdates=all`,
      {
        method: "PATCH",
        body: JSON.stringify({
          summary: `Diagnóstico Estratégico de IA (${input.name})`,
          attendees: [{ email: input.email, displayName: input.name }],
          start: { dateTime: start.toISOString(), timeZone: this.schedule.timeZone },
          end: { dateTime: end.toISOString(), timeZone: this.schedule.timeZone },
        }),
      },
      await this.accessToken(),
    );
    const event = await response.json().catch(() => null) as GoogleEvent | null;
    if (!response.ok || !event) throw new Error(`Google Calendar reschedule failed: ${event?.error?.message ?? `HTTP ${response.status}`}`);
    return reservationFromEvent(event, false);
  }

  async cancel(eventId: string): Promise<void> {
    const response = await this.request(
      `${this.eventUrl(eventId)}?sendUpdates=all`,
      { method: "DELETE" },
      await this.accessToken(),
    );
    if (!response.ok && response.status !== 404 && response.status !== 410) {
      const body = await response.json().catch(() => null) as GoogleEvent | null;
      throw new Error(`Google Calendar cancellation failed: ${body?.error?.message ?? `HTTP ${response.status}`}`);
    }
  }
}
