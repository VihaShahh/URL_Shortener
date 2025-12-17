import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="break-words text-[26px] font-semibold leading-tight tracking-[-0.8px] text-ink-950 sm:text-[28px]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
