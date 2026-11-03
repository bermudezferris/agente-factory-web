import type { Metadata } from "next";

import { CommercialOffer, WebsitePromotion } from "@/components/brand/commercial-offer";
import { AgentCard } from "@/components/brand/agent-card";
import { CtaBanner } from "@/components/brand/cta-banner";
import { TeamTourShowcase } from "@/components/brand/team-tour-showcase";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResultTag } from "@/components/ui/result-tag";
import { SectionHeading } from "@/components/ui/section-heading";
import { agents } from "@/content/agents";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    absolute: "Agentes de IA para empresas | AgenteFactory",
  },
  description:
    "AgenteFactory identifica oportunidades concretas, diseña sistemas de agentes de IA especializados e implementa soluciones para vender más, atender mejor, operar mejor y decidir con más claridad.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Agentes de IA para empresas | AgenteFactory",
    description:
      "AgenteFactory identifica oportunidades concretas, diseña sistemas de agentes de IA especializados e implementa soluciones para vender más, atender mejor, operar mejor y decidir con más claridad.",
    type: "website",
    url: siteConfig.baseUrl,
  },
};

const urgencySignals = [
  "Mientras una empresa responde manualmente, otra ya califica, documenta y mide en paralelo.",
  "La ventaja no viene de tener más herramientas, sino de orquestarlas con criterio operativo.",
  "Adoptar IA sin diagnóstico suele producir pilotos aislados. Diagnosticar primero permite construir con dirección.",
];

const resultBuckets = [
  {
    items: ["Prospección", "Calificación", "Seguimiento", "Agenda", "CRM", "Reactivación"],
    title: "Vender más",
  },
  {
    items: ["WhatsApp", "Voz", "Web", "Soporte", "Consultas", "Posventa"],
    title: "Atender mejor",
  },
  {
    items: ["Documentos", "Solicitudes", "Aprobaciones", "Tareas", "Integraciones", "Alertas"],
    title: "Operar mejor",
  },
  {
    items: ["Búsquedas", "Expedientes", "Procedimientos", "Reportes", "Análisis", "Indicadores"],
    title: "Aprovechar mejor la información",
  },
];

const systemSteps = [
  {
    body: "Carlos atiende con contexto y consistencia.",
    title: "Carlos atiende",
  },
  {
    body: "Valentina califica, agenda y da seguimiento.",
    title: "Valentina mueve ventas",
  },
  {
    body: "Olivia coordina tareas, aprobaciones e integraciones.",
    title: "Olivia ejecuta",
  },
  {
    body: "Sofía encuentra y organiza la información relevante.",
    title: "Sofía aporta criterio documental",
  },
  {
    body: "Diego mide impacto, detecta cuellos de botella y ordena prioridades.",
    title: "Diego convierte actividad en gestión",
  },
];

const faqs = [
  { question: "¿La sesión gratuita incluye el diagnóstico?", answer: "La sesión inicial dura 25 minutos y ofrece una primera recomendación. El diagnóstico y plan es un servicio separado de US$250, con entrevista, oportunidades priorizadas, guía e informe con revisión." },
  { question: "¿Qué incluye el acompañamiento mensual?", answer: "Por US$790 al mes recibes cuatro sesiones individuales de 45 minutos y consultas entre sesiones. Compartes pantalla y trabajamos contigo en una solución a la vez. Licencias y consumos se pagan aparte." },
  { question: "¿Necesito saber de IA?", answer: "No. Te guiamos paso a paso con tus herramientas y casos reales. Necesitas participar en las sesiones y practicar para aprender a utilizar lo que construimos." },
  { question: "¿Qué pasa si dejo el servicio?", answer: "Conservas lo construido en tus propias cuentas. Con tu plan puedes continuar con tu equipo o contratar acompañamiento. Los desarrollos adicionales se cotizan según su alcance." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#071a2b_0%,#081b2d_24%,#071423_100%)] text-white">
      <div className="page-grid relative overflow-hidden">
        <div
          className="ambient-orb left-[-8rem] top-16 h-72 w-72"
          style={{ background: "rgba(50, 107, 255, 0.16)" }}
        />
        <div
          className="ambient-orb right-[-8rem] top-40 h-96 w-96"
          style={{ background: "rgba(0, 199, 230, 0.12)" }}
        />

        <SiteHeader />

        <main className="relative z-10">
          <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-14 pt-8 sm:px-10 lg:px-12 lg:pb-18 lg:pt-10">
            <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge tone="accent">IA aplicada a tu negocio</Badge>
                  <div className="space-y-4">
                    <h1 className="max-w-5xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-balance text-white sm:text-5xl lg:text-[4.6rem]">
                      Tu empresa ya tiene personas. Ahora puede tener agentes.
                    </h1>
                    <p className="max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
                      AgenteFactory identifica oportunidades concretas,
                      diseña sistemas de agentes de IA especializados e
                      implementa soluciones para vender más, atender mejor,
                      operar mejor y decidir con más claridad.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button href={siteConfig.cta.href}>
                    {siteConfig.cta.label}
                  </Button>
                  <Button href={siteConfig.secondaryCta.href} variant="secondary">
                    {siteConfig.secondaryCta.label}
                  </Button>
                </div>

                <p className="max-w-2xl text-sm leading-7 text-slate-400">
                  {siteConfig.supportText}
                </p>

                <div className="flex flex-wrap gap-3 pt-1">
                  <ResultTag label="Ventas" />
                  <ResultTag label="Atención" />
                  <ResultTag label="Operaciones" />
                  <ResultTag label="Conocimiento" />
                  <ResultTag label="Análisis" />
                </div>
              </div>

              <TeamTourShowcase />
            </div>
          </section>

          <CommercialOffer />

          <section
            id="agentes"
            className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-12 pt-4 sm:px-10 lg:px-12 lg:pt-6"
          >
            <SectionHeading
              description="Presentamos los agentes como profesionales de IA personificados para hacer visible cómo se organiza el trabajo. Son ejemplos de especialidades: el alcance de cada solución se acuerda por separado."
              eyebrow="Equipo de agentes"
              title="Cada agente tiene una especialidad. El valor es exponencial cuando trabajan como sistema."
            />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.slug} agent={agent} />
              ))}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
            <SectionHeading
              description="Un agente puede ejecutar una tarea puntual. Cuando se conectan entre sí, el resultado ya no es una automatización aislada sino un proceso más completo, medible y ordenado."
              eyebrow="Trabajo coordinado"
              title="Así se ve un sistema de trabajo cuando los agentes colaboran."
            />

            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="p-6 sm:p-8" surface="solid">
                <div className="space-y-6">
                  {systemSteps.map((step, index) => (
                    <div
                      key={step.title}
                      className="flex gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                        {index + 1}
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold tracking-[-0.02em] text-white">
                          {step.title}
                        </p>
                        <p className="text-sm leading-7 text-slate-300">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="overflow-hidden p-6 sm:p-8">
                <div className="space-y-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                    Sistema de agentes
                  </p>
                  <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        {agents.slice(0, 4).map((agent) => (
                          <div
                            key={agent.slug}
                            className="rounded-[1.4rem] border border-white/10 bg-[var(--color-surface-ghost)] p-4"
                          >
                            <div
                              className="h-2 w-16 rounded-full"
                              style={{ background: agent.accent }}
                            />
                            <p className="mt-4 text-lg font-semibold text-white">
                              {agent.name}
                            </p>
                            <p className="mt-1 text-sm text-slate-300">
                              {agent.role}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-[1.5rem] border border-cyan-300/18 bg-cyan-300/8 p-5">
                        <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-100">
                          Resultado esperado
                        </p>
                        <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
                          Un sistema que atiende, califica, ejecuta, informa y
                          mide sin depender de seguimiento manual en cada paso.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section
            id="resultados"
            className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12"
          >
            <SectionHeading
              description="La urgencia no viene de una moda. Viene de la diferencia entre empresas que siguen operando con fricción y empresas que ya empiezan a trabajar con más velocidad, contexto y consistencia."
              eyebrow="Urgencia competitiva"
              title="La pregunta ya no es si la IA puede ayudar. La pregunta es dónde conviene aplicarla primero."
            />

            <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
              <Card className="p-6 sm:p-8" surface="solid">
                <div className="space-y-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                    Lo que cambia
                  </p>
                  <div className="space-y-4">
                    {urgencySignals.map((item) => (
                      <p
                        key={item}
                        className="rounded-[1.45rem] border border-white/10 bg-white/5 px-5 py-4 text-base leading-8 text-slate-300"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="grid gap-5 md:grid-cols-2">
                {resultBuckets.map((bucket) => (
                  <Card key={bucket.title} className="p-6">
                    <div className="space-y-5">
                      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                        {bucket.title}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {bucket.items.map((item) => (
                          <ResultTag key={item} label={item} />
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <WebsitePromotion />

          <section
            id="faq"
            className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12"
          >
            <SectionHeading
              description="Conoce qué incluye cada etapa y cómo participar en el acompañamiento."
              eyebrow="Preguntas frecuentes"
              title="Preguntas comunes antes de agendar."
            />

            <div className="grid gap-5 lg:grid-cols-2">
              {faqs.map((item) => (
                <Card key={item.question} className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                      {item.question}
                    </h3>
                    <p className="text-base leading-8 text-slate-300">
                      {item.answer}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
            <CtaBanner
              description="Empieza con una sesión gratuita de 25 minutos. Después puedes contratar tu plan por US$250 y, si lo necesitas, acompañamiento por US$790 al mes."
              title="Agenda una sesión breve para entender el problema correcto antes de diseñar la solución."
            />
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
