import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";

export const offerServices = [
  { title: "Sesión gratuita de IA para tu negocio", price: "Gratis", cadence: "25 minutos", items: ["Revisamos un problema concreto de tu negocio.", "Alejandro Bermúdez te ayuda a elegir qué resolver, aunque no sepas de IA.", "Recibes una recomendación por escrito, costo estimado, primera prueba y medida de éxito."], label: "Reservar mi sesión gratuita", href: siteConfig.cta.href },
  { title: "Diagnóstico y plan de IA", price: "US$250", cadence: "Pago único", items: ["Entrevista de 45–60 minutos y entre 3 y 7 oportunidades distintas, priorizadas por impacto y esfuerzo.", "Herramientas recomendadas con sus costos y guía de configuración inicial.", "Plan por escrito y reunión de revisión para resolver dudas."], label: "Ver el diagnóstico", href: "/diagnostico-estrategico-ia" },
  { title: "Implementación guiada de IA", price: "US$790", cadence: "Al mes", items: ["Cuatro sesiones individuales de 45 minutos, una por semana.", "Compartes pantalla y ponemos en marcha una mejora a la vez. Aprendes en tus cuentas y conservas el sistema.", "Consultas entre sesiones. Licencias y consumos de herramientas aparte."], label: "Consultar implementación", href: siteConfig.contact.whatsappHref },
];

export function CommercialOffer() {
  return <>
    <section id="servicios" className="mx-auto w-full max-w-7xl scroll-mt-28 space-y-8 px-6 py-12 sm:px-10 lg:px-12">
      <SectionHeading eyebrow="Servicios y precios" title="Tres pasos para poner la IA a trabajar." description="Empiezas gratis. Tú decides cuándo avanzar a la siguiente etapa. Con tu plan, puedes continuar con tu equipo o contratar nuestro acompañamiento." />
      <div className="grid gap-5 lg:grid-cols-3">{offerServices.map(service => <Card key={service.title} className="flex flex-col gap-5 p-6">
        <h3 className="text-2xl font-semibold">{service.title}</h3><div><p className="text-4xl font-semibold text-cyan-200">{service.price}</p><p className="mt-2 text-sm text-slate-300">{service.cadence}</p></div>
        <ul className="flex-1 list-disc space-y-3 pl-5 text-slate-300">{service.items.map(item => <li key={item} className="leading-7">{item}</li>)}</ul><Button href={service.href} variant="secondary">{service.label}</Button>
      </Card>)}</div>
    </section>
  </>;
}

export function WebsitePromotion() {
  return <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12"><Card className="space-y-6 border-cyan-300/30 p-6 sm:p-10"><SectionHeading eyebrow="Especial de noviembre de 2026" title="Tu website por US$499." description="Frontend, backend y ajustes sobre el alcance acordado. Cuéntanos qué necesita tu negocio para definir las funcionalidades antes de contratar." /><Button href="/websites">Ver promoción</Button></Card></section>;
}
