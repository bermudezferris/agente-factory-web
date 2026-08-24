import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: "accent" | "neutral";
};

export function Badge({
  children,
  className,
  tone = "neutral",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.24em]",
        tone === "accent"
          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/6 text-slate-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
