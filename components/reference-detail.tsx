"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Copy, Check, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { buildReferencePrompt } from "@/lib/reference-prompt";
import type { Reference } from "@/lib/schemas";

const action =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-surface active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none";

export function ReferenceDetail({
  reference,
  busy,
  onClose,
  onProcess,
}: {
  reference: Reference | null;
  busy: boolean;
  onClose: () => void;
  onProcess: (reference: Reference, refreshCapture?: boolean) => void;
}) {
  const [tab, setTab] = useState<"breakdown" | "prompt">("breakdown");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  useEffect(() => {
    setTab("breakdown");
    setCopied(false);
    setCopyError("");
  }, [reference?.id]);
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  const insight = reference?.insights;
  const prompt = reference ? buildReferencePrompt(reference) : "";
  return (
    <Dialog open={!!reference} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="reference-dialog grid h-[88dvh] max-h-[960px] max-w-[1240px] grid-cols-[minmax(0,1.15fr)_minmax(360px,1fr)] gap-0 overflow-hidden p-0 max-[901px]:flex max-[901px]:h-[92dvh] max-[901px]:max-h-[92dvh] max-[901px]:flex-col max-[701px]:w-[calc(100%-24px)] [&_[data-slot=dialog-close]]:z-20 [&_[data-slot=dialog-close]]:bg-background">
        {reference && (
          <>
            <div className="min-h-0 min-w-0 overflow-y-auto overscroll-contain bg-surface p-6 max-[901px]:h-[28dvh] max-[901px]:min-h-40 max-[901px]:shrink-0 max-[701px]:px-3 max-[701px]:pt-10 max-[701px]:pb-3">
              {reference.screenshot ? (
                <a
                  href={reference.screenshot}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open full screenshot of ${reference.name}`}
                  className="block rounded-lg focus-visible:outline-offset-4"
                >
                  <img
                    src={reference.screenshot}
                    alt={`${reference.name} captured interface`}
                    className="block h-auto w-full rounded-lg"
                  />
                </a>
              ) : (
                <div
                  className="flex min-h-64 flex-col justify-center gap-3 px-6 text-center"
                  aria-live="polite"
                >
                  <p className="text-[18px] font-medium">
                    {busy
                      ? "Capturing the interface…"
                      : "Preview not available yet"}
                  </p>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {busy
                      ? "Loading the public page, its fonts, and images. Your reference is already saved."
                      : reference.captureError ||
                        "Capture this website to see its design here."}
                  </p>
                </div>
              )}
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <header className="shrink-0 px-7 pt-8 pb-5 max-[701px]:px-5 max-[701px]:pt-5">
                <DialogTitle className="pr-6 text-[26px] leading-tight tracking-[-.02em]">
                  {reference.name}
                </DialogTitle>
                <DialogDescription className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                  <span>{reference.category}</span>
                  {reference.url && (
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-brand underline-offset-4 hover:underline"
                    >
                      {new URL(reference.url).hostname}
                      <ArrowUpRight size={13} />
                    </a>
                  )}
                  {reference.screenshot && (
                    <a
                      href={reference.screenshot}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand underline-offset-4 hover:underline"
                    >
                      Full image
                    </a>
                  )}
                </DialogDescription>
                <div
                  className="mt-5 flex gap-6 border-b border-border"
                  role="tablist"
                  aria-label="Reference details"
                >
                  {(
                    [
                      ["breakdown", "Design breakdown"],
                      ["prompt", "Build prompt"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      id={`reference-tab-${value}`}
                      role="tab"
                      aria-selected={tab === value}
                      aria-controls={`reference-panel-${value}`}
                      tabIndex={tab === value ? 0 : -1}
                      onKeyDown={(event) => {
                        if (
                          ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                            event.key,
                          )
                        ) {
                          event.preventDefault();
                          const next =
                            event.key === "Home"
                              ? "breakdown"
                              : event.key === "End"
                                ? "prompt"
                                : value === "breakdown"
                                  ? "prompt"
                                  : "breakdown";
                          setTab(next);
                          document
                            .getElementById(`reference-tab-${next}`)
                            ?.focus();
                        }
                      }}
                      onClick={() => setTab(value)}
                      className="-mb-px min-h-11 border-b-2 border-transparent py-2 text-[13px] text-muted-foreground aria-selected:border-foreground aria-selected:font-semibold aria-selected:text-foreground hover:text-foreground"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </header>
              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 pb-7 max-[701px]:px-5"
                role="tabpanel"
                id={`reference-panel-${tab}`}
                aria-labelledby={`reference-tab-${tab}`}
                tabIndex={0}
              >
                {busy && (
                  <div
                    role="status"
                    className="mb-5 border-b border-border pb-5"
                  >
                    <p className="text-[13px] font-medium">
                      {reference.screenshot
                        ? "Reading the design…"
                        : "Capturing and reading the design…"}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      This can take a minute. You can close this panel while it
                      works.
                    </p>
                    <div className="mt-3 h-1 w-full animate-pulse rounded bg-border motion-reduce:animate-none" />
                  </div>
                )}
                {!busy &&
                  (reference.captureError || reference.analysisError) && (
                    <div
                      className="mb-5 border-b border-border pb-5"
                      role="status"
                    >
                      <p className="text-[13px] font-medium">
                        {reference.captureError
                          ? "Capture needs another try"
                          : reference.analysisSource === "vision"
                            ? "Could not refresh the analysis"
                            : "Preview saved · analysis incomplete"}
                      </p>
                      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                        {reference.captureError || reference.analysisError}
                      </p>
                    </div>
                  )}
                {tab === "prompt" ? (
                  <>
                    <p className="mb-4 text-[12px] leading-relaxed text-muted-foreground">
                      Paste this into your coding AI. Attach the full image as
                      well for the closest visual match.
                      {reference.analysisSource !== "vision" &&
                        " This draft contains measured evidence only; complete vision analysis for a richer specification."}
                    </p>
                    <textarea
                      aria-label="Reusable build prompt"
                      readOnly
                      value={prompt}
                      className="min-h-[420px] w-full resize-y rounded-md border border-border bg-surface p-4 text-[13px] leading-[1.7] max-[701px]:text-[16px]"
                    />
                  </>
                ) : (
                  <>
                    {insight ? (
                      <>
                        <p className="text-[14px] leading-[1.7]">
                          {insight.summary}
                        </p>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {reference.analysisSource === "vision"
                            ? "AI visual interpretation · values may be estimates"
                            : reference.analysisSource === "measured"
                              ? "Measured from the rendered website"
                              : "Measured from the uploaded image"}
                        </p>
                        {insight.palette.length > 0 && (
                          <section className="mt-6">
                            <h3 className="mb-3 text-[14px] font-semibold">
                              Color palette
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                              {insight.palette.map((item, index) => (
                                <div key={`${item.color}-${index}`}>
                                  <span
                                    className="mb-2 block h-8 rounded border border-black/10"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <p className="text-[11px] font-medium">
                                    {item.color.toUpperCase()}
                                  </p>
                                  <p className="mt-1 text-[11px] text-muted-foreground">
                                    {item.role}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                        {insight.sections.map((section, index) => (
                          <section
                            key={index}
                            className="mt-6 border-t border-border pt-5"
                          >
                            <h3 className="text-[15px] font-semibold">
                              {section.title}
                            </h3>
                            <p className="mt-2 text-[13px] leading-[1.7] text-muted-foreground">
                              {section.description}
                            </p>
                            {section.values.length > 0 && (
                              <dl className="mt-3 space-y-3">
                                {section.values.map((value, i) => (
                                  <div key={i}>
                                    <dt className="text-[12px] font-semibold">
                                      {value.label}
                                    </dt>
                                    <dd className="mt-1 break-words text-[12px] leading-[1.65] text-muted-foreground">
                                      {value.value}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                          </section>
                        ))}
                        {insight.principles.length > 0 && (
                          <section className="mt-6 border-t border-border pt-5">
                            <h3 className="text-[15px] font-semibold">
                              What to carry into your build
                            </h3>
                            <ul className="mt-3 list-disc space-y-2 pl-4 text-[13px] leading-[1.7]">
                              {insight.principles.map((principle, i) => (
                                <li key={i}>{principle}</li>
                              ))}
                            </ul>
                          </section>
                        )}
                        <details className="mt-6 border-t border-border pt-4">
                          <summary className="cursor-pointer text-[12px] font-medium">
                            Evidence & limitations
                          </summary>
                          <ul className="mt-3 list-disc space-y-2 pl-4 text-[12px] leading-relaxed text-muted-foreground">
                            {insight.limitations.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </details>
                      </>
                    ) : (
                      !busy && (
                        <div className="py-3">
                          <h3 className="text-[16px] font-medium">
                            Turn this reference into a design brief
                          </h3>
                          <p className="mt-2 text-[13px] leading-[1.7] text-muted-foreground">
                            Extract its palette, typography, layout, spacing,
                            and component details. Then copy a complete build
                            prompt.
                          </p>
                          {reference.sample && (
                            <p className="mt-3 text-[12px] text-muted-foreground">
                              This is a sample. Save your own screenshot or link
                              to generate a design breakdown.
                            </p>
                          )}
                        </div>
                      )
                    )}
                    {(reference.likes || reference.notes) && (
                      <section className="mt-6 border-t border-border pt-5">
                        <h3 className="text-[15px] font-semibold">
                          Your notes
                        </h3>
                        {reference.likes && (
                          <p className="mt-2 whitespace-pre-wrap text-[13px] leading-[1.7]">
                            {reference.likes}
                          </p>
                        )}
                        {reference.notes && (
                          <p className="mt-2 whitespace-pre-wrap text-[13px] leading-[1.7] text-muted-foreground">
                            {reference.notes}
                          </p>
                        )}
                      </section>
                    )}
                  </>
                )}
              </div>
              <footer className="shrink-0 border-t border-border bg-background px-7 py-4 max-[701px]:px-5">
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={!insight || busy}
                    className={`${action} border-foreground bg-foreground text-background hover:bg-foreground/90`}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(prompt);
                        setCopied(true);
                        setCopyError("");
                      } catch {
                        setTab("prompt");
                        setCopyError(
                          "Select the prompt above and copy it manually.",
                        );
                      }
                    }}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? "Prompt copied" : "Copy build prompt"}
                  </button>
                  {!reference.sample && (
                    <button
                      className={action}
                      disabled={busy}
                      onClick={() => onProcess(reference)}
                    >
                      <RefreshCw size={14} />
                      {busy
                        ? "Processing…"
                        : insight
                          ? "Analyze again"
                          : reference.captureError
                            ? "Retry capture"
                            : "Analyze reference"}
                    </button>
                  )}
                  {reference.capturedAt && !busy && (
                    <button
                      className="min-h-11 text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      onClick={() => onProcess(reference, true)}
                    >
                      Refresh capture
                    </button>
                  )}
                </div>
                <p
                  className="mt-2 text-[11px] leading-relaxed text-muted-foreground"
                  role="status"
                >
                  {copyError ||
                    (copied
                      ? "Includes design details, your notes, and implementation instructions."
                      : "A portable brief for your next build.")}
                </p>
              </footer>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
