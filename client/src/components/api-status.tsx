"use client";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { getHealthStatus } from "@/lib/links-api";
import { cn } from "@/lib/cn";

export function ApiStatus() {
  const health = useAsyncResource(true, getHealthStatus, []);
  const online = health.data?.status === "ok";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs",
        online
          ? "text-slate-500"
          : health.error
            ? "text-red-700"
            : "text-slate-500"
      )}
      title={health.error ?? "Shortner service status"}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          online ? "bg-emerald-500" : health.error ? "bg-red-500" : "bg-slate-400"
        )}
      />
      {online ? "Service online" : health.error ? "Service unavailable" : "Checking service"}
    </span>
  );
}
