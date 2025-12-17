import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-950 text-white hover:bg-ink-900 focus-visible:outline-ink-950 disabled:bg-slate-300",
  secondary:
    "border border-slate-200 bg-white text-ink-950 shadow-soft hover:bg-slate-50 focus-visible:outline-slate-500 disabled:text-slate-400",
  ghost:
    "text-ink-700 hover:bg-slate-100 focus-visible:outline-slate-500 disabled:text-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 disabled:bg-red-300"
};

export function Button({
  className,
  children,
  variant = "primary",
  loading = false,
  icon,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed [@media(pointer:coarse)]:min-h-11",
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      <span>{children}</span>
    </button>
  );
}
