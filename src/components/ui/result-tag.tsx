import { cn } from "@/lib/cn";

type ResultTagProps = {
  label: string;
  className?: string;
};

export function ResultTag({ className, label }: ResultTagProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm font-medium text-slate-200",
        className,
      )}
    >
      {label}
    </span>
  );
}
