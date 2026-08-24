import Image from "next/image";

import { AgentPortraitPlaceholder } from "@/components/brand/agent-portrait-placeholder";
import type { AgentPortrait as AgentPortraitData } from "@/content/agents";
import { cn } from "@/lib/cn";

type AgentPortraitProps = {
  accent: string;
  className?: string;
  initials?: string;
  portrait: AgentPortraitData;
};

export function AgentPortrait({
  accent,
  className,
  initials,
  portrait,
}: AgentPortraitProps) {
  if (!portrait.src) {
    return (
      <div role="img" aria-label={portrait.alt}>
        <AgentPortraitPlaceholder
          accent={accent}
          className={className}
          initials={initials ?? "AF"}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]",
        className,
      )}
    >
      <Image
        fill
        alt={portrait.alt}
        className="object-cover"
        sizes="(min-width: 1280px) 28rem, (min-width: 768px) 50vw, 100vw"
        src={portrait.src}
        style={{ objectPosition: portrait.objectPosition }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,18,0.06)_0%,rgba(4,10,18,0.16)_100%)]" />
      <div
        className="absolute -right-10 top-5 h-32 w-32 rounded-full opacity-30 blur-3xl"
        style={{ background: accent }}
      />
    </div>
  );
}
