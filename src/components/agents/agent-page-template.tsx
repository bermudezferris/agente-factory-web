import Link from "next/link";

import { AgentPortrait } from "@/components/brand/agent-portrait";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResultTag } from "@/components/ui/result-tag";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AgentDetail } from "@/content/agents";
import { getAgentBySlug } from "@/content/agents";
import { siteConfig } from "@/config/site";

type AgentPageTemplateProps = {
  agent: AgentDetail;
  previewViewport?: "desktop" | "mobile";
};

export function AgentPageTemplate({
  agent,
  previewViewport = "desktop",
}: AgentPageTemplateProps) {
  const collaborators = agent.collaboratesWith
    .map((item) => {
      const collaborator = getAgentBySlug(item.slug);
      if (!collaborator) return null;

      return {
        ...collaborator,
        exchange: item.exchange,
        reason: item.reason,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const isMobilePreview = previewViewport === "mobile";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#071a2b_0%,#081b2d_28%,#071423_100%)] text-white">
      <div
        className={
          isMobilePreview
            ? "mx-auto my-6 max-w-[420px] rounded-[2.4rem] border border-white/10 bg-[#081827] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.35)]"
            : ""
        }
      >
        <div className="page-grid relative overflow-hidden">
          <div
            className="ambient-orb left-[-7rem] top-14 h-72 w-72"
            style={{ background: "rgba(50, 107, 255, 0.14)" }}
          />
          <div
            className="ambient-orb right-[-8rem] top-48 h-96 w-96"
            style={{ background: "rgba(34, 211, 238, 0.12)" }}
          />

          <SiteHeader />

          <main className="relative z-10">
            <section className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 pb-16 pt-12 sm:px-10 lg:px-12 lg:pb-22 lg:pt-16">
              <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
                <div className="space-y-7">
                  <div className="space-y-5">
                    <Badge tone="accent">{agent.name}</Badge>
                    <h1 className="max-w-5xl text-5xl font-semibold leading-[1.03] tracking-[-0.05em] text-balance text-white sm:text-6xl lg:text-[5rem]">
                      {agent.headline}
                    </h1>
                    <p className="max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
                      {agent.mission}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button href={siteConfig.cta.href}>
                      Agenda tu Diagnóstico Estratégico de IA
                    </Button>
                    <Button href="/#agentes" variant="secondary">
                      Volver al sistema de agentes
                    </Button>
                  </div>

                  <p className="max-w-2xl text-sm leading-7 text-slate-400">
                    {agent.personalityLine ?? agent.tagline}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <ResultTag label={agent.result} />
                    <ResultTag label={agent.role} />
                  </div>
                </div>

                <Card className="overflow-hidden p-6 sm:p-8" surface="solid">
                  <div className="grid gap-6 md:grid-cols-[0.88fr_1.12fr] md:items-center">
                    <AgentPortrait
                      accent={agent.accent}
                      className="h-72"
                      initials={agent.initials}
                      portrait={agent.portrait}
                    />
                    <div className="space-y-5">
                      <div>
                        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                          Especialidad
                        </p>
                        <p className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] text-white">
                          {agent.role}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-cyan-300/18 bg-cyan-300/8 p-5">
                        <p className="text-[0.72rem] uppercase tracking-[0.22em] text-cyan-100">
                          Problema que resuelve
                        </p>
                        <p className="mt-3 text-base leading-8 text-slate-200">
                          {agent.problem}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
              <SectionHeading
                description="La necesidad de este agente se hace visible cuando ciertos síntomas empiezan a repetirse en la operación diaria."
                eyebrow="Señales"
                title={`Cuándo suele hacer falta ${agent.name}.`}
              />

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {agent.signals.map((signal) => (
                  <Card key={signal} className="p-6">
                    <div className="space-y-4">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                        {agent.name.slice(0, 1)}
                      </span>
                      <p className="text-base leading-8 text-slate-300">{signal}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
              <SectionHeading
                description="Su trabajo no depende de magia. Depende de información disponible, reglas claras y acciones bien delimitadas."
                eyebrow="Responsabilidades"
                title={`${agent.name} trabaja con entradas concretas y ejecuta acciones específicas.`}
              />

              <div className="grid gap-5 lg:grid-cols-3">
                <Card className="p-6 sm:p-8" surface="solid">
                  <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                      Fuentes de información
                    </p>
                    <ul className="space-y-3 text-sm leading-7 text-slate-300">
                      {agent.informationSources.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </Card>

                <Card className="p-6 sm:p-8">
                  <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                      Decisiones o acciones
                    </p>
                    <ul className="space-y-3 text-sm leading-7 text-slate-300">
                      {agent.decisionsAndActions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </Card>

                <Card className="p-6 sm:p-8">
                  <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                      Qué entrega o registra
                    </p>
                    <ul className="space-y-3 text-sm leading-7 text-slate-300">
                      {agent.postActionDeliverables.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </div>
            </section>

            <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
              <SectionHeading
                description="Aquí se muestra la metodología del agente de forma operativa y sin frases de relleno."
                eyebrow="Así trabaja"
                title={`Paso a paso de trabajo de ${agent.name}.`}
              />

              <div className="grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
                <Card className="p-6 sm:p-8" surface="solid">
                  <div className="space-y-4">
                    {agent.howItWorks.map((item, index) => (
                      <div
                        key={item}
                        className="flex gap-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/22 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-7 text-slate-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 sm:p-8">
                  <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                      Resultados esperados
                    </p>
                    <div className="grid gap-4">
                      {agent.expectedResults.map((item) => (
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

            <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
              <SectionHeading
                description="El escenario práctico muestra cómo se comporta el agente dentro de una interacción o jornada completa."
                eyebrow="Escenario práctico"
                title={`${agent.name} en una situación real de trabajo.`}
              />

              <Card className="p-6 sm:p-8" surface="solid">
                <div className="grid gap-4">
                  {agent.scenario.map((step) => (
                    <div
                      key={step.title}
                      className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5"
                    >
                      <p className="text-lg font-semibold tracking-[-0.02em] text-white">
                        {step.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {step.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
              <SectionHeading
                description="Estos agentes ayudan a ejecutar y ordenar trabajo, pero siguen operando dentro de límites definidos por la empresa."
                eyebrow="Control humano y límites"
                title={`Qué no debe hacer ${agent.name} sin autorización y cuándo escala a una persona.`}
              />

              <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                <Card className="p-6 sm:p-8" surface="solid">
                  <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                      Cuándo escala al equipo humano
                    </p>
                    <p className="text-base leading-8 text-slate-300">
                      {agent.humanEscalation}
                    </p>
                  </div>
                </Card>

                <Card className="p-6 sm:p-8">
                  <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                      Límites operativos
                    </p>
                    <ul className="space-y-3 text-sm leading-7 text-slate-300">
                      {agent.humanLimits.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </div>
            </section>

            <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
              <SectionHeading
                description="La medición correcta permite saber si el agente realmente está ayudando o solo generando actividad."
                eyebrow="Indicadores"
                title={`Cómo medir el desempeño de ${agent.name}.`}
              />

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                {agent.indicators.map((item) => (
                  <Card key={item} className="p-5">
                    <p className="text-sm leading-7 text-slate-300">{item}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
              <SectionHeading
                description="Los casos de uso ayudan a visualizar dónde este agente aporta valor dentro de un proceso real, sin presentarlo como una pieza aislada."
                eyebrow="Casos de uso"
                title={`Dónde suele aportar más ${agent.name}.`}
              />

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                {agent.useCases.map((item) => (
                  <Card key={item} className="p-5">
                    <p className="text-sm leading-7 text-slate-300">{item}</p>
                  </Card>
                ))}
              </div>
            </section>

            {agent.valueMessage ? (
              <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
                <Card className="overflow-hidden p-6 sm:p-8" surface="solid">
                  <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                        Mensaje de valor
                      </p>
                      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                        {agent.valueMessage.title}
                      </p>
                    </div>
                    <p className="text-base leading-8 text-slate-300">
                      {agent.valueMessage.body}
                    </p>
                  </div>
                </Card>
              </section>
            ) : null}

            <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
              <SectionHeading
                description="La colaboración define qué información recibe cada agente, qué devuelve y en qué momento le pasa la posta a otro especialista."
                eyebrow="Colaboración con otros agentes"
                title={`${agent.name} no trabaja solo: intercambia contexto, tareas o señales con otros agentes del sistema.`}
              />

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {collaborators.map((collaborator) => (
                  <Card key={collaborator.slug} className="p-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xl font-semibold text-white">
                            {collaborator.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            {collaborator.role}
                          </p>
                        </div>
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ background: collaborator.accent }}
                        />
                      </div>
                      <p className="text-sm leading-7 text-slate-300">
                        {collaborator.reason}
                      </p>
                      <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                        <p className="text-sm leading-7 text-slate-300">
                          Intercambian: {collaborator.exchange}
                        </p>
                      </div>
                      <Link
                        href={`/agentes/${collaborator.slug}`}
                        className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
                      >
                        Ver a {collaborator.name}
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {agent.futureIntegrations?.length ? (
              <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
                <SectionHeading
                  description="Estas conexiones se muestran como preparación futura. No se presentan como activas mientras no estén implementadas."
                  eyebrow="Preparado para integrarse con"
                  title={`${agent.name} puede conectarse con herramientas que refuerzan su lectura y seguimiento.`}
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                  {agent.futureIntegrations.map((item) => (
                    <Card key={item} className="p-5">
                      <p className="text-sm leading-7 text-slate-300">{item}</p>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
              <SectionHeading
                description="El diagnóstico no se repite como muletilla. Aquí se explica exactamente qué define antes de implementar este agente."
                eyebrow="Qué determina el diagnóstico"
                title={`Antes de implementar a ${agent.name}, el Diagnóstico Estratégico de IA debe fijar reglas, límites y lugar dentro del proceso.`}
              />

              <Card className="p-6 sm:p-8" surface="solid">
                <div className="space-y-5">
                  <p className="text-base leading-8 text-slate-300">
                    {agent.diagnosticDefinition}
                  </p>
                </div>
              </Card>
            </section>

            <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
              <Card className="overflow-hidden p-8 sm:p-10" surface="solid">
                <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
                  <div className="space-y-4">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                      Siguiente paso
                    </p>
                    <p className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-white">
                      El siguiente paso no es activar al agente más llamativo. Es definir el sistema adecuado para tu negocio.
                    </p>
                    <p className="text-base leading-8 text-slate-300">
                      El Diagnóstico Estratégico de IA permite decidir si hace
                      falta este agente, varios trabajando juntos o una secuencia
                      distinta según el proceso real de la empresa.
                    </p>
                  </div>

                  <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm leading-7 text-slate-300">
                      Sesión inicial de 25 minutos por Zoom o Google Meet para
                      entender el negocio, detectar oportunidades reales y
                      definir el sistema de agentes correcto.
                    </p>
                    <Button href={siteConfig.cta.href}>
                      Agenda tu Diagnóstico Estratégico de IA
                    </Button>
                  </div>
                </div>
              </Card>
            </section>
          </main>

          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
