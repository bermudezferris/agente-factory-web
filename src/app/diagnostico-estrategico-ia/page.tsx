import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResultTag } from "@/components/ui/result-tag";
import { SectionHeading } from "@/components/ui/section-heading";
import { agents } from "@/content/agents";
import { siteConfig } from "@/config/site";

const evaluationPoints = [
  {
    body: "Entendemos dónde se atasca hoy la operación, qué equipo está absorbiendo fricción y qué resultado de negocio necesita mejorar primero.",
    title: "Lectura del contexto",
  },
  {
    body: "Detectamos oportunidades concretas para vender más, atender mejor, operar con más orden o decidir con más claridad.",
    title: "Oportunidades con criterio",
  },
  {
    body: "Priorizamos por impacto y viabilidad para evitar pilotos dispersos y empezar por lo que realmente puede mover el negocio.",
    title: "Priorización ejecutiva",
  },
];

const deliverables = [
  "Lectura clara del dolor principal, la situación actual y la situación deseada.",
  "Mapa de barreras operativas y puntos de fricción donde la IA puede ayudar de forma concreta.",
  "Tres oportunidades prioritarias con razón de negocio, impacto esperado y viabilidad relativa.",
  "Recomendación inicial del sistema de agentes adecuado para el caso.",
  "Siguiente paso sugerido: propuesta de diseño, implementación o validación adicional.",
];

const discoveryQuestions = [
  "¿Dónde se pierde más tiempo hoy en ventas, atención, operaciones o análisis?",
  "¿Qué conversaciones, tareas o aprobaciones dependen todavía de seguimiento manual?",
  "¿Qué información existe, pero no está disponible a tiempo para decidir mejor?",
  "¿Qué resultado tendría más valor mejorar primero durante los próximos 90 días?",
];

const pendingFields = [
  "Nombre y empresa",
  "Canal preferido",
  "Área donde hoy existe más fricción",
  "Objetivo prioritario del diagnóstico",
];

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#071a2b_0%,#081b2d_26%,#071423_100%)] text-white">
      <div className="page-grid relative overflow-hidden">
        <div
          className="ambient-orb left-[-7rem] top-20 h-72 w-72"
          style={{ background: "rgba(50, 107, 255, 0.15)" }}
        />
        <div
          className="ambient-orb right-[-9rem] top-52 h-96 w-96"
          style={{ background: "rgba(0, 199, 230, 0.11)" }}
        />

        <SiteHeader />

        <main className="relative z-10">
          <section className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 pb-16 pt-12 sm:px-10 lg:px-12 lg:pb-22 lg:pt-16">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div className="space-y-7">
                <div className="space-y-5">
                  <Badge tone="accent">Diagnóstico Estratégico de IA</Badge>
                  <h1 className="max-w-5xl text-5xl font-semibold leading-[1.03] tracking-[-0.05em] text-balance text-white sm:text-6xl lg:text-[5rem]">
                    La forma más clara de detectar dónde la IA sí puede generar resultados en tu empresa.
                  </h1>
                  <p className="max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
                    Antes de hablar de automatizaciones o agentes, entendemos
                    el negocio. El diagnóstico nos permite ubicar la fricción
                    real, priorizar oportunidades concretas y definir el
                    sistema de agentes adecuado para avanzar con criterio.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button href={siteConfig.contact.whatsappHref}>
                    Agendar por WhatsApp
                  </Button>
                  <Button href="/#agentes" variant="secondary">
                    Ver sistema de agentes
                  </Button>
                </div>

                <p className="max-w-2xl text-sm leading-7 text-slate-400">
                  {siteConfig.supportText} La conversación inicial se coordina
                  por WhatsApp con un mensaje precargado para acelerar el
                  contacto.
                </p>

                <div className="flex flex-wrap gap-3 pt-1">
                  <ResultTag label="Ventas" />
                  <ResultTag label="Atención" />
                  <ResultTag label="Operaciones" />
                  <ResultTag label="Información" />
                  <ResultTag label="Prioridades" />
                </div>
              </div>

              <Card className="overflow-hidden p-6 sm:p-8" surface="solid">
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                        Resultado de la sesión
                      </p>
                      <p className="mt-2 max-w-md text-sm leading-7 text-slate-300">
                        No es una demo ni una auditoría técnica pesada. Es una
                        lectura ejecutiva para entender dónde conviene actuar
                        primero y qué tipo de sistema tiene sentido diseñar.
                      </p>
                    </div>
                    <Badge>Entrada comercial</Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
                      <p className="text-[0.72rem] uppercase tracking-[0.22em] text-slate-400">
                        01
                      </p>
                      <p className="mt-4 text-base font-semibold leading-7 text-white">
                        Dolor principal detectado
                      </p>
                    </div>
                    <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
                      <p className="text-[0.72rem] uppercase tracking-[0.22em] text-slate-400">
                        02
                      </p>
                      <p className="mt-4 text-base font-semibold leading-7 text-white">
                        Oportunidades priorizadas
                      </p>
                    </div>
                    <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-4">
                      <p className="text-[0.72rem] uppercase tracking-[0.22em] text-slate-400">
                        03
                      </p>
                      <p className="mt-4 text-base font-semibold leading-7 text-white">
                        Siguiente paso recomendado
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-cyan-300/18 bg-cyan-300/8 p-5">
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-100">
                      CTA funcional actual
                    </p>
                    <p className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em] text-white">
                      El canal activo hoy es WhatsApp. Desde ahí coordinamos la
                      sesión y el contexto inicial del diagnóstico.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
            <SectionHeading
              description="El valor del diagnóstico no está en hablar de IA en abstracto, sino en conectar el contexto del negocio con oportunidades que merecen atención real."
              eyebrow="Qué evaluamos"
              title="Tres niveles de lectura para pasar del interés a una dirección concreta."
            />

            <div className="grid gap-5 lg:grid-cols-3">
              {evaluationPoints.map((item) => (
                <Card key={item.title} className="p-6">
                  <div className="space-y-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                      AF
                    </span>
                    <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                      {item.title}
                    </h2>
                    <p className="text-base leading-8 text-slate-300">
                      {item.body}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
            <SectionHeading
              description="La sesión abre el trabajo; el entregable ordena decisiones y evita que todo quede en intuiciones sueltas."
              eyebrow="Entregables"
              title="Lo que debería quedar claro después del Diagnóstico Estratégico de IA."
            />

            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <Card className="p-6 sm:p-8" surface="solid">
                <div className="space-y-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                    Lo que entregamos
                  </p>
                  <ul className="space-y-4 text-base leading-8 text-slate-300">
                    {deliverables.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button href={siteConfig.contact.whatsappHref}>
                      Iniciar conversación por WhatsApp
                    </Button>
                    <Button href={siteConfig.privacyHref} variant="ghost">
                      Ver privacidad
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden p-6 sm:p-8">
                <div className="space-y-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                    Vista previa del reporte
                  </p>
                  <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                    <div className="grid gap-3">
                      {deliverables.map((item, index) => (
                        <div
                          key={item}
                          className="rounded-[1.25rem] border border-white/10 bg-[var(--color-surface-ghost)] px-4 py-4"
                        >
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            Bloque {index + 1}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-slate-300">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
            <SectionHeading
              description="Estas preguntas nos ayudan a aterrizar el problema correcto antes de definir tecnología, automatizaciones o agentes concretos."
              eyebrow="Conversación inicial"
              title="Preguntas que ordenan el diagnóstico desde negocio, no desde moda."
            />

            <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
              <Card className="p-6 sm:p-8">
                <div className="space-y-4">
                  {discoveryQuestions.map((item, index) => (
                    <div
                      key={item}
                      className="flex gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/24 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                        {index + 1}
                      </div>
                      <p className="text-base leading-8 text-slate-300">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 sm:p-8" surface="solid">
                <div className="space-y-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                    Sistema posible
                  </p>
                  <p className="text-base leading-8 text-slate-300">
                    Según el caso, el diagnóstico puede concluir que hace falta
                    atención comercial, seguimiento, operaciones, conocimiento o
                    análisis. Los agentes se definen después, no antes.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {agents.slice(0, 4).map((agent) => (
                      <div
                        key={agent.slug}
                        className="rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-4"
                      >
                        <p className="text-lg font-semibold text-white">
                          {agent.name}
                        </p>
                        <p className="mt-1 text-sm leading-7 text-slate-300">
                          {agent.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
            <SectionHeading
              description="La interfaz del formulario queda preparada para una futura integración, pero hoy no se publica como funcional para evitar falsas confirmaciones."
              eyebrow="Preparación futura"
              title="Estructura del formulario comercial, marcada como pendiente de integración."
            />

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <Card className="p-6 sm:p-8">
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                      Formulario pendiente
                    </p>
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em] text-amber-100">
                      Aún no activo
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {pendingFields.map((field) => (
                      <div key={field} className="space-y-2">
                        <p className="text-sm text-slate-300">{field}</p>
                        <div className="h-12 rounded-2xl border border-white/10 bg-white/5" />
                      </div>
                    ))}
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300">Contexto del caso</p>
                      <div className="h-32 rounded-[1.4rem] border border-white/10 bg-white/5" />
                    </div>
                  </div>
                  <div className="rounded-[1.35rem] border border-amber-300/18 bg-amber-300/8 p-4">
                    <p className="text-sm leading-7 text-amber-50/90">
                      Esta interfaz no envía datos ni muestra confirmaciones. El
                      canal activo por ahora es WhatsApp.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 sm:p-8" surface="solid">
                <div className="space-y-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                    Conversión activa hoy
                  </p>
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white">
                    Coordina el diagnóstico por WhatsApp y comparte el contexto inicial desde el primer mensaje.
                  </h2>
                  <p className="text-base leading-8 text-slate-300">
                    El mensaje precargado ya orienta la conversación hacia el
                    Diagnóstico Estratégico de IA, reduce fricción comercial y
                    evita pasos intermedios innecesarios mientras se construye
                    la integración del formulario.
                  </p>
                  <Button href={siteConfig.contact.whatsappHref}>
                    Abrir WhatsApp con mensaje precargado
                  </Button>
                </div>
              </Card>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
