import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] !text-slate-950 shadow-[0_18px_40px_rgba(0,199,230,0.22)] hover:-translate-y-0.5 hover:bg-[#3fd3ea] hover:shadow-[0_22px_46px_rgba(0,199,230,0.28)] focus-visible:ring-[var(--color-primary)]",
  secondary:
    "border border-[color:var(--color-border-strong)] bg-white/8 text-white hover:border-[var(--color-primary)] hover:bg-white/12 focus-visible:ring-[var(--color-primary)]",
  ghost:
    "border border-transparent bg-transparent text-slate-200 hover:bg-white/8 hover:text-white focus-visible:ring-[var(--color-primary)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2.5 text-sm",
  md: "px-6 py-3.5 text-sm",
};

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type LinkButtonProps = SharedProps & {
  href: string;
};

type ActionButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

export function Button({
  children,
  className,
  href,
  size = "md",
  variant = "primary",
  ...buttonProps
}: LinkButtonProps | ActionButtonProps) {
  const primaryTextStyle =
    variant === "primary" ? { color: "#020617" } : undefined;

  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-semibold tracking-[-0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (!href) {
    return (
      <button
        type="button"
        className={classes}
        style={primaryTextStyle}
        {...buttonProps}
      >
        {children}
      </button>
    );
  }

  const isExternal =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        rel="noreferrer"
        style={primaryTextStyle}
        target="_blank"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} style={primaryTextStyle}>
      {children}
    </Link>
  );
}
