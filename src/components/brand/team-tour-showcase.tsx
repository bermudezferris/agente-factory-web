"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function TeamTourShowcase() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const closeDialog = () => {
    setIsOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    openerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );
      focusables?.[0]?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((node) => !node.hasAttribute("disabled"));

      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <Card className="overflow-hidden p-6 sm:p-8" surface="solid">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-200">
                Conoce al equipo
              </p>
              <p className="mt-2 max-w-md text-sm leading-7 text-slate-300">
                Un recorrido breve por el sistema de trabajo de AgenteFactory,
                con subtítulos en español y audio integrado.
              </p>
            </div>
            <Badge>Video 16:9</Badge>
          </div>

          <button
            ref={openerRef}
            type="button"
            onClick={() => setIsOpen(true)}
            className="group block w-full overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#081624] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]"
            aria-haspopup="dialog"
            aria-controls={dialogId}
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src="/videos/agentefactory-office-tour-poster.webp"
                alt="Vista previa del recorrido por el equipo de AgenteFactory"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,33,0.06),rgba(7,21,33,0.62))]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                <div className="max-w-xs">
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-cyan-100/80">
                    Tu primer día en AgenteFactory
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                    Seis especialistas. Un solo sistema de trabajo.
                  </p>
                </div>
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur">
                  <span className="ml-1 text-lg">▶</span>
                </span>
              </div>
            </div>
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => setIsOpen(true)}>Conoce al equipo</Button>
            <Button href="/diagnostico-estrategico-ia" variant="secondary">
              Ver el diagnóstico
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Audio y subtítulos en español",
              "Recorrido continuo en una sola oficina",
              "Equipo conectado al diagnóstico",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 text-sm leading-6 text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#020812]/80 px-4 py-6 backdrop-blur-sm"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <div
            id={dialogId}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "relative flex w-full max-w-5xl flex-col gap-4 rounded-[2rem] border border-white/10 bg-[#06131f] p-4 shadow-[0_30px_100px_rgba(2,8,18,0.65)]",
              "sm:p-5",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                  Presentación del equipo
                </p>
                <h2
                  id={titleId}
                  className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white"
                >
                  Bienvenido a AgenteFactory
                </h2>
              </div>
              <Button variant="ghost" onClick={closeDialog}>
                Cerrar
              </Button>
            </div>

            <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black">
              <video
                ref={videoRef}
                className="aspect-video w-full"
                controls
                playsInline
                preload="metadata"
                poster="/videos/agentefactory-office-tour-poster.webp"
              >
                <source
                  src="/videos/agentefactory-office-tour-web.mp4"
                  type="video/mp4"
                />
                <track
                  default
                  kind="subtitles"
                  label="Español"
                  src="/videos/agentefactory-office-tour-es.vtt"
                  srcLang="es"
                />
              </video>
            </div>

            <p className="text-sm leading-7 text-slate-300">
              El video se reproduce solo después de tu interacción, con audio
              controlable y subtítulos sincronizados en español.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
