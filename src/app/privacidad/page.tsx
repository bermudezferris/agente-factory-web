import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";

const privacySections = [
  {
    body: "Cuando una persona escribe por WhatsApp para solicitar el Diagnóstico Estratégico de IA, AgenteFactory puede recibir datos básicos de contacto y el contexto que el visitante decida compartir voluntariamente.",
    title: "Datos que pueden recibirse",
  },
  {
    body: "La información se utiliza solo para responder la solicitud, coordinar la sesión inicial y dar seguimiento comercial relacionado con el diagnóstico o una propuesta posterior si el cliente la solicita.",
    title: "Uso de la información",
  },
  {
    body: "Esta página es una base inicial de privacidad para la etapa comercial actual. Puede ampliarse cuando existan nuevos canales, formularios activos, automatizaciones conectadas o requerimientos legales adicionales.",
    title: "Estado actual de la política",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#071a2b_0%,#081b2d_28%,#071423_100%)] text-white">
      <div className="page-grid relative overflow-hidden">
        <SiteHeader />

        <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="space-y-5">
            <Badge tone="accent">Privacidad</Badge>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              Base de privacidad para el contacto comercial inicial de AgenteFactory.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Esta página acompaña el canal comercial activo actual: el contacto
              por WhatsApp para solicitar el Diagnóstico Estratégico de IA.
            </p>
          </div>

          <SectionHeading
            description="Contenido base publicado para no enlazar a una política inexistente mientras el flujo comercial sigue evolucionando."
            eyebrow="Alcance actual"
            title="Qué cubre esta versión"
          />

          <div className="grid gap-5">
            {privacySections.map((section) => (
              <Card key={section.title} className="p-6 sm:p-8">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {section.title}
                  </h2>
                  <p className="text-base leading-8 text-slate-300">
                    {section.body}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 sm:p-8" surface="solid">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                Datos confirmados hoy
              </p>
              <p className="text-base leading-8 text-slate-300">
                Canal activo confirmado: WhatsApp {siteConfig.contact.whatsappNumber}.
              </p>
              <p className="text-base leading-8 text-slate-300">
                Correo comercial confirmado: pendiente.
              </p>
            </div>
          </Card>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
