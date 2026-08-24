import { cn } from "@/lib/cn";

type AgentPortraitPlaceholderProps = {
  accent: string;
  className?: string;
  initials: string;
};

export function AgentPortraitPlaceholder({
  accent,
  className,
  initials,
}: AgentPortraitPlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_45%)]" />
      <div
        className="absolute -right-8 top-5 h-28 w-28 rounded-full opacity-80 blur-2xl"
        style={{ background: accent }}
      />
      <div className="absolute inset-x-6 top-6 h-[1px] bg-white/10" />
      <div className="absolute inset-x-10 bottom-0 h-32 rounded-t-[3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]" />
      <div className="absolute left-1/2 top-[26%] h-24 w-24 -translate-x-1/2 rounded-full border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08))]" />
      <div className="absolute left-1/2 top-[60%] h-28 w-36 -translate-x-1/2 rounded-t-[3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
      <div className="absolute bottom-5 left-5 rounded-full border border-white/12 bg-black/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
        {initials}
      </div>
    </div>
  );
}
