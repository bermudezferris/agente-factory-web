import Image from "next/image";
import Link from "next/link";

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
            className="h-auto w-[130px] shrink-0 sm:w-auto sm:max-h-14 sm:max-w-[260px] lg:max-h-16 lg:max-w-[320px]"
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

        <a
          href={siteConfig.contact.whatsappHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Hablar con Valentina por WhatsApp"
          className="group flex shrink-0 items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-300/10 p-1.5 pr-3 text-white shadow-[0_16px_42px_rgba(0,199,230,0.14)] transition hover:-translate-y-0.5 hover:border-cyan-200/50 hover:bg-cyan-300/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:gap-3 sm:pr-4"
        >
          <Image
            src="/images/agents-v2/valentina-web-v2.jpg"
            alt="Valentina (IA)"
            width={96}
            height={96}
            className="h-9 w-9 rounded-full object-cover object-top ring-1 ring-white/20 sm:h-10 sm:w-10"
          />
          <span className="text-left leading-tight">
            <span className="hidden text-[0.68rem] font-medium uppercase tracking-[0.16em] text-cyan-200 sm:block">
              Valentina (IA)
            </span>
            <span className="text-xs font-semibold sm:text-sm">Hablar con Valentina</span>
          </span>
        </a>
      </div>
    </header>
  );
}
