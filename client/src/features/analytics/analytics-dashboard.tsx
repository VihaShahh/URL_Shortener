"use client";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/ui/panel";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useAdminKey } from "@/hooks/use-admin-key";
import { AnalyticsSummary } from "@/features/analytics/analytics-summary";
import { AuditTimeline } from "@/features/analytics/audit-timeline";
import { BreakdownGrid } from "@/features/analytics/breakdown-grid";
import { ExportActions } from "@/features/analytics/export-actions";
import { LinkOverview } from "@/features/analytics/link-overview";
import { MetadataEditor } from "@/features/analytics/metadata-editor";
import { RecentClicksTable } from "@/features/analytics/recent-clicks-table";
import { StatusControls } from "@/features/analytics/status-controls";
import { getAnalytics, getAdminSummary } from "@/lib/links-api";
import { useAsyncResource } from "@/hooks/use-async-resource";
import type { PublicLink } from "@/types/api";
import { useState } from "react";
import { useRecentLinks } from "@/hooks/use-recent-links";

export function AnalyticsDashboard({ code }: { code: string }) {
  const { adminKey, setAdminKey, hasAdminKey } = useAdminKey(code);
  const [editedLink, setEditedLink] = useState<PublicLink | null>(null);
  const recent = useRecentLinks();
  const analytics = useAsyncResource(
    hasAdminKey,
    () => getAnalytics(code, { adminKey, limit: 25 }),
    [code, adminKey]
  );
  const summary = useAsyncResource(
    hasAdminKey,
    () => getAdminSummary(code, adminKey),
    [code, adminKey]
  );
  const activeLink = editedLink ?? summary.data?.link ?? analytics.data?.link ?? null;

  function handleUpdated(link: PublicLink) {
    setEditedLink(link);
    recent.updateLink(link);
  }

  return (
    <AppShell activePage="analytics">
      <PageHeader title={`Analytics · ${code}`} description="View tracked requests and manage your link." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <LinkOverview code={code} adminKey={adminKey} enabled={hasAdminKey} updatedLink={editedLink} />
          <AnalyticsSummary code={code} adminKey={adminKey} enabled={hasAdminKey} />
          <BreakdownGrid analytics={analytics.data} />
          <RecentClicksTable clicks={analytics.data?.recentClicks ?? []} />
        </div>
        <div className="min-w-0 space-y-5">
          <Panel title="Admin key" description="Required for protected analytics and management actions.">
            <div className="space-y-4">
              <Field
                id="adminKey"
                label="Admin key"
                type="password"
                autoComplete="off"
                value={adminKey}
                placeholder="Paste admin key"
                onChange={(event) => setAdminKey(event.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setAdminKey("")}>
                  Clear saved key
                </Button>
                <ExportActions code={code} adminKey={adminKey} enabled={hasAdminKey} />
              </div>
            </div>
          </Panel>
          <MetadataEditor
            link={activeLink}
            adminKey={adminKey}
            enabled={hasAdminKey}
            onUpdated={handleUpdated}
          />
          <StatusControls
            link={activeLink}
            adminKey={adminKey}
            enabled={hasAdminKey}
            onUpdated={handleUpdated}
          />
          <AuditTimeline code={code} adminKey={adminKey} enabled={hasAdminKey} />
        </div>
      </div>
    </AppShell>
  );
}
