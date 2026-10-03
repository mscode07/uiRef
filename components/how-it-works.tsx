"use client";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Copy, LoaderCircle, Pause, Play } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { cn } from "@/lib/utils";
import type { ReferenceInsights } from "@/lib/schemas";
import defaultExample from "@/lib/demo-example.json";

type Preview = { name: string; url: string; screenshot: string; insights: ReferenceInsights; prompt: string };
const steps = [
  { name: "Try a reference", title: "Found a layout you love? Start here.", description: "Paste a website link to see its screenshot and design details. This demo is temporary; nothing is added to your library." },
  { name: "Find the details", title: "Turn inspiration into clear decisions.", description: "Explore the page’s measured colors, typography, and spacing. These are browser measurements, not AI interpretation." },
  { name: "Build with it", title: "Give your next build a better starting point.", description: "Copy the full reference-based prompt into Codex or Cursor. Adapt the design to your own content and identity." },
];

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState<Preview>(defaultExample);
  const [url, setUrl] = useState(defaultExample.url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [focusHeld, setFocusHeld] = useState(false);
  const [cycle, setCycle] = useState(0);
  const section = useRef<HTMLElement>(null);
  const request = useRef<AbortController | null>(null);
  const reduced = useReducedMotion();
  const autoplay = playing && !reduced && visible && pageVisible && !focusHeld && !loading;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    if (section.current) observer.observe(section.current);
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); request.current?.abort(); };
  }, []);
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => {
      setStep(value => (value + 1) % steps.length);
      setCopied(false);
      setCopyError(false);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [autoplay, step, cycle]);

  function choose(index: number) {
    setStep(index);
    setCycle(value => value + 1);
    setCopied(false);
    setCopyError(false);
  }
  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError("");
    setCopied(false);
    setCopyError(false);
    try {
      const response = await fetch("/api/demo/preview", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }), signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The preview could not be loaded. Please retry.");
      setPreview(result);
      choose(1);
    } catch (error) {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "The preview could not be loaded. Please retry.");
    } finally {
      if (request.current === controller) { setLoading(false); request.current = null; }
    }
  }

  return (
    <section ref={section} id="how-it-works" aria-labelledby="how-it-works-title" className="scroll-mt-28 border-t border-border"
      onFocusCapture={event => { if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || document.documentElement.dataset.input === "keyboard") setFocusHeld(true); }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusHeld(false); else if (!(event.relatedTarget instanceof HTMLInputElement) && !(event.relatedTarget instanceof HTMLTextAreaElement) && document.documentElement.dataset.input !== "keyboard") setFocusHeld(false); }}>
      <ContainerScroll titleComponent={<>
        <h2 id="how-it-works-title" className="text-[32px] leading-tight font-semibold tracking-[-0.03em] md:text-[40px]">How it works.<br /><span className="text-muted-foreground">From a good reference to your next build.</span></h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">Try it with SuperX, or paste a website you like. Explore the design details, then take them into your coding tool.</p>
      </>}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
          <span className="font-semibold">UIRef <span className="ml-2 font-normal text-muted-foreground">/ Your workflow</span></span>
          {!reduced ? <button type="button" onClick={() => { setPlaying(value => !value); setCycle(value => value + 1); }} aria-label={playing ? "Pause workflow autoplay" : "Resume workflow autoplay"} className="inline-flex min-h-11 items-center gap-2 text-xs text-muted-foreground hover:text-brand">{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? "Auto play" : "Paused"}</button> : <span className="text-xs text-muted-foreground">Explore at your pace</span>}
        </div>
        <div className="grid md:grid-cols-[1fr_1.1fr]">
          <div className="min-w-0 border-b border-border bg-surface p-4 md:border-r md:border-b-0 md:p-6">
            <form onSubmit={analyze} className="mb-6">
              <label htmlFor="demo-url" className="mb-2 block text-sm font-medium">Try a website</label>
              <div className="flex flex-wrap gap-2">
                <input id="demo-url" type="url" required maxLength={2048} value={url} onChange={event => setUrl(event.target.value)} aria-describedby="demo-privacy demo-error" placeholder="https://example.com" className="min-h-11 min-w-0 flex-[1_1_180px] rounded-md border border-input bg-background px-3 text-base" />
                <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60">{loading && <LoaderCircle size={15} className="animate-spin motion-reduce:animate-none" />}{loading ? "Analyzing…" : "Preview site"}</button>
              </div>
              <p id="demo-privacy" className="mt-2 text-xs leading-relaxed text-muted-foreground">Try freely. This preview isn’t saved to your library.</p>
              <p id="demo-error" role={error ? "alert" : undefined} className="mt-2 text-xs leading-relaxed text-destructive">{error}</p>
            </form>
            <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted-foreground"><a href={preview.url} target="_blank" rel="noreferrer" className="truncate underline underline-offset-4 hover:text-brand">{new URL(preview.url).hostname}</a><span className="shrink-0">{preview === defaultExample ? "Default example" : "Temporary preview"}</span></div>
            <div aria-busy={loading} className="relative overflow-hidden rounded-md bg-background">
              <Image unoptimized src={preview.screenshot} alt={`Website preview of ${preview.name}`} width={1200} height={900} className={cn("aspect-[4/3] w-full object-cover object-top max-md:max-h-60", loading && "opacity-40")} />
              {loading && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 p-6 text-center text-sm"><LoaderCircle size={22} className="animate-spin motion-reduce:animate-none" /><span>Capturing the page and measuring its design…</span><span className="text-xs text-muted-foreground">This can take up to a minute.</span></div>}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{preview === defaultExample ? "A captured example of SuperX. Paste another URL above to explore its design." : "Your preview is ready. Explore its details and copy the prompt on the right."}</p>
          </div>
          <div className="flex min-w-0 flex-col p-5 md:p-8">
            <div role="group" aria-label="How it works steps" className="mb-8 flex border-b border-border">
              {steps.map((item, index) => <button type="button" key={item.name} onClick={() => choose(index)} aria-pressed={step === index} className={cn("min-h-12 flex-1 border-b-2 px-1 pb-3 text-left text-xs transition-colors hover:text-brand", step === index ? "border-brand text-brand" : "border-transparent text-muted-foreground")}><span className="mb-1 block tabular-nums">0{index + 1}</span>{item.name}</button>)}
            </div>
            <div className="grid flex-1" aria-live={autoplay ? "off" : "polite"}>
              {steps.map((item, index) => (
                <motion.div key={item.name} inert={step !== index} aria-hidden={step !== index} className={cn("col-start-1 row-start-1", step !== index && "invisible pointer-events-none")} initial={false} animate={{ opacity: step === index ? 1 : 0, y: reduced || step === index ? 0 : 12 }} transition={{ duration: reduced ? 0 : 0.2 }}>
                  <h3 className="max-w-sm text-[24px] leading-snug font-semibold tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  <div className="mt-6 min-h-52">
                    {index === 0 && <div className="space-y-4 text-sm"><div className="flex items-start gap-3 border-b border-border pb-4"><Check size={16} className="mt-1 shrink-0 text-brand" /><span className="min-w-0 break-words">Ready to explore: {new URL(preview.url).hostname}</span></div><div className="flex items-start gap-3"><Check size={16} className="mt-1 shrink-0 text-brand" /><span>Preview the design here. Use your library when you want to keep a reference.</span></div></div>}
                    {index === 1 && <div className="space-y-4"><div className="flex flex-wrap gap-3" aria-label="Measured color palette">{preview.insights.palette.slice(0, 5).map(color => <div key={color.color} title={color.role} className="text-center"><span className="mb-1 block h-8 w-11 rounded-sm border border-border" style={{ backgroundColor: color.color }} /><span className="text-[11px] text-muted-foreground">{color.color}</span></div>)}</div><dl className="space-y-3 text-sm">{preview.insights.sections.filter(item => ["Typography", "Layout & spacing"].includes(item.title)).map(item => <div key={item.title} className="border-b border-border pb-3"><dt className="mb-1 font-medium">{item.title}</dt><dd className="break-words text-xs leading-relaxed text-muted-foreground">{item.values[0] ? `${item.values[0].label}: ${item.values[0].value}` : item.description}</dd></div>)}</dl><p className="text-xs text-muted-foreground">Measured at desktop width. Full details are included in the prompt.</p></div>}
                    {index === 2 && <><label htmlFor="demo-prompt" className="sr-only">Reference build prompt</label><textarea id="demo-prompt" readOnly value={preview.prompt} className="h-40 w-full resize-y rounded-md border border-border bg-surface p-3 text-sm leading-relaxed" /><button type="button" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-brand hover:underline" onClick={async () => { setPlaying(false); try { await navigator.clipboard.writeText(preview.prompt); setCopied(true); setCopyError(false); } catch { setCopyError(true); } }}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Build prompt copied" : "Copy build prompt"}</button>{copyError && <p role="alert" className="text-xs text-destructive">Select the prompt above and copy it manually.</p>}</>}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 flex min-h-11 items-center justify-between gap-3 border-t border-border pt-4">
              <span className="shrink-0 text-xs text-muted-foreground">{step + 1} of 3</span>
              {step < 2 ? <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-brand" onClick={() => choose(step + 1)}>Next: {steps[step + 1].name.toLowerCase()} <ArrowRight size={16} className="shrink-0" /></button> : <Link href="/library" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-brand">Try it in your library <ArrowRight size={16} className="shrink-0" /></Link>}
            </div>
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
}
