import Link from "next/link";
import type { Route } from "next";
import type { UrlObject } from "url";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type LinkButtonVariant = "primary" | "secondary";

type LinkButtonProps<T extends string> = Omit<ComponentProps<typeof Link>, "href"> & {
  href: Route<T> | UrlObject;
  variant?: LinkButtonVariant;
  icon?: ReactNode;
};

const variants: Record<LinkButtonVariant, string> = {
  primary: "bg-ink-950 text-white hover:bg-ink-900 focus-visible:outline-ink-950",
  secondary:
    "border border-slate-200 bg-white text-ink-950 shadow-soft hover:bg-slate-50 focus-visible:outline-slate-500"
};

export function LinkButton<T extends string>({
  className,
  children,
  variant = "primary",
  icon,
  ...props
}: LinkButtonProps<T>) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [@media(pointer:coarse)]:min-h-11",
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
