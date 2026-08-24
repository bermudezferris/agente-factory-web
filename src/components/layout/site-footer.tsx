import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 text-sm text-slate-400 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-300">
            AgenteFactory
          </p>
          <p className="max-w-xl leading-7">
            Primero entendemos el negocio, detectamos oportunidades concretas y
            luego diseñamos los agentes adecuados para mover resultados.
          </p>
        </div>
        <div className="space-y-3 text-left lg:text-right">
          <p>Agentes que trabajan. Resultados que se miden.</p>
          <p>Diagnóstico Estratégico de IA como punto de entrada comercial.</p>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button href={siteConfig.contact.whatsappHref} size="sm">
              Escribir por WhatsApp
            </Button>
            <Button href={siteConfig.privacyHref} size="sm" variant="ghost">
              Privacidad
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
