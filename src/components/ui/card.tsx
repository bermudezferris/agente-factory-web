import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  surface?: "soft" | "solid" | "outline";
};

const surfaceClasses = {
  soft: "border border-white/10 bg-[var(--color-surface-muted)] backdrop-blur",
  solid: "border border-white/10 bg-[var(--color-surface)]",
  outline: "border border-white/10 bg-transparent",
};

export function Card({
  children,
  className,
  surface = "soft",
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] shadow-[0_24px_80px_rgba(3,10,19,0.28)]",
        surfaceClasses[surface],
        className,
      )}
    >
      {children}
    </div>
  );
}
