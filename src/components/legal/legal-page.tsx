import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

type LegalSection = {
  title: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: readonly LegalSection[];
};

export function LegalPage({ eyebrow, title, introduction, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#071a2b_0%,#081b2d_28%,#071423_100%)] text-white">
      <div className="page-grid relative overflow-hidden">
        <SiteHeader />

        <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
          <div className="space-y-5">
            <Badge tone="accent">{eyebrow}</Badge>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              {introduction}
            </p>
            <p className="text-sm text-slate-400">Última actualización: 14 de septiembre de 2026.</p>
          </div>

          <div className="grid gap-5">
            {sections.map((section) => (
              <Card key={section.title} className="p-6 sm:p-8">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {section.title}
                  </h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-slate-300">
                      {paragraph}
                    </p>
                  ))}
                  {section.items ? (
                    <ul className="list-disc space-y-3 pl-6 text-base leading-8 text-slate-300">
                      {section.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 sm:p-8" surface="solid">
            <h2 className="text-xl font-semibold text-white">Contacto</h2>
            <p className="mt-3 text-base leading-8 text-slate-300">
              Para consultas sobre estas condiciones o sobre tus datos, escribe a{" "}
              <a className="font-semibold text-cyan-200 underline underline-offset-4" href="mailto:bermudez.ferris@gmail.com">
                bermudez.ferris@gmail.com
              </a>.
            </p>
          </Card>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
