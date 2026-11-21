import { cn } from "@/lib/cn";
import type { LinkStatus } from "@/types/api";

const statusClasses: Record<LinkStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DISABLED: "bg-slate-100 text-slate-700 ring-slate-200",
  EXPIRED: "bg-amber-50 text-amber-800 ring-amber-200"
};

export function StatusBadge({ status }: { status: LinkStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium leading-5 ring-1 ring-inset",
        statusClasses[status]
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}
