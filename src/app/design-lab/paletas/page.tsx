import type { Metadata } from "next";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "Design Lab Paletas",
  robots: {
    index: false,
    follow: false,
  },
};

type PaletteTokens = {
  accent: string;
  accentSoft: string;
  active: string;
  advantage: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  border: string;
  ctaBg: string;
  ctaBorder: string;
  ctaGlow: string;
  emphasis: string;
  heading: string;
  muted: string;
  name: string;
  reportAccent: string;
  reportGlow: string;
  resultBg: string;
  resultBorder: string;
  resultText: string;
  risk: string;
  secondaryBg: string;
  secondaryBorder: string;
  secondaryText: string;
  surface: string;
  surfaceAlt: string;
  text: string;
};

const palettes: PaletteTokens[] = [
  {
    accent: "#22D3EE",
    accentSoft: "rgba(34, 211, 238, 0.12)",
    active: "#22D3EE",
    advantage: "solidez corporativa, ritmo visual controlado y una lectura muy premium.",
    badgeBg: "rgba(103, 232, 249, 0.09)",
    badgeBorder: "rgba(103, 232, 249, 0.24)",
    badgeText: "#DDF7FC",
    border: "#1D3547",
    ctaBg: "rgba(34, 211, 238, 0.14)",
    ctaBorder: "rgba(34, 211, 238, 0.22)",
    ctaGlow: "rgba(34, 211, 238, 0.18)",
    emphasis: "#67E8F9",
    heading: "#F4F8FB",
    muted: "#9FB2C3",
    name: "Cian editorial",
    reportAccent: "#67E8F9",
    reportGlow: "rgba(103, 232, 249, 0.12)",
    resultBg: "rgba(34, 211, 238, 0.08)",
    resultBorder: "rgba(34, 211, 238, 0.16)",
    resultText: "#D9F7FB",
    risk: "Puede sentirse demasiado prudente si la marca luego busca una presencia más visible en paid media.",
    secondaryBg: "rgba(13, 33, 51, 0.92)",
    secondaryBorder: "rgba(159, 178, 195, 0.18)",
    secondaryText: "#D7E5F0",
    surface: "#0D2133",
    surfaceAlt: "#11283B",
    text: "#F4F8FB",
  },
  {
    accent: "#22D3EE",
    accentSoft: "rgba(37, 99, 235, 0.16)",
    active: "#2563EB",
    advantage: "energía tecnológica con más presencia de acción y foco en módulos activos.",
    badgeBg: "rgba(34, 211, 238, 0.12)",
    badgeBorder: "rgba(34, 211, 238, 0.32)",
    badgeText: "#DDFBFF",
    border: "#1D3547",
    ctaBg: "linear-gradient(135deg, rgba(34, 211, 238, 0.22), rgba(37, 99, 235, 0.22))",
    ctaBorder: "rgba(34, 211, 238, 0.28)",
    ctaGlow: "rgba(37, 99, 235, 0.24)",
    emphasis: "#22D3EE",
    heading: "#F4F8FB",
    muted: "#9FB2C3",
    name: "Cian eléctrico",
    reportAccent: "#2563EB",
    reportGlow: "rgba(37, 99, 235, 0.18)",
    resultBg: "linear-gradient(135deg, rgba(34, 211, 238, 0.14), rgba(37, 99, 235, 0.12))",
    resultBorder: "rgba(34, 211, 238, 0.24)",
    resultText: "#E5FBFF",
    risk: "Puede acercarse demasiado a un imaginario tech si se exagera su presencia fuera de módulos clave.",
    secondaryBg: "rgba(13, 33, 51, 0.9)",
    secondaryBorder: "rgba(37, 99, 235, 0.28)",
    secondaryText: "#DCE7FF",
    surface: "#0D2133",
    surfaceAlt: "#102743",
    text: "#F4F8FB",
  },
  {
    accent: "#67E8F9",
    accentSoft: "rgba(103, 232, 249, 0.16)",
    active: "#22D3EE",
    advantage: "cercanía contemporánea y una sensación más abierta sin perder seriedad.",
    badgeBg: "rgba(103, 232, 249, 0.14)",
    badgeBorder: "rgba(103, 232, 249, 0.28)",
    badgeText: "#E8FCFF",
    border: "#2A4558",
    ctaBg: "rgba(103, 232, 249, 0.14)",
    ctaBorder: "rgba(103, 232, 249, 0.24)",
    ctaGlow: "rgba(103, 232, 249, 0.18)",
    emphasis: "#67E8F9",
    heading: "#F4F8FB",
    muted: "#A9BBC9",
    name: "Cian luminoso",
    reportAccent: "#67E8F9",
    reportGlow: "rgba(103, 232, 249, 0.18)",
    resultBg: "rgba(103, 232, 249, 0.12)",
    resultBorder: "rgba(103, 232, 249, 0.22)",
    resultText: "#ECFCFF",
    risk: "Puede perder algo de densidad premium si toda la marca migra demasiado hacia superficies claras.",
    secondaryBg: "rgba(19, 42, 59, 0.92)",
    secondaryBorder: "rgba(103, 232, 249, 0.18)",
    secondaryText: "#DDECF6",
    surface: "#122838",
    surfaceAlt: "#173144",
    text: "#F4F8FB",
  },
];

const previewModes = {
  desktop: "desktop",
  mobile: "mobile",
} as const;

type PageProps = {
  searchParams?: Promise<{
    viewport?: string;
  }>;
};

function tokenStyle(tokens: PaletteTokens): CSSProperties {
  return {
    "--lab-accent": tokens.accent,
    "--lab-accent-soft": tokens.accentSoft,
    "--lab-active": tokens.active,
    "--lab-badge-bg": tokens.badgeBg,
    "--lab-badge-border": tokens.badgeBorder,
    "--lab-badge-text": tokens.badgeText,
    "--lab-border": tokens.border,
    "--lab-cta-bg": tokens.ctaBg,
    "--lab-cta-border": tokens.ctaBorder,
    "--lab-cta-glow": tokens.ctaGlow,
    "--lab-emphasis": tokens.emphasis,
    "--lab-heading": tokens.heading,
    "--lab-muted": tokens.muted,
    "--lab-report-accent": tokens.reportAccent,
    "--lab-report-glow": tokens.reportGlow,
    "--lab-result-bg": tokens.resultBg,
    "--lab-result-border": tokens.resultBorder,
    "--lab-result-text": tokens.resultText,
    "--lab-secondary-bg": tokens.secondaryBg,
    "--lab-secondary-border": tokens.secondaryBorder,
    "--lab-secondary-text": tokens.secondaryText,
    "--lab-surface": tokens.surface,
    "--lab-surface-alt": tokens.surfaceAlt,
    "--lab-text": tokens.text,
  } as CSSProperties;
}

function LabButton({
  children,
  kind,
}: {
  children: string;
  kind: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      className={
        kind === "primary"
          ? "rounded-full border px-5 py-3 text-sm font-semibold tracking-[-0.01em] text-[var(--lab-text)] shadow-[0_0_0_1px_var(--lab-cta-border),0_16px_36px_var(--lab-cta-glow)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071521]"
          : "rounded-full border px-5 py-3 text-sm font-semibold tracking-[-0.01em] text-[var(--lab-secondary-text)] transition hover:border-[var(--lab-accent)] hover:text-[var(--lab-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071521]"
      }
      style={
        kind === "primary"
          ? {
              background: "var(--lab-cta-bg)",
              borderColor: "var(--lab-cta-border)",
            }
          : {
              background: "var(--lab-secondary-bg)",
              borderColor: "var(--lab-secondary-border)",
            }
      }
    >
      {children}
    </button>
  );
}

function PaletteCard({ tokens }: { tokens: PaletteTokens }) {
  return (
    <article
      className="rounded-[1.8rem] border p-5 shadow-[0_20px_50px_rgba(2,8,15,0.26)]"
      style={{
        background: `linear-gradient(180deg, ${tokens.surfaceAlt}, ${tokens.surface})`,
        borderColor: tokens.border,
      }}
    >
      <div
        className="relative overflow-hidden rounded-[1.4rem] border p-4"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="absolute right-[-1.4rem] top-4 h-24 w-24 rounded-full blur-2xl"
          style={{ background: tokens.accentSoft }}
        />
        <div className="relative space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-[var(--lab-text)]">
                Valentina
              </p>
              <p className="text-sm text-[var(--lab-muted)]">
                Especialista en desarrollo comercial
              </p>
            </div>
            <span
              className="rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em]"
              style={{
                borderColor: "var(--lab-badge-border)",
                color: "var(--lab-badge-text)",
                background: "var(--lab-badge-bg)",
              }}
            >
              IA
            </span>
          </div>
          <p className="text-sm leading-7 text-[var(--lab-muted)]">
            Califica, agenda y da seguimiento con un tono comercial claro y sin
            depender de recordatorios manuales.
          </p>
          <div className="flex items-center justify-between gap-3">
            <span
              className="rounded-full border px-3 py-1.5 text-sm font-medium"
              style={{
                background: "var(--lab-result-bg)",
                borderColor: "var(--lab-result-border)",
                color: "var(--lab-result-text)",
              }}
            >
              Vender más
            </span>
            <span className="text-sm font-semibold text-[var(--lab-emphasis)]">
              Ver diagnóstico
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ReportPreview() {
  const rows = [
    "Dolor identificado",
    "Oportunidades de IA",
    "Prioridades por impacto",
    "Sistema de agentes sugerido",
  ];

  return (
    <div
      className="rounded-[1.7rem] border p-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "var(--lab-border)",
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--lab-muted)]">
            Reporte
          </p>
          <p className="mt-1 text-base font-semibold text-[var(--lab-text)]">
            Resumen ejecutivo
          </p>
        </div>
        <span
          className="rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em]"
          style={{
            borderColor: "var(--lab-badge-border)",
            background: "var(--lab-badge-bg)",
            color: "var(--lab-badge-text)",
          }}
        >
          Vista previa
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {rows.map((row) => (
          <div
            key={row}
            className="rounded-[1.15rem] border px-4 py-3 text-sm"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
              color: "var(--lab-muted)",
            }}
          >
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}

function PalettePanel({ tokens }: { tokens: PaletteTokens }) {
  return (
    <section
      className="rounded-[2rem] border p-5 sm:p-6"
      style={{
        ...tokenStyle(tokens),
        background: `linear-gradient(180deg, ${tokens.surface} 0%, ${tokens.surfaceAlt} 100%)`,
        borderColor: tokens.border,
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-[var(--lab-text)]">
              {tokens.name}
            </p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--lab-muted)]">
              Ventaja: transmite {tokens.advantage}
            </p>
          </div>
          <span
            className="rounded-full border px-3 py-1 text-[0.72rem] uppercase tracking-[0.24em]"
            style={{
              background: "var(--lab-badge-bg)",
              borderColor: "var(--lab-badge-border)",
              color: "var(--lab-badge-text)",
            }}
          >
            Variante
          </span>
        </div>

        <div className="grid gap-5 2xl:grid-cols-[1.06fr_0.94fr]">
          <div className="space-y-5">
            <span
              className="inline-flex rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em]"
              style={{
                background: "var(--lab-badge-bg)",
                borderColor: "var(--lab-badge-border)",
                color: "var(--lab-badge-text)",
              }}
            >
              Diagnóstico Estratégico de IA
            </span>

            <h2 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-[var(--lab-heading)] sm:text-[3.35rem]">
              Consultoría estratégica con IA para detectar{" "}
              <span className="text-[var(--lab-emphasis)]">
                oportunidades concretas
              </span>{" "}
              antes de implementar.
            </h2>

            <p className="max-w-2xl text-base leading-8 text-[var(--lab-muted)]">
              AgenteFactory entiende el negocio, identifica fricciones reales y
              diseña el sistema de agentes adecuado para vender mejor, atender
              con más claridad y operar con mayor precisión.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <LabButton kind="primary">
                Agendar diagnóstico por WhatsApp
              </LabButton>
              <LabButton kind="secondary">
                Ver sistema de agentes
              </LabButton>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className="rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em]"
                style={{
                  background: "var(--lab-badge-bg)",
                  borderColor: "var(--lab-badge-border)",
                  color: "var(--lab-badge-text)",
                }}
              >
                Badge
              </span>
              <span
                className="rounded-full border px-4 py-2 text-sm font-medium"
                style={{
                  background: "var(--lab-result-bg)",
                  borderColor: "var(--lab-result-border)",
                  color: "var(--lab-result-text)",
                }}
              >
                Resultado: priorización ejecutiva
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <PaletteCard tokens={tokens} />

            <div
              className="rounded-[1.8rem] border p-5"
              style={{
                background: "var(--lab-result-bg)",
                borderColor: "var(--lab-result-border)",
              }}
            >
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--lab-emphasis)]">
                Bloque de resultado
              </p>
              <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] text-[var(--lab-text)]">
                Menos fricción operativa, mejores prioridades y una ruta clara
                para decidir dónde aplicar IA primero.
              </p>
            </div>

            <ReportPreview />
          </div>
        </div>

        <div
          className="rounded-[1.9rem] border px-5 py-5 sm:px-6"
          style={{
            background: `linear-gradient(135deg, ${tokens.surfaceAlt}, rgba(7, 21, 33, 0.96))`,
            borderColor: tokens.border,
            boxShadow: `0 18px 46px ${tokens.reportGlow}`,
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--lab-emphasis)]">
                CTA final
              </p>
              <p className="max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.03em] text-[var(--lab-heading)]">
                Entender primero el negocio sigue siendo la forma más elegante
                de implementar IA con impacto.
              </p>
            </div>
            <LabButton kind="primary">Reservar sesión inicial</LabButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function PaletteLabPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const viewport =
    resolvedSearchParams.viewport === previewModes.mobile
      ? previewModes.mobile
      : previewModes.desktop;

  return (
    <div className="min-h-screen bg-[#071521] text-[#F4F8FB]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#67E8F9]">
            Design lab interno
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            Calibración visual del cian para AgenteFactory.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-[#9FB2C3]">
            Comparación temporal de tres variantes sobre los mismos módulos, sin
            alterar la home ni la página comercial aprobada. Usa
            <code className="mx-1 rounded bg-white/6 px-1.5 py-0.5 text-sm text-[#F4F8FB]">
              ?viewport=mobile
            </code>
            para ver el modo de captura móvil interno.
          </p>
        </div>

        <div
          className={
            viewport === previewModes.mobile
              ? "mx-auto mt-8 max-w-[420px] rounded-[2.25rem] border border-white/10 bg-[#081827] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.35)]"
              : "mt-8"
          }
        >
          <div
            className={
              viewport === previewModes.mobile
                ? "space-y-6"
                : "grid gap-6 xl:grid-cols-3"
            }
          >
            {palettes.map((palette) => (
              <PalettePanel key={palette.name} tokens={palette} />
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {palettes.map((palette) => (
            <div
              key={`${palette.name}-notes`}
              className="rounded-[1.5rem] border border-[#1D3547] bg-[#0D2133] p-5"
            >
              <p className="text-base font-semibold text-white">{palette.name}</p>
              <p className="mt-3 text-sm leading-7 text-[#9FB2C3]">
                {palette.risk}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
