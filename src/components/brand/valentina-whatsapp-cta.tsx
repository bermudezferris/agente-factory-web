import Image from "next/image";

import { siteConfig } from "@/config/site";

function WhatsAppMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 2a9.84 9.84 0 0 0-8.43 14.9L2 22l5.23-1.54A9.93 9.93 0 1 0 12 2Zm0 17.95a8 8 0 0 1-4.08-1.12l-.29-.17-3.1.91.93-3.02-.19-.31A7.9 7.9 0 1 1 12 19.95Zm4.36-5.92c-.24-.12-1.41-.69-1.63-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18a7.2 7.2 0 0 1-1.33-1.66c-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.41-.58 1.61-1.13.2-.56.2-1.03.14-1.13-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export function ValentinaWhatsAppCta() {
  return (
    <a
      href={siteConfig.contact.whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Hablar por WhatsApp con Valentina (IA)"
      className="group fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-[rgba(7,26,43,0.94)] p-1.5 pr-3 text-white shadow-[0_22px_60px_rgba(0,0,0,0.38),0_0_0_1px_rgba(103,232,249,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200/40 hover:shadow-[0_26px_70px_rgba(0,0,0,0.42),0_0_34px_rgba(0,199,230,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:bottom-6 sm:right-6 sm:gap-3 sm:rounded-[1.35rem] sm:p-2 sm:pr-4"
    >
      <span className="relative shrink-0">
        <Image
          src="/images/agents-v2/valentina-web-v2.jpg"
          alt=""
          width={112}
          height={112}
          className="h-11 w-11 rounded-full object-cover object-top ring-1 ring-white/20 sm:h-14 sm:w-14 sm:rounded-[1rem]"
        />
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#071a2b] bg-emerald-400" />
      </span>

      <span className="min-w-0 text-left leading-tight">
        <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-cyan-200 sm:block">
          Valentina (IA)
        </span>
        <span className="block text-sm font-semibold">¿Te ayudo?</span>
        <span className="mt-0.5 flex items-center gap-1 text-[0.68rem] font-medium text-slate-300 sm:mt-1 sm:text-xs">
          <WhatsAppMark />
          <span className="sm:hidden">WhatsApp</span>
          <span className="hidden sm:inline">Hablar por WhatsApp</span>
        </span>
      </span>
    </a>
  );
}
