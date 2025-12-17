"use client";

import { ClipboardDocumentIcon, ChartBarIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { TagList } from "@/components/ui/tag";
import { readableUrl } from "@/lib/format";
import type { CreatedLink } from "@/types/api";
import { useClipboard } from "@/hooks/use-clipboard";

type CreatedLinkCardProps = {
  link: CreatedLink;
};

export function CreatedLinkCard({ link }: CreatedLinkCardProps) {
  const clipboard = useClipboard();

  return (
    <Panel title="Your link is ready" description="Save the admin key. You’ll need it to manage this link.">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={link.shortUrl}
            className="break-all text-base font-medium text-ink-950 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {link.shortUrl}
          </a>
          <StatusBadge status={link.status} />
        </div>
        <p className="text-sm text-slate-500">Destination: {readableUrl(link.targetUrl)}</p>
        <TagList tags={link.tags} />
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Admin key · keep this private</p>
          <p className="mt-1 break-all text-sm text-ink-950">{link.adminKey}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            icon={<ClipboardDocumentIcon className="h-4 w-4" />}
            onClick={() => void clipboard.copy(link.shortUrl, "Short URL copied.")}
          >
            Copy short URL
          </Button>
          <Button
            variant="secondary"
            icon={<ClipboardDocumentIcon className="h-4 w-4" />}
            onClick={() => void clipboard.copy(link.adminKey, "Admin key copied.")}
          >
            Copy admin key
          </Button>
          <LinkButton
            href={`/analytics/${link.code}?adminKey=${encodeURIComponent(link.adminKey)}`}
            icon={<ChartBarIcon className="h-4 w-4" />}
          >
            Open analytics
          </LinkButton>
        </div>
        {clipboard.message ? (
          <p className="text-sm font-medium text-slate-600" role="status">
            {clipboard.message}
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
