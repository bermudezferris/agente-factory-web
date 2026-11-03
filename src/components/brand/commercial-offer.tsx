import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";

export const offerServices = [
  { title: "Sesión inicial gratuita", price: "Gratis", cadence: "25 minutos", items: ["Revisamos un problema concreto de tu negocio.", "Identificamos dónde podría ayudarte la IA.", "Recibes una primera recomendación para empezar."], label: "Reservar sesión gratuita", href: siteConfig.cta.href },
  { title: "Diagnóstico y plan de IA", price: "US$250", cadence: "Pago único", items: ["Entrevista de 45–60 minutos y entre 3 y 7 oportunidades priorizadas.", "Herramientas recomendadas con sus costos y guía de configuración inicial.", "Plan por escrito y reunión de revisión para resolver dudas."], label: "Ver el diagnóstico", href: "/diagnostico-estrategico-ia" },
  { title: "Implementación guiada de IA", price: "US$790", cadence: "Al mes", items: ["Cuatro sesiones individuales de 45 minutos, una por semana.", "Compartes pantalla y aplicamos el plan contigo, una solución a la vez.", "Consultas entre sesiones. Licencias y consumos de herramientas aparte."], label: "Consultar acompañamiento", href: siteConfig.contact.whatsappHref },
];

export function CommercialOffer() {
  return <>
    <section id="como-funciona" className="mx-auto w-full max-w-7xl scroll-mt-28 px-6 py-12 sm:px-10 lg:px-12">
      <Card className="space-y-6 p-6 sm:p-10" surface="solid">
        <SectionHeading eyebrow="Empieza con un primer paso" title="Pon la IA a trabajar en tu negocio. Te acompañamos paso a paso." description="Identificamos oportunidades, definimos un plan y te ayudamos a implementarlo con tus propias herramientas." />
        <div className="flex flex-col gap-3 sm:flex-row"><Button href={siteConfig.cta.href}>Reservar sesión gratuita</Button><Button href="#servicios" variant="secondary">Ver servicios y precios</Button></div>
        <p className="text-sm leading-7 text-slate-300">25 minutos para revisar un problema de tu negocio y recomendarte un primer paso.</p>
      </Card>
    </section>
    <section id="servicios" className="mx-auto w-full max-w-7xl scroll-mt-28 space-y-8 px-6 py-12 sm:px-10 lg:px-12">
      <SectionHeading eyebrow="Servicios y precios" title="Tres pasos para poner la IA a trabajar." description="Empiezas gratis. Tú decides cuándo avanzar a la siguiente etapa. Con tu plan, puedes continuar con tu equipo o contratar nuestro acompañamiento." />
      <div className="grid gap-5 lg:grid-cols-3">{offerServices.map(service => <Card key={service.title} className="flex flex-col gap-5 p-6">
        <h3 className="text-2xl font-semibold">{service.title}</h3><div><p className="text-4xl font-semibold text-cyan-200">{service.price}</p><p className="mt-2 text-sm text-slate-300">{service.cadence}</p></div>
        <ul className="flex-1 list-disc space-y-3 pl-5 text-slate-300">{service.items.map(item => <li key={item} className="leading-7">{item}</li>)}</ul><Button href={service.href} variant="secondary">{service.label}</Button>
      </Card>)}</div>
    </section>
    <section className="mx-auto w-full max-w-7xl space-y-8 px-6 py-12 sm:px-10 lg:px-12">
      <SectionHeading eyebrow="Resultado · Aprendizaje · Coaching" title="Resuelve una necesidad. Aprende haciéndolo. Avanza con acompañamiento." description="Trabajamos sobre situaciones reales de tu negocio para que obtengas una solución y desarrolles la capacidad de utilizarla." />
      <div className="grid gap-5 md:grid-cols-3">{[
        ["Resultado práctico", "Trabajamos contigo para poner en funcionamiento una solución concreta, según las prioridades y el alcance acordados."],
        ["Práctica y aprendizaje", "Aprendes haciendo, con tus herramientas y casos reales. Entiendes cómo utilizar, ajustar y mantener lo que construimos."],
        ["Coaching y acompañamiento", "Te ayudamos a tomar decisiones, resolver bloqueos y definir el siguiente paso durante las sesiones y consultas incluidas."],
      ].map(([title, body]) => <Card key={title} className="space-y-4 p-6"><h3 className="text-2xl font-semibold">{title}</h3><p className="leading-8 text-slate-300">{body}</p></Card>)}</div>
      <p className="text-lg text-cyan-200">Tus cuentas. Tus herramientas. Lo que construimos se queda contigo, también si dejas el servicio.</p>
    </section>
  </>;
}

export function WebsitePromotion() {
  return <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12"><Card className="space-y-6 border-cyan-300/30 p-6 sm:p-10"><SectionHeading eyebrow="Especial de noviembre de 2026" title="Tu website por US$499." description="Frontend, backend y ajustes sobre el alcance acordado. Cuéntanos qué necesita tu negocio para definir las funcionalidades antes de contratar." /><Button href="/websites">Ver promoción</Button></Card></section>;
}
