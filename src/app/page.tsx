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

const diagnosticSteps = [
  {
    body: "Sesiones breves, enfocadas y orientadas a detectar el dolor principal, la situación actual y la situación deseada.",
    step: "1",
    title: "Entendemos el negocio antes que la tecnología",
  },
  {
    body: "Identificamos brechas, barreras y oportunidades concretas donde la IA puede eliminar fricción o acelerar resultados.",
    step: "2",
    title: "Priorizamos oportunidades reales",
  },
  {
    body: "Definimos los agentes adecuados y la forma en que deben trabajar juntos como sistema, no como piezas aisladas.",
    step: "3",
    title: "Diseñamos el sistema de agentes",
  },
];

const reportSections = [
  "Dolor identificado",
  "Situación actual",
  "Situación deseada",
  "Brecha encontrada",
  "Barreras principales",
  "Oportunidades de IA",
  "Priorización por impacto y viabilidad",
  "Tres oportunidades prioritarias",
  "Indicadores recomendados",
  "Próximos pasos",
];

const faqs = [
  {
    answer:
      "No. El diagnóstico está pensado para identificar oportunidades concretas, incluso si hoy no tienes claridad sobre qué tipo de solución necesitas.",
    question: "¿Necesito saber de IA antes de agendar?",
  },
  {
    answer:
      "No presentamos agentes como productos sueltos. Primero entendemos el negocio y luego definimos qué agentes hacen falta, cómo se conectan y qué proceso deben transformar.",
    question: "¿AgenteFactory vende chatbots?",
  },
  {
    answer:
      "Buscamos detectar el dolor principal, mapear la situación actual y priorizar oportunidades con impacto y viabilidad real para tu empresa.",
    question: "¿Qué obtengo en el Diagnóstico Estratégico de IA?",
  },
  {
    answer:
      "Cuando aparece una oportunidad viable, AgenteFactory puede presentar una propuesta separada para diseñar e implementar la solución recomendada.",
    question: "¿Qué pasa después del diagnóstico?",
  },
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
                  <Badge tone="accent">Diagnóstico Estratégico de IA</Badge>
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

          <section
            id="agentes"
            className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-12 pt-4 sm:px-10 lg:px-12 lg:pt-6"
          >
            <SectionHeading
              description="Presentamos los agentes como profesionales de IA personificados para hacer visible cómo se organiza el trabajo. No son empleados humanos ni productos aislados."
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

          <section
            id="diagnostico"
            className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12"
          >
            <SectionHeading
              description="El Diagnóstico Estratégico de IA es la puerta de entrada a todo el sistema. Nos permite entender dónde está el problema, qué impacto tendría resolverlo y qué agentes conviene diseñar primero."
              eyebrow="Entrada comercial"
              title="El primer paso no es implementar. Es diagnosticar con criterio."
            />

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <Card className="p-6 sm:p-8" surface="solid">
                <div className="space-y-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                    Qué incluye
                  </p>
                  <ul className="space-y-4 text-base leading-8 text-slate-300">
                    <li>Sesión gratuita de 25 minutos con un consultor estratégico de IA.</li>
                    <li>Detección del dolor principal, la situación actual y la situación deseada.</li>
                    <li>Identificación de barreras y oportunidades concretas de IA.</li>
                    <li>Priorización por impacto y viabilidad.</li>
                    <li>Recomendación de próximos pasos y agentes adecuados.</li>
                  </ul>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button href={siteConfig.cta.href}>
                      {siteConfig.cta.label}
                    </Button>
                    <Button href="#faq" variant="secondary">
                      Resolver preguntas
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid gap-5">
                {diagnosticSteps.map((step) => (
                  <Card key={step.title} className="p-6">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-300/24 bg-cyan-300/10 text-base font-semibold text-cyan-100">
                        {step.step}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                          {step.title}
                        </h3>
                        <p className="text-base leading-8 text-slate-300">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
            <SectionHeading
              description="Después de la sesión, los agentes de IA procesan la información y preparan un reporte para ordenar prioridades, visualizar impacto y definir siguientes decisiones."
              eyebrow="Reporte de salida"
              title="El diagnóstico no termina en una conversación. Termina en un mapa de oportunidades accionable."
            />

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="p-6 sm:p-8" surface="solid">
                <div className="space-y-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                    Vista previa del reporte
                  </p>
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                          Diagnóstico estratégico de IA
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          Resumen ejecutivo de oportunidades
                        </p>
                      </div>
                      <div className="rounded-full border border-cyan-300/18 bg-cyan-300/8 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-100">
                        Vista previa
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {reportSections.slice(0, 6).map((item) => (
                        <div
                          key={item}
                          className="rounded-[1.2rem] border border-white/10 bg-[var(--color-surface-ghost)] px-4 py-3 text-sm text-slate-300"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 sm:p-8">
                <div className="space-y-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                    Lo que busca resolver
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {reportSections.map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4"
                      >
                        <p className="text-sm leading-7 text-slate-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section
            id="faq"
            className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12"
          >
            <SectionHeading
              description="Respondemos lo esencial para que el visitante entienda que el diagnóstico es una conversación estratégica, no una demo ni una promesa vacía."
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
              description="Si existe una oportunidad real, después del diagnóstico AgenteFactory puede proponer la implementación adecuada. El objetivo inicial no es vender tecnología. Es entender dónde conviene intervenir y con qué sistema de agentes."
              title="Agenda una sesión breve para entender el problema correcto antes de diseñar la solución."
            />
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
