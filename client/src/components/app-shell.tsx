import type { ReactNode } from "react";
import Link from "next/link";
import { LinkIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import { ApiStatus } from "@/components/api-status";

type AppShellProps = {
  children: ReactNode;
  showApiStatus?: boolean;
  activePage?: "links" | "qr" | "analytics";
};

export function AppShell({ children, showApiStatus = true, activePage }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[208px_minmax(0,1fr)]">
      <a href="#main-content" className="sr-only z-50 rounded-md bg-ink-950 p-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
        Skip to content
      </a>
      <aside className="border-b border-slate-200 bg-white px-4 pb-3 pt-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:pb-6 lg:pt-8">
        <Link href="/" aria-label="Shortner home" className="flex w-fit items-center gap-2.5 px-3 text-[23px] font-semibold tracking-[-1px] text-ink-950">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-950 text-white">
            <LinkIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          Shortner
        </Link>
        <p className="mb-2 mt-9 hidden px-3 text-xs font-medium text-slate-500 lg:block">Workspace</p>
        <nav aria-label="Main navigation" className="mt-5 flex flex-wrap gap-1 text-sm text-slate-500 lg:mt-0 lg:flex-col">
            <Link
              href="/"
              aria-current={activePage === "links" ? "page" : undefined}
              className="inline-flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-50 hover:text-ink-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-[current=page]:bg-slate-100 aria-[current=page]:font-medium aria-[current=page]:text-ink-950"
            >
              <LinkIcon className="h-4 w-4" aria-hidden="true" />
              Links
            </Link>
            <Link
              href="/qr"
              aria-current={activePage === "qr" ? "page" : undefined}
              className="inline-flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-50 hover:text-ink-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 aria-[current=page]:bg-slate-100 aria-[current=page]:font-medium aria-[current=page]:text-ink-950"
            >
              <QrCodeIcon className="h-4 w-4" aria-hidden="true" />
              QR codes
            </Link>
        </nav>
        <div className="mt-auto hidden px-3 pt-8 lg:block">
          {showApiStatus ? <ApiStatus /> : <p className="text-xs text-slate-500">QR generation stays on your device.</p>}
        </div>
      </aside>
      <div className="min-w-0">
        <header className="hidden h-[73px] items-center gap-4 border-b border-slate-200 bg-white px-8 text-sm lg:flex xl:px-10">
          <span className="text-slate-500">Shortner</span>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="text-ink-700">{activePage === "qr" ? "QR codes" : activePage === "analytics" ? "Analytics" : "Links"}</span>
        </header>
        <main id="main-content" className="mx-auto w-full min-w-0 max-w-[1280px] px-5 py-7 sm:px-8 lg:py-9 xl:px-10">{children}</main>
      </div>
    </div>
  );
}
