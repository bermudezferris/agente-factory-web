import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  align = "left",
  className,
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-5",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? <Badge tone="accent">{eyebrow}</Badge> : null}
      <div className="space-y-4">
        <h2 className="max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
