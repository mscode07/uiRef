"use client";
import { SiteHeader } from "./site-header";
import { LandingFooter } from "./landing-footer";
import { HowItWorks } from "./how-it-works";
import { ReferenceCarousel } from "./ui/reference-carousel";
import { cn } from "@/lib/utils";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const references = [
  {
    id: "atelier",
    name: "Architectural studio homepage",
    category: "Portfolio · Editorial",
  },
  { id: "forma", name: "Minimal ecommerce", category: "E-commerce · Minimal" },
  {
    id: "nova",
    name: "Project management dashboard",
    category: "Dashboard · Developer",
  },
  { id: "roam", name: "Travel editorial", category: "Blog · Editorial" },
];
const steps = [
  {
    name: "Collect",
    title: "Keep what catches your eye",
    text: "Save a screenshot or a link. Give the good ones a place to live.",
  },
  {
    name: "Notice",
    title: "What caught my eye",
    text: "Strong typography. Thin dividers. No unnecessary cards.",
  },
  {
    name: "Reuse",
    title: "Bring your eye to the next build",
    text: "Find the right reference, revisit your notes, and build with intention.",
  },
];
export function Landing() {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [focusHeld, setFocusHeld] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [preview, setPreview] = useState<(typeof references)[number] | null>(
    null,
  );
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(media.matches);
      if (media.matches) setPlaying(false);
    };
    update();
    media.addEventListener("change", update);
    const visibility = () => setPageVisible(!document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    if (stage.current) observer.observe(stage.current);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!playing || reduced || !visible || !pageVisible || focusHeld || preview)
      return;
    const timer = setTimeout(() => {
      setStep((value) => (value + 1) % steps.length);
      setActive((value) => (value + 1) % references.length);
    }, 4200);
    return () => clearTimeout(timer);
  }, [
    step,
    active,
    playing,
    reduced,
    visible,
    pageVisible,
    focusHeld,
    preview,
  ]);
  function choose(index: number) {
    setStep(index);
    setActive(index);
  }
  function open(ref: (typeof references)[number]) {
    setPreview(ref);
  }
  return (
    <div className="landing mx-auto max-w-[1600px] overflow-x-clip px-16 max-[1101px]:px-10 max-[801px]:px-8 max-[481px]:px-6">
      <a
        className="skip-link fixed -top-20 left-4 z-[100] bg-foreground p-3 text-white focus:top-[10px]"
        href="#main"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="min-w-0 outline-none">
        <section
          className={cn(
            "landing-hero grid min-h-[650px] grid-cols-[40%_60%] items-center pt-16 pb-12",
            "max-[1101px]:min-h-[590px] max-[1101px]:grid-cols-[42%_58%]",
            "max-[801px]:grid-cols-1 max-[801px]:gap-6 max-[801px]:pt-12 max-[801px]:pb-10",
            "max-[481px]:gap-8 max-[481px]:pt-10 max-[481px]:pb-8",
          )}
          aria-labelledby="hero-title"
        >
          <div className="hero-copy pointer-events-none relative z-[4] pb-6 max-[801px]:p-0 [&_a]:pointer-events-auto">
            <h1
              id="hero-title"
              className={cn(
                "mb-8 max-w-[540px] text-[clamp(40px,4.15vw,60px)] leading-[1.08] font-[550] tracking-[-0.035em] text-balance",
                "max-[801px]:mb-6 max-[801px]:max-w-[560px] max-[801px]:text-[46px]",
                "max-[481px]:text-[38px] max-[481px]:leading-[1.14]",
              )}
            >
              Your <span className="text-brand">visual memory</span>{" "}
              <span className="text-muted-foreground">
                for building better interfaces.
              </span>
            </h1>
            <p
              className={cn(
                "mb-7 max-w-[400px] text-[17px] leading-[1.7] text-muted-foreground",
                "max-[1101px]:max-w-[330px] max-[1101px]:text-[16px]",
                "max-[801px]:max-w-[480px]",
                "max-[481px]:mb-6 max-[481px]:text-[15px] max-[481px]:leading-[1.65]",
              )}
            >
              For designers and developers building with Codex and Cursor.
              Collect interfaces you love and remember what makes them work.
            </p>
            <Link
              className={cn(
                "landing-primary inline-flex min-h-12 items-center justify-center gap-6 rounded-md bg-foreground px-6 py-3",
                "text-[15px] font-semibold text-background no-underline transition-transform duration-160 ease-out",
                "pointer-fine:hover:[transform:translateY(-2px)]",
                "active:[transform:scale(.97)]",
                "motion-reduce:transform-none",
              )}
              href="/library"
            >
              Open your library <ArrowRight size={19} />
            </Link>
            <a
              className={cn(
                "landing-text-link mt-6 table text-[14px] underline decoration-brand underline-offset-[7px] transition-colors",
                "duration-160 ease-[ease]",
                "pointer-fine:hover:text-brand",
                "max-[481px]:mt-5",
              )}
              href="#references"
            >
              Explore references
            </a>
          </div>
          <div
            className="hero-demo min-w-0 scroll-mt-28 max-[801px]:mx-auto max-[801px]:w-full max-[801px]:max-w-[640px]"
            ref={stage}
            aria-label="How UIRef works"
            onFocusCapture={() => {
              if (document.documentElement.dataset.input === "keyboard")
                setFocusHeld(true);
            }}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setFocusHeld(false);
            }}
          >
            <div className="reference-stage relative isolate h-[460px] max-[1101px]:h-[390px] max-[801px]:h-[420px] max-[481px]:h-[300px]">
              {references.map((ref, index) => {
                const position =
                  (index - active + references.length) % references.length;
                return (
                  <button
                    key={ref.id}
                    className={cn(
                      "hero-reference group/hero absolute top-6 left-[12%] w-[76%] overflow-hidden rounded-lg border-0 bg-surface p-0",
                      "shadow-float",
                      "[transition:transform_800ms_var(--ease-in-out),opacity_600ms_var(--ease-out),z-index_0s_400ms]",
                      "data-[position=0]:z-[3] data-[position=0]:opacity-100",
                      "data-[position=0]:[transform:translate(0,0)_scale(1)]",
                      "data-[position=1]:z-[2] data-[position=1]:opacity-90",
                      "data-[position=1]:[transform:translate(33%,46px)_scale(.66)]",
                      "data-[position=2]:pointer-events-none data-[position=2]:z-0 data-[position=2]:opacity-0",
                      "data-[position=2]:[transform:translate(0,64px)_scale(.5)]",
                      "data-[position=3]:z-[1] data-[position=3]:opacity-90",
                      "data-[position=3]:[transform:translate(-34%,42px)_scale(.66)]",
                      "max-[1101px]:top-10",
                      "max-[801px]:top-4",
                      "max-[481px]:top-0 max-[481px]:left-[10%] max-[481px]:w-4/5",
                    )}
                    data-position={position}
                    tabIndex={position === 2 ? -1 : 0}
                    aria-hidden={position === 2}
                    aria-label={
                      position === 0
                        ? `Preview ${ref.name}`
                        : `Show ${ref.name}`
                    }
                    onClick={() => {
                      if (position === 0) open(ref);
                      else setActive(index);
                    }}
                  >
                    <Image
                      className="block h-auto w-full"
                      src={`/references/${ref.id}.png`}
                      alt={ref.name}
                      width={1448}
                      height={1086}
                      sizes="(max-width: 600px) 75vw, (max-width: 1000px) 60vw, 40vw"
                      priority={index === 0}
                    />
                    <span
                      className={cn(
                        "absolute bottom-3 left-3 flex items-center gap-2 bg-background px-3 py-2 text-[12px] text-foreground opacity-0",
                        "transition-opacity duration-160 ease-[ease]",
                        "group-focus-visible/hero:opacity-100",
                        "pointer-fine:group-hover/hero:opacity-100",
                      )}
                    >
                      View reference <ArrowRight size={14} />
                    </span>
                  </button>
                );
              })}
              <div
                className={cn(
                  "reference-note pointer-events-none absolute right-0 bottom-2 z-[5] grid w-[300px] rounded-lg border",
                  "border-border bg-background px-6 py-5",
                  "max-[1101px]:bottom-0 max-[1101px]:w-[260px]",
                  "max-[801px]:w-[280px]",
                  "max-[481px]:w-[252px] max-[481px]:px-5 max-[481px]:py-4",
                )}
                aria-live={playing && !focusHeld ? "off" : "polite"}
              >
                {steps.map((item, index) => (
                  <div
                    key={item.name}
                    className={cn(
                      "note-step",
                      "[grid-area:1/1]",
                      "[transform:translateY(8px)]",
                      "opacity-0",
                      "[transition:opacity_200ms_var(--ease-out),transform_250ms_var(--ease-out)]",
                      "data-[active=true]:opacity-100",
                      "data-[active=true]:[transform:translateY(0)]",
                    )}
                    data-active={index === step}
                    aria-hidden={index !== step}
                  >
                    <h2 className="mb-3 text-[13px] font-semibold max-[481px]:mb-2">
                      {item.title}
                    </h2>
                    <p className="text-[14px] leading-[1.6] text-muted-foreground max-[481px]:text-[13px]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="demo-controls mt-4 ml-[16%] flex items-center gap-6 max-[1101px]:ml-[12%] max-[1101px]:gap-5 max-[801px]:ml-0 max-[801px]:justify-center"
              role="group"
              aria-label="Reference workflow"
            >
              {steps.map((item, index) => (
                <button
                  key={item.name}
                  className={cn(
                    "relative min-h-11 border-0 bg-transparent px-0 py-[10px] text-muted-foreground",
                    "after:absolute after:inset-x-0 after:bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-brand",
                    "after:transition-transform after:duration-200 after:ease-out after:content-['']",
                    "aria-pressed:font-semibold aria-pressed:text-brand",
                    "aria-pressed:after:scale-x-100",
                  )}
                  aria-pressed={step === index}
                  onClick={() => choose(index)}
                >
                  {item.name}
                </button>
              ))}
              {!reduced && (
                <button
                  className="demo-play grid min-h-11 w-11 place-items-center border-0 bg-transparent px-0 py-[10px] text-muted-foreground"
                  aria-label={
                    playing ? "Pause demonstration" : "Resume demonstration"
                  }
                  onClick={() => {
                    setFocusHeld(false);
                    setPlaying((value) => !value);
                  }}
                >
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                </button>
              )}
            </div>
          </div>
        </section>
        <HowItWorks />
        <section
          className="landing-references scroll-mt-28 border-t border-border py-12 md:py-16"
          id="references"
          aria-labelledby="references-title"
        >
          <div className="references-intro mx-auto mb-8 max-w-xl text-center">
            <h2
              id="references-title"
              className="mb-4 text-[26px] leading-[1.3] font-semibold tracking-[-0.03em] max-[481px]:text-[25px]"
            >
              Your references,
              <br />
              ready when you need them.
            </h2>
            <p className="mx-auto mb-4 max-w-[440px] text-[14px] leading-[1.7] text-muted-foreground">
              Save and organize interfaces from across the web. Keep the details
              that matter, so you can return to them with a fresh eye.
            </p>
            <span className="sample-label text-[11px] text-muted-foreground">
              A few sample references to explore
            </span>
          </div>
          <ReferenceCarousel onPreview={open} suspended={!!preview} />
        </section>
      </main>
      <LandingFooter onPreview={open} />
      <Dialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent className="landing-preview max-w-[960px]">
          {preview && (
            <>
              <DialogTitle>{preview.name}</DialogTitle>
              <DialogDescription>
                {preview.category} · Sample reference
              </DialogDescription>
              <Image
                className="h-auto w-full rounded-lg"
                src={`/references/${preview.id}.png`}
                alt={preview.name}
                width={1448}
                height={1086}
                sizes="90vw"
              />
              <Link
                className={cn(
                  "landing-primary inline-flex min-h-12 items-center justify-center gap-6 rounded-md bg-foreground px-6 py-3",
                  "text-[15px] font-semibold text-background no-underline transition-transform duration-160 ease-out",
                  "pointer-fine:hover:[transform:translateY(-2px)]",
                  "active:[transform:scale(.97)]",
                  "motion-reduce:transform-none",
                  "justify-self-start",
                )}
                href="/library"
              >
                Explore the library <ArrowRight size={16} />
              </Link>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
