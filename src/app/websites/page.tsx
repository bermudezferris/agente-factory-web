import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Websites por US$499 | Noviembre 2026",
  description: "Promoción de noviembre: frontend, backend y ajustes sobre el alcance acordado por US$499. Consulta las funcionalidades para tu negocio.",
  alternates: { canonical: "/websites" },
};

export default function WebsitesPage() {
  const contact = `https://wa.me/${siteConfig.contact.whatsappNumber}?text=${encodeURIComponent("Hola, me interesa la promoción de websites por US$499 de noviembre. Quiero consultar el alcance para mi negocio.")}`;
  return <div className="page-grid min-h-screen bg-[#071a2b] text-white">
    <SiteHeader />
    <main className="mx-auto max-w-7xl space-y-10 px-6 py-16 sm:px-10 lg:px-12">
      <p className="text-sm uppercase tracking-widest text-cyan-200">Especial de noviembre de 2026</p>
      <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">Una web para presentar tu negocio y recibir oportunidades.</h1>
      <p className="text-5xl font-semibold text-cyan-200">US$499</p>
      <p className="max-w-3xl text-lg leading-8 text-slate-300">Desarrollamos tu sitio con frontend, backend y los ajustes necesarios para entregar las funcionalidades acordadas.</p>
      <div className="grid gap-5 md:grid-cols-3">{[
        ["Frontend", "La experiencia visual de tu sitio, adaptada a computadoras y móviles."],
        ["Backend", "La funcionalidad que necesita tu sitio, definida contigo antes de contratar."],
        ["Ajustes", "Revisión del sitio y ajustes sobre el alcance acordado para su entrega."],
      ].map(([title, body]) => <Card key={title} className="space-y-4 p-6"><h2 className="text-2xl font-semibold">{title}</h2><p className="leading-8 text-slate-300">{body}</p></Card>)}</div>
      <Card className="space-y-5 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold">Primero definimos tu website.</h2>
        <p className="leading-8 text-slate-300">Cuéntanos qué quieres mostrar y qué debe hacer tu sitio. Antes de contratar, confirmamos por escrito las páginas, funcionalidades del backend, revisiones, plazo, forma de pago y soporte. También aclaramos los costos de dominio, hosting y servicios externos.</p>
        <p className="leading-8 text-slate-300">Las funcionalidades adicionales se cotizan por separado. Consulta las condiciones de la promoción de noviembre antes de reservar.</p>
        <Button href={contact}>Consultar mi web por US$499</Button>
      </Card>
    </main><SiteFooter />
  </div>;
}
