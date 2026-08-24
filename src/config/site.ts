const whatsappNumber = "584122645002";
const whatsappMessage = encodeURIComponent(
  "Hola, quiero agendar mi Diagnóstico Estratégico de IA para evaluar oportunidades concretas para mi empresa.",
);

export const siteConfig = {
  baseUrl: "https://agentefactory.pro",
  name: "AgenteFactory",
  tagline: "Agentes que trabajan. Resultados que se miden.",
  description:
    "AgenteFactory identifica oportunidades concretas, diseña sistemas de agentes de IA e implementa soluciones orientadas a resultados empresariales.",
  supportText:
    "Sesión gratuita de 25 minutos por Zoom o Google Meet con un consultor estratégico de IA.",
  cta: {
    label: "Agenda tu Diagnóstico Estratégico de IA",
    href: "https://calendar.app.google/fpBQSm3KDvQH3wqF8",
  },
  secondaryCta: {
    label: "Conoce a los agentes",
    href: "/#agentes",
  },
  privacyHref: "/privacidad",
  nav: [
    { href: "/diagnostico-estrategico-ia", label: "Diagnóstico" },
    { href: "/#resultados", label: "Resultados" },
    { href: "/#agentes", label: "Agentes" },
    { href: "/#faq", label: "FAQ" },
  ],
  contact: {
    whatsappNumber,
    whatsappHref: `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`,
    email: null,
  },
} as const;
