"use client";

import { useRef, useState } from "react";
import { GlobeAltIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { CreatedLinkCard } from "@/features/links/created-link-card";
import { CreateLinkForm } from "@/features/links/create-link-form";
import { RecentLinksPanel } from "@/features/links/recent-links-panel";
import { useRecentLinks } from "@/hooks/use-recent-links";
import type { CreatedLink } from "@/types/api";

export function LinkDashboard() {
  const [createdLink, setCreatedLink] = useState<CreatedLink | null>(null);
  const recent = useRecentLinks();
  const createDialog = useRef<HTMLDialogElement>(null);

  function handleCreated(link: CreatedLink) {
    setCreatedLink(link);
    recent.addLink(link);
    createDialog.current?.close();
  }

  return (
    <AppShell activePage="links">
      <PageHeader title="Links" description="Your short links, in one place." action={<Button icon={<PlusIcon className="h-4 w-4" aria-hidden="true" />} onClick={() => createDialog.current?.showModal()}>Create short link</Button>} />
      {createdLink ? <div className="mb-6"><CreatedLinkCard link={createdLink} /></div> : null}
      <RecentLinksPanel links={recent.links} onClear={recent.clearLinks} />
      <dialog ref={createDialog} aria-labelledby="create-link-heading" className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-[680px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-0 text-ink-950 shadow-xl backdrop:bg-black/25">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600"><GlobeAltIcon className="h-5 w-5" aria-hidden="true" /></span><h2 id="create-link-heading" className="text-base font-medium">Create a short link</h2></div>
          <Button variant="ghost" className="px-2" aria-label="Close create link" onClick={() => createDialog.current?.close()}><XMarkIcon className="h-5 w-5" aria-hidden="true" /></Button>
        </div>
        <div className="p-5 sm:p-6"><CreateLinkForm onCreated={handleCreated} /></div>
      </dialog>
    </AppShell>
  );
}
