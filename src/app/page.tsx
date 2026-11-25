import type { Metadata } from "next";
import { CommercialOffer } from "@/components/brand/commercial-offer";
import { SessionBooking } from "@/components/brand/session-booking";
import { AgentCard } from "@/components/brand/agent-card";
import { TeamTourShowcase } from "@/components/brand/team-tour-showcase";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { agents } from "@/content/agents";
import { siteConfig } from "@/config/site";

const description = "25 minutos gratis con Alejandro Bermúdez para revisar un problema de tu negocio. Recibe una recomendación por escrito, costo estimado y una primera prueba.";
export const metadata: Metadata = {
  title: { absolute: "Sesión gratuita de IA para tu negocio | AgenteFactory" },
  description,
  alternates: { canonical: "/" },
  openGraph: { title: "¿Dónde está perdiendo tiempo, dinero o clientes tu negocio?", description, url: siteConfig.baseUrl, type: "website" },
};
const section = "mx-auto w-full max-w-7xl space-y-8 px-6 py-12 sm:px-10 lg:px-12";
const questions = [
  ["¿Y si no sé qué problema elegir o no sé de IA?", "Puedes llegar sin tenerlo claro. Alejandro escucha cómo trabajas y te ayuda a identificar un problema que te duela hoy."],
  ["¿Qué recibo gratis?", "En 25 minutos trabajamos un problema. Recibes una recomendación por escrito: qué probar primero, por qué, cuánto podría costar y cómo comprobar si funcionó."],
  ["¿En qué se diferencia del diagnóstico de US$250?", "La sesión gratuita trabaja un problema y una recomendación principal. El diagnóstico estudia entre tres y siete oportunidades distintas y entrega un plan priorizado, con guía inicial y reunión de revisión."],
  ["¿La sesión incluye instalar la solución?", "La sesión entrega una recomendación y una prueba concreta. La instalación, integración y adopción corresponden a implementación. El acompañamiento cuesta US$790 al mes; licencias y consumos aparte."],
  ["¿Qué conservo si dejo el acompañamiento?", "Trabajas en tus propias cuentas, aprendes a usar lo construido y conservas tu sistema."],
];
export default function Home() {
  return <div className="page-grid min-h-screen bg-[linear-gradient(180deg,#071a2b_0%,#081b2d_35%,#071423_100%)] text-white">
    <SiteHeader />
    <main>
      <section className="mx-auto w-full max-w-7xl space-y-5 px-6 py-8 sm:px-10 lg:px-12">
        <p className="text-sm font-medium text-cyan-200">Sesión gratuita de IA para tu negocio · 25 minutos</p>
        <h1 className="max-w-5xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">¿Dónde está perdiendo tiempo, dinero o clientes tu negocio?</h1>
        <Button href="/#reservar">Reservar mi sesión gratuita</Button>
        <p className="max-w-3xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">Revisamos contigo cómo trabajas hoy para encontrar un problema que valga la pena resolver. Usamos IA para comparar herramientas y te recomendamos cuál probar primero, cuánto costaría y cómo saber si te ayuda a ahorrar tiempo, vender más o atender mejor.</p>
        <p className="text-cyan-100">Con Alejandro Bermúdez. Acompañamiento y una recomendación por escrito.</p>
        <SessionBooking />
      </section>
      <section id="como-funciona" className={section}>
        <SectionHeading eyebrow="Antes → Solución → Después" title="Así trabajamos sobre tu caso" description="Partimos de lo que ocurre en tu negocio y acordamos un primer paso que puedas comprobar." />
        <div className="grid gap-5 md:grid-cols-3">{[
          ["ANTES", "Encontramos qué vale la pena resolver.", "Cuéntanos la última vez que pasó: quién intervino, cuánto tardó y cuántas veces ocurre. Puede ser una cotización sin seguimiento, una tarea manual o una respuesta tardía. Si no tienes cifras, distinguimos las estimaciones de los datos."],
          ["SOLUCIÓN", "Te recomendamos qué probar primero.", "Cuando el caso lo justifique, Alejandro usa IA para comparar de tres a cinco alternativas para ese mismo problema. Puede ser una función que ya pagas, una herramienta o una automatización. Recibes una recomendación principal según costo, esfuerzo y quién la usará."],
          ["DESPUÉS", "Acordamos cómo comprobar la mejora.", "Elegimos un resultado principal: recuperar oportunidades, ahorrar tiempo o mejorar la calidad y atención. Definimos una prueba y una medida, como minutos por pedido, cotizaciones con seguimiento o tiempo de respuesta. La instalación viene después."],
        ].map(([label, title, body]) => <Card key={label} className="space-y-4 p-6"><p className="text-sm tracking-widest text-cyan-200">{label}</p><h3 className="text-2xl font-semibold">{title}</h3><p className="leading-8 text-slate-300">{body}</p></Card>)}</div>
      </section>
      <section id="ejemplo" className={section}>
        <SectionHeading eyebrow="Ejemplo ilustrativo" title="Una recomendación que puedes poner a prueba." description="Este caso es hipotético: no es un testimonio ni un resultado histórico de AgenteFactory." />
        <Card className="grid gap-8 p-6 sm:p-10 lg:grid-cols-2">
          <div className="space-y-6"><div><h3 className="text-xl font-semibold">El problema</h3><p className="mt-2 leading-7 text-slate-300">El equipo dedica dos horas diarias a pasar pedidos de WhatsApp a una hoja de cálculo.</p></div>
          <div><h3 className="text-xl font-semibold">La recomendación</h3><p className="mt-2 leading-7 text-slate-300">Probar una herramienta que copie los datos del pedido y deje a una persona revisar las excepciones. Costo estimado de la herramienta: US$42 al mes.</p></div>
          <div><h3 className="text-xl font-semibold">Primera prueba</h3><p className="mt-2 leading-7 text-slate-300">Procesar diez pedidos y cronometrar cuánto tarda la revisión.</p></div></div>
          <div className="space-y-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-6"><p className="text-sm text-cyan-200">RESULTADO POTENCIAL</p><p className="text-4xl font-semibold">30 horas al mes</p><p className="leading-7 text-slate-300">Si el trabajo baja de dos horas a 30 minutos diarios durante 20 días, se recuperarían 30 horas al mes.</p><p className="leading-7 text-slate-300">Valorando la hora en US$40, representan US$1.200 de capacidad recuperada; US$1.158 al restar solo la licencia. Recuperar 63 minutos al mes cubriría sus US$42.</p><p className="text-sm leading-7 text-slate-400">Es tiempo disponible, no ingresos nuevos ni ahorro efectivo en caja garantizado. Instalación o revisión adicional cambiarían la cuenta.</p></div>
        </Card>
      </section>
      <CommercialOffer />
      <section id="agentes" className={section}>
        <SectionHeading eyebrow="Conoce al equipo" title="Tu empresa ya tiene personas. Ahora puede tener agentes." description="Estas especialidades muestran cómo podrías atender, vender y operar mejor. El alcance de cada solución se acuerda según el problema." />
        <TeamTourShowcase />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{agents.map(agent => <AgentCard key={agent.slug} agent={agent} />)}</div>
      </section>
      <section id="referidos" className={section}>
        <Card className="space-y-5 p-6 sm:p-10"><h2 className="text-3xl font-semibold">¿Conoces a otro dueño al que le serviría?</h2><p className="leading-8 text-slate-300">Después de recibir tu recomendación, puedes compartir la sesión. Si alguien te recomendó, indícalo al reservar: es opcional y nunca bloquea tu cita.</p><Button variant="secondary" href={`https://wa.me/?text=${encodeURIComponent("Te comparto la Sesión gratuita de IA para tu negocio de AgenteFactory: 25 minutos con Alejandro Bermúdez para revisar un problema y recibir una recomendación por escrito. https://agentefactory.pro/#reservar")}`}>Compartir la sesión</Button></Card>
      </section>
      <section id="faq" className={section}><SectionHeading eyebrow="Preguntas frecuentes" title="Empieza con claridad." /><div className="grid gap-5 md:grid-cols-2">{questions.map(([title, body]) => <Card key={title} className="space-y-4 p-6"><h3 className="text-2xl font-semibold">{title}</h3><p className="leading-8 text-slate-300">{body}</p></Card>)}</div></section>
      <section className={section}><h2 className="text-3xl font-semibold">Encuentra qué vale la pena resolver primero.</h2><p className="text-slate-300">25 minutos gratuitos con Alejandro Bermúdez y una recomendación por escrito.</p><Button href="/#reservar">Reservar mi sesión gratuita</Button></section>
    </main>
    <SiteFooter />
  </div>;
}
