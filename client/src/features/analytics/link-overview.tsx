"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { TagList } from "@/components/ui/tag";
import { formatDateTime, formatNumber, readableUrl } from "@/lib/format";
import { getAdminSummary } from "@/lib/links-api";
import { useAsyncResource } from "@/hooks/use-async-resource";
import type { PublicLink } from "@/types/api";

type LinkOverviewProps = {
  code: string;
  adminKey: string;
  enabled: boolean;
  updatedLink?: PublicLink | null;
};

export function LinkOverview({ code, adminKey, enabled, updatedLink }: LinkOverviewProps) {
  const summary = useAsyncResource(
    enabled,
    () => getAdminSummary(code, adminKey),
    [code, adminKey]
  );
  const link = updatedLink ?? summary.data?.link;

  return (
    <Panel
      title="Link overview"
      description="Destination, status and tags."
      action={
        <Button
          variant="ghost"
          loading={summary.refreshing}
          icon={<ArrowPathIcon className="h-4 w-4" />}
          onClick={() => void summary.refresh()}
          disabled={!enabled}
        >
          Refresh
        </Button>
      }
    >
      {!enabled ? (
        <p className="text-sm text-slate-500">Enter an admin key to load the overview.</p>
      ) : summary.loading ? (
        <div className="h-28 animate-pulse rounded-md bg-slate-100" />
      ) : summary.error ? (
        <p className="text-sm font-medium text-red-600">{summary.error}</p>
      ) : summary.data && link ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={link.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-base font-medium text-ink-950 hover:underline"
              >
                {link.shortUrl}
              </a>
              <StatusBadge status={link.status} />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Destination: {readableUrl(link.targetUrl)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Last click: {formatDateTime(summary.data.lastClickedAt)}
            </p>
            <TagList tags={link.tags} className="mt-3" />
          </div>
          <div className="rounded-md border border-slate-200 p-4">
            <p className="text-xs text-slate-500">
              Total clicks
            </p>
            <p className="mt-2 text-3xl font-semibold text-ink-950">
              {formatNumber(summary.data.totalClicks)}
            </p>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
