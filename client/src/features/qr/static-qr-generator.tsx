"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { ArrowDownTrayIcon, CheckIcon, GlobeAltIcon, InformationCircleIcon, LockClosedIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { generateStaticQr, QR_PRESETS, type QrPresetId, type StaticQrArtwork } from "@/lib/qr-code";

function downloadArtwork(artwork: StaticQrArtwork, format: "png" | "svg") {
  let blob: Blob;
  if (format === "svg") {
    blob = new Blob([artwork.svg], { type: "image/svg+xml;charset=utf-8" });
  } else {
    const binary = atob(artwork.pngDataUrl.split(",")[1]);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    blob = new Blob([bytes], { type: "image/png" });
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = `static-qr.${format}`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

const swatches: Record<QrPresetId, string> = {
  classic: "bg-black", navy: "bg-[#112647]", forest: "bg-[#075c48]"
};

export function StaticQrGenerator() {
  const [destination, setDestination] = useState("");
  const [presetId, setPresetId] = useState<QrPresetId>("classic");
  const [artwork, setArtwork] = useState<StaticQrArtwork | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const revision = useRef(0);

  useEffect(() => () => { revision.current += 1; }, []);

  function invalidateArtwork() {
    revision.current += 1;
    setArtwork(null);
    setError(null);
    setGenerating(false);
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request = ++revision.current;
    setArtwork(null);
    setError(null);
    setGenerating(true);

    try {
      const generated = await generateStaticQr(destination, presetId);
      if (request === revision.current) setArtwork(generated);
    } catch (cause) {
      if (request === revision.current) {
        setError(cause instanceof Error ? cause.message : "Couldn't generate the QR. Please try again.");
      }
    } finally {
      if (request === revision.current) setGenerating(false);
    }
  }

  return (
    <AppShell activePage="qr" showApiStatus={false}>
      <PageHeader
        title="QR codes"
        description="Create a QR code from any URL."
        action={<span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600">Free · No account required</span>}
      />
      <form aria-label="Static QR generator" noValidate onSubmit={handleGenerate} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600"><GlobeAltIcon className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 className="text-base font-medium tracking-[-0.2px]">Create a QR code</h2>
            <p className="mt-1 text-[13px] text-slate-500">Choose a destination and download your code.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-7 p-5 sm:p-6">
              <Field
                id="qr-destination"
                label="Destination URL"
                type="url"
                inputMode="url"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={8192}
                placeholder="https://example.com/menu"
                hint="The page people will open when they scan. Include https:// or http://."
                value={destination}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "qr-error qr-destination-hint" : "qr-destination-hint"}
                onChange={(event) => {
                  invalidateArtwork();
                  setDestination(event.target.value);
                }}
              />

              <fieldset>
                <legend className="text-sm font-medium text-ink-900">QR code color</legend>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {QR_PRESETS.map((preset) => (
                    <label key={preset.id} className="flex min-h-11 cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="qr-color"
                        value={preset.id}
                        checked={presetId === preset.id}
                        onChange={() => {
                          invalidateArtwork();
                          setPresetId(preset.id);
                        }}
                        className="peer sr-only"
                      />
                      <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 text-white ring-offset-2 peer-checked:ring-1 peer-checked:ring-ink-950 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-slate-600 ${swatches[preset.id]}`}>
                        {presetId === preset.id ? <CheckIcon className="h-4 w-4" /> : null}
                      </span>
                      <span className="text-sm text-slate-600">{preset.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <dl className="divide-y divide-slate-100 text-[13px]">
                <div className="flex justify-between gap-4 py-3.5"><dt className="text-slate-500">Code type</dt><dd>Static QR code</dd></div>
                <div className="flex justify-between gap-4 py-3.5"><dt className="text-slate-500">Download formats</dt><dd>PNG & SVG</dd></div>
                <div className="flex justify-between gap-4 py-3.5"><dt className="text-slate-500">PNG size</dt><dd>1,024 × 1,024 px</dd></div>
              </dl>
              <details className="text-[13px] leading-6 text-slate-500">
                <summary className="w-fit cursor-pointer text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Can I change the destination later?</summary>
                <p className="mt-2">A static QR stores this URL directly in the image, so its destination cannot be edited after printing. Shortner adds no expiry or scan tracking. Keep your destination online.</p>
              </details>
              {error ? (
                <p id="qr-error" role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

          </div>
          <div className="min-w-0 border-t border-slate-100 bg-slate-50/40 p-5 sm:p-6 md:border-l md:border-t-0">
            <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-sm font-medium">QR code preview</h3><span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">Static</span></div>
          <div aria-busy={generating} className="qr-preview-grid flex min-h-[280px] items-center justify-center rounded-lg border border-slate-200 p-5">
            {artwork ? (
              <Image
                src={artwork.pngDataUrl}
                alt="Generated static QR code"
                width={1024}
                height={1024}
                unoptimized
                className="h-auto w-full max-w-[244px] bg-white p-2"
              />
            ) : (
              <div className="bg-white px-5 py-4 text-center text-slate-500">
                <QrCodeIcon aria-hidden="true" className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                <p className="text-sm">{generating ? "Creating your QR…" : "Your QR will appear here"}</p>
              </div>
            )}
          </div>

          <p role="status" className="mt-4 text-[13px] text-slate-500">
            {artwork ? "QR ready. Scan it once before you print." : "Generate a QR to enable downloads."}
          </p>
          {artwork ? (
            <div className="mt-3">
              <p className="text-xs text-slate-500">Encoded destination</p>
              <p className="mt-1 break-all text-sm text-ink-900">{artwork.payload}</p>
            </div>
          ) : null}

          <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
            <Button variant="secondary" disabled={!artwork} onClick={() => artwork && downloadArtwork(artwork, "png")} icon={<ArrowDownTrayIcon aria-hidden="true" className="h-4 w-4" />}>
              Download PNG
            </Button>
            <Button variant="secondary" disabled={!artwork} onClick={() => artwork && downloadArtwork(artwork, "svg")} icon={<ArrowDownTrayIcon aria-hidden="true" className="h-4 w-4" />}>
              Download SVG
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-500">PNG: 1,024 × 1,024 pixels. SVG: scales for print.</p>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="flex items-center justify-center gap-2 text-xs text-slate-500"><LockClosedIcon className="h-3.5 w-3.5" aria-hidden="true" />Generated on your device</span>
          <Button type="submit" loading={generating}>Generate QR code</Button>
        </div>
      </form>
      <p className="mt-5 flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-500"><InformationCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />Scan a proof on your phone before printing a batch. Keep the light border clear.</p>
    </AppShell>
  );
}
