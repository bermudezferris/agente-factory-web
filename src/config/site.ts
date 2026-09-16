const whatsappNumber = "584129097101";
const whatsappMessage = encodeURIComponent(
  "Hola Valentina, cuéntame cómo AgenteFactory podría ayudarme.",
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
    href: "https://calendar.app.google/g1tSBXA9rHXQ8tLW8",
  },
  secondaryCta: {
    label: "Conoce a los agentes",
    href: "/#agentes",
  },
  privacyHref: "/privacy",
  nav: [
    { href: "/diagnostico-estrategico-ia", label: "Diagnóstico" },
    { href: "/#resultados", label: "Resultados" },
    { href: "/#agentes", label: "Agentes" },
    { href: "/#faq", label: "FAQ" },
  ],
  contact: {
    whatsappNumber,
    whatsappMessage: "Hola Valentina, cuéntame cómo AgenteFactory podría ayudarme.",
    whatsappHref: `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`,
    email: "bermudez.ferris@gmail.com",
  },
} as const;
