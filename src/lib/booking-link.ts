export function bookingLink(referrer: string, calendar: string, phone: string) {
  const name = referrer.trim();
  return name
    ? `https://wa.me/${phone}?text=${encodeURIComponent(`Quiero reservar la Sesión gratuita de IA para tu negocio. Me recomendó: ${name}`)}`
    : calendar;
}
