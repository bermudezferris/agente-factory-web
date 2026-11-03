import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Diagnóstico y plan de IA",
  description: "Un plan de IA para tu negocio por US$250: oportunidades priorizadas, herramientas, guía inicial e informe con revisión.",
  alternates: { canonical: "/diagnostico-estrategico-ia" },
};

export default function DiagnosticPage() {
  return <div className="page-grid min-h-screen bg-[#071a2b] text-white">
    <SiteHeader />
    <main className="mx-auto max-w-7xl space-y-10 px-6 py-16 sm:px-10 lg:px-12">
      <p className="text-sm uppercase tracking-widest text-cyan-200">Diagnóstico y plan de IA</p>
      <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">Ten claro qué usar, cómo configurarlo y por dónde empezar.</h1>
      <p className="text-3xl font-semibold text-cyan-200">US$250 <span className="text-lg text-slate-300">/ pago único</span></p>
      <p className="max-w-3xl text-lg leading-8 text-slate-300">Analizamos tu negocio y te entregamos un plan práctico para aplicar IA según tus prioridades.</p>
      <div className="grid gap-5 md:grid-cols-2">{[
        ["Tu negocio y sus prioridades", "Entrevista de 45–60 minutos y entre 3 y 7 oportunidades de IA, ordenadas por prioridad."],
        ["Las herramientas que te convienen", "Revisamos las que ya usas y recomendamos cuáles aprovechar o incorporar, con sus costos."],
        ["Guía de configuración inicial", "Una guía paso a paso para establecer un espacio de trabajo con IA adaptado a tus necesidades."],
        ["Informe y revisión", "Tu plan por escrito y una reunión para aclarar dudas y decidir cómo continuar."],
      ].map(([title, body]) => <Card key={title} className="space-y-4 p-6"><h2 className="text-2xl font-semibold">{title}</h2><p className="leading-8 text-slate-300">{body}</p></Card>)}</div>
      <p className="text-lg leading-8 text-slate-300">Con tu plan puedes avanzar con tu equipo o contratar la implementación guiada por US$790 al mes: cuatro sesiones individuales de 45 minutos y consultas entre sesiones. Licencias y consumos aparte.</p>
      <div className="flex flex-col gap-3 sm:flex-row"><Button href={siteConfig.contact.whatsappHref}>Consultar diagnóstico por US$250</Button><Button href={siteConfig.cta.href} variant="secondary">Empezar con una sesión gratuita</Button></div>
      <p className="text-sm leading-7 text-slate-400">La sesión inicial gratuita dura 25 minutos y ofrece una primera recomendación. El diagnóstico y plan se contrata por separado.</p>
    </main><SiteFooter />
  </div>;
}
