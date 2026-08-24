import { AgentCard } from "@/components/brand/agent-card";
import { CtaBanner } from "@/components/brand/cta-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResultTag } from "@/components/ui/result-tag";
import { SectionHeading } from "@/components/ui/section-heading";
import { agents } from "@/content/agents";
import { siteConfig } from "@/config/site";

const resultGroups = [
  "Vender mas",
  "Atender mejor",
  "Operar mejor",
  "Aprovechar mejor la informacion",
  "Decidir mejor",
];

const principles = [
  {
    description:
      "Usamos el cian para guiar la atencion, no para pintar toda la interfaz.",
    title: "Acento con criterio",
  },
  {
    description:
      "La interfaz habla de resultados de negocio con una jerarquia clara y sobria.",
    title: "Claridad comercial",
  },
  {
    description:
      "La tecnologia se percibe en la precision, las conexiones y el sistema, no en efectos estridentes.",
    title: "Tecnologia creible",
  },
];

const componentSamples = [
  {
    description: "Botones y badges para CTA y estados de seccion.",
    title: "Acciones y senales",
  },
  {
    description: "Cards con profundidad controlada y placeholders consistentes.",
    title: "Superficies de confianza",
  },
  {
    description: "Titulares editoriales, apoyo explicativo y bloques modulares.",
    title: "Jerarquia narrativa",
  },
];

const metrics = [
  { label: "CTA visible", value: "Header, hero y cierre" },
  { label: "Tono visual", value: "Sobrio, premium y claro" },
  { label: "Escalabilidad", value: "Listo para Sprint 2 y Sprint 3" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#071a2b_0%,#091f34_32%,#071423_100%)] text-white">
      <div className="page-grid relative overflow-hidden">
        <div
          className="ambient-orb left-[-8rem] top-24 h-72 w-72"
          style={{ background: "rgba(50, 107, 255, 0.18)" }}
        />
        <div
          className="ambient-orb right-[-6rem] top-36 h-80 w-80"
          style={{ background: "rgba(0, 199, 230, 0.14)" }}
        />

        <SiteHeader />

        <main className="relative z-10">
          <section className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 pb-20 pt-12 sm:px-10 lg:px-12 lg:pb-24 lg:pt-16">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="space-y-8">
                <div className="space-y-5">
                  <Badge tone="accent">Sprint 1 aprobado e implementado</Badge>
                  <div className="space-y-5">
                    <h1 className="max-w-5xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-balance text-white sm:text-6xl lg:text-[5.2rem]">
                      Consultoria estrategica de alto nivel, expresada con un
                      sistema visual claro y contemporaneo.
                    </h1>
                    <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                      Esta home provisional funciona como escenario de
                      validacion para la identidad de AgenteFactory: una marca
                      que se siente tecnologica y sofisticada, pero sigue siendo
                      facil de entender para lideres no tecnicos.
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

                <div className="flex flex-wrap gap-3 pt-2">
                  {resultGroups.map((item) => (
                    <ResultTag key={item} label={item} />
                  ))}
                </div>
              </div>

              <Card className="overflow-hidden p-6 sm:p-8" surface="solid">
                <div className="space-y-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-200">
                        Sistema visual
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        Base reusable para homepage, hub de agentes y paginas
                        individuales.
                      </p>
                    </div>
                    <Badge>Validacion en contexto</Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4"
                      >
                        <p className="text-[0.72rem] uppercase tracking-[0.22em] text-slate-400">
                          {metric.label}
                        </p>
                        <p className="mt-4 text-base font-semibold leading-7 text-white">
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-300">
                        Principio rector
                      </p>
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                    </div>
                    <p className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.03em] text-white">
                      El cian orienta. La confianza la construyen la estructura,
                      el contraste y la precision editorial.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section
            id="sistema"
            className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12"
          >
            <SectionHeading
              description="Antes de construir la homepage comercial definitiva, dejamos lista una base de marca con contraste, ritmo, espaciado y superficies que puedan sostener mensajes complejos sin volverse confusos."
              eyebrow="Direccion visual"
              title="Una estetica de consultoria aplicada: mas precision que ruido, mas negocio que artificio."
            />

            <div className="grid gap-5 lg:grid-cols-3">
              {principles.map((item) => (
                <Card key={item.title} className="p-6">
                  <div className="space-y-5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                      AF
                    </span>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                        {item.title}
                      </h3>
                      <p className="text-base leading-8 text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section
            id="componentes"
            className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12"
          >
            <SectionHeading
              description="Estos bloques ya definen el comportamiento visual de botones, badges, tarjetas, CTA, jerarquias y contenedores que luego reutilizaremos en la homepage final y en las paginas de agentes."
              eyebrow="Componentes base"
              title="El sistema ya tiene piezas suficientes para escalar sin perder identidad."
            />

            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <Card className="p-6 sm:p-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                      Acciones
                    </p>
                    <h3 className="text-3xl font-semibold tracking-[-0.03em] text-white">
                      CTA legibles, serios y visibles.
                    </h3>
                    <p className="text-base leading-8 text-slate-300">
                      Priorizamos confianza y claridad. Los llamados a la accion
                      destacan por contraste y ritmo, no por efectos invasivos.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button href={siteConfig.cta.href}>CTA principal</Button>
                    <Button href={siteConfig.secondaryCta.href} variant="secondary">
                      CTA secundario
                    </Button>
                    <Button href="#componentes" variant="ghost">
                      Ghost action
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge tone="accent">Acento</Badge>
                    <Badge>Neutral</Badge>
                    <ResultTag label="Visual listo para escalar" />
                  </div>
                </div>
              </Card>

              <div className="grid gap-5 md:grid-cols-3">
                {componentSamples.map((sample) => (
                  <Card key={sample.title} className="p-6">
                    <div className="space-y-4">
                      <div className="h-1.5 w-16 rounded-full bg-[linear-gradient(90deg,#326bff_0%,#00c7e6_100%)]" />
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">
                        {sample.title}
                      </h3>
                      <p className="text-sm leading-7 text-slate-300">
                        {sample.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section
            id="agentes"
            className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12"
          >
            <SectionHeading
              description="Todavia no estamos construyendo las paginas individuales ni la narrativa final de conversion. Aqui usamos las cards de agentes para validar retratos placeholder, tono de contenido, color por agente y consistencia de layout."
              eyebrow="Showcase de agentes"
              title="Los agentes ya tienen una presencia visual coherente sin depender aun de retratos definitivos."
            />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              {agents.map((agent) => (
                <AgentCard key={agent.slug} agent={agent} />
              ))}
            </div>
          </section>

          <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12">
            <CtaBanner
              description="Con Sprint 1 terminamos la base visual. El siguiente paso sera usar este sistema para construir la homepage comercial definitiva con el recorrido completo desde el dolor hasta la agenda del diagnostico."
              title="La interfaz ya transmite una consultoria de IA aplicada a resultados. Ahora podemos entrar al storytelling comercial."
            />
          </section>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
