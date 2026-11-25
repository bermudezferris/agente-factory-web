"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { bookingLink } from "@/lib/booking-link";

export function SessionBooking() {
  const [referrer, setReferrer] = useState("");
  return <div id="reservar" className="max-w-xl scroll-mt-28 space-y-3">
    <label htmlFor="session-referrer" className="block text-sm text-slate-200">¿Quién te recomendó? (opcional)</label>
    <input id="session-referrer" value={referrer} onChange={event => setReferrer(event.target.value)} maxLength={160} autoComplete="off" aria-describedby="booking-route" className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300" />
    <p id="booking-route" aria-live="polite" className="text-sm text-slate-300">{referrer.trim() ? "Continuarás por WhatsApp con Valentina. Verás el nombre de quien te recomendó en el mensaje y decidirás si lo envías." : "Continuarás al calendario para elegir tu horario. Puedes dejar este campo en blanco."}</p>
    <Button href={bookingLink(referrer, siteConfig.calendarHref, siteConfig.contact.whatsappNumber)}>Reservar mi sesión gratuita</Button>
  </div>;
}
