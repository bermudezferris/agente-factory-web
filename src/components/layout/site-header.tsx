import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-b-[2rem] border-x border-b border-white/10 bg-[rgba(7,26,43,0.76)] px-4 py-4 backdrop-blur-xl sm:px-10 lg:px-12">
        <Link
          href="/"
          aria-label={siteConfig.name}
          className="flex min-w-0 flex-1 items-center"
        >
          <Image
            src="/images/brand/agente-factory-logo-horizontal-transparent.png"
            alt="AgenteFactory"
            width={2172}
            height={724}
            priority
            className="h-auto w-auto max-h-12 max-w-[220px] sm:max-h-14 sm:max-w-[260px] lg:max-h-16 lg:max-w-[320px]"
          />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 lg:flex">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <Button href={siteConfig.secondaryCta.href} size="sm" variant="ghost">
              Conoce a los agentes
            </Button>
          </div>
          <Button href={siteConfig.cta.href} size="sm">
            <span className="hidden sm:inline">Agenda tu diagnóstico</span>
            <span className="sm:hidden">Agendar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
