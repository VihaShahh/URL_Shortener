"use client";

import Link from "next/link";
import { useState } from "react";
import { LinkIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { TagList } from "@/components/ui/tag";
import { formatDateTime, readableUrl } from "@/lib/format";
import type { CreatedLink } from "@/types/api";

type RecentLinksPanelProps = {
  links: CreatedLink[];
  onClear: () => void;
};

export function RecentLinksPanel({ links, onClear }: RecentLinksPanelProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visibleLinks = links.filter((link) =>
    [link.shortUrl, link.targetUrl, link.title ?? "", ...(link.tags ?? [])].some((value) => value.toLowerCase().includes(query))
  );

  return (
    <section aria-label="Recent links" className="min-w-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <label className="relative w-full sm:max-w-[340px]">
          <span className="sr-only">Search links</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search links or tags" className="min-h-10 w-full rounded-lg border-slate-200 bg-white py-2 pl-9 pr-3 text-base shadow-soft placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-400 sm:text-sm" />
        </label>
        {links.length ? <Button variant="ghost" className="text-slate-500" icon={<TrashIcon className="h-4 w-4" aria-hidden="true" />} onClick={onClear}>Clear history</Button> : <span className="text-xs text-slate-500">Stored only in this browser</span>}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
        {links.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500"><LinkIcon className="h-5 w-5" aria-hidden="true" /></span>
            <h2 className="text-sm font-medium">No links yet</h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Create your first short link. It will appear here with its tags and analytics.</p>
          </div>
        ) : visibleLinks.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-slate-500" role="status">No links match your search.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
          {visibleLinks.map((link) => (
            <li key={link.id} className="flex min-w-0 items-start gap-3 px-4 py-5 sm:gap-4 sm:px-5">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500"><LinkIcon className="h-4 w-4" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <Link
                  href={`/analytics/${link.code}?adminKey=${encodeURIComponent(link.adminKey)}`}
                  className="min-w-0 break-all text-sm font-medium text-ink-950 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {link.shortUrl}
                </Link>
                <StatusBadge status={link.status} />
                </div>
                <p className="mt-2 break-all text-[13px] leading-5 text-slate-500">{link.title ? `${link.title} · ` : ""}{readableUrl(link.targetUrl)}</p>
                <TagList tags={link.tags ?? []} className="mt-3" />
                <p className="mt-2.5 text-xs text-slate-500">Created {formatDateTime(link.createdAt)}</p>
              </div>
            </li>
          ))}
          </ul>
        )}
      </div>
      {links.length > 0 ? (
        <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs leading-5 text-slate-500"><span>Showing {visibleLinks.length} of {links.length} recent links</span><span>Clearing history keeps your links active.</span></div>
      ) : null}
    </section>
  );
}
