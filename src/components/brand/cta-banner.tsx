import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

type CtaBannerProps = {
  description: string;
  title: string;
};

export function CtaBanner({ description, title }: CtaBannerProps) {
  return (
    <Card className="overflow-hidden p-8 sm:p-10" surface="solid">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
            CTA principal
          </p>
          <h3 className="max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[2.3rem]">
            {title}
          </h3>
          <p className="max-w-2xl text-base leading-8 text-slate-300">
            {description}
          </p>
        </div>
        <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm leading-7 text-slate-300">
            Sesión gratuita de 25 minutos por Zoom o Google Meet con un
            consultor estratégico de IA.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={siteConfig.cta.href}>{siteConfig.cta.label}</Button>
            <Button href={siteConfig.secondaryCta.href} variant="secondary">
              {siteConfig.secondaryCta.label}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
