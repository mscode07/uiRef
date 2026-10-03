"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const designs = [
  { id: "atelier", name: "Architectural studio homepage", category: "Portfolio · Editorial" },
  { id: "forma", name: "Minimal ecommerce", category: "E-commerce · Minimal" },
  { id: "nova", name: "Project management dashboard", category: "Dashboard · Developer" },
  { id: "roam", name: "Travel editorial", category: "Blog · Editorial" },
  { id: "daylight", name: "Daylight", category: "Sample interface" },
  { id: "stackkit", name: "Stackkit", category: "Sample interface" },
  { id: "array", name: "Array", category: "Sample interface" },
  { id: "lanapark", name: "Lana Park", category: "Sample interface" },
];

/** Screenshot-led coverflow based on the supplied Skiper49 visual reference. */
export function ReferenceCarousel({ onPreview, suspended = false }: {
  onPreview: (design: (typeof designs)[number]) => void;
  suspended?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [held, setHeld] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [cycle, setCycle] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const autoplay = playing && !reduced && visible && pageVisible && !held && !suspended;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    if (root.current) observer.observe(root.current);
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => setActive(value => (value + 1) % designs.length), 4200);
    return () => window.clearTimeout(timer);
  }, [active, autoplay, cycle]);

  function choose(index: number) {
    setActive((index + designs.length) % designs.length);
    setCycle(value => value + 1);
  }

  return (
    <div ref={root} role="region" aria-roledescription="carousel" aria-label="Sample design references"
      onFocusCapture={() => { if (document.documentElement.dataset.input === "keyboard") { setHeld(true); setKeyboard(true); } }}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false); }}
      onPointerDown={() => setKeyboard(false)}
      onKeyDown={event => {
        setKeyboard(true);
        setHeld(true);
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault(); choose(active + (event.key === "ArrowRight" ? 1 : -1));
        }
      }}>
      <div className="relative isolate h-[clamp(250px,32vw,440px)] overflow-hidden [--slide-width:clamp(220px,29vw,390px)] [perspective:1200px]"
        onTouchStart={event => { touch.current = event.touches[0].clientX; setHeld(true); }}
        onTouchEnd={event => {
          if (touch.current !== null) {
            const distance = event.changedTouches[0].clientX - touch.current;
            if (Math.abs(distance) > 40) choose(active + (distance < 0 ? 1 : -1));
          }
          touch.current = null; setHeld(false);
        }}
        onTouchCancel={() => { touch.current = null; setHeld(false); }}>
        {designs.map((design, index) => {
          const offset = ((index - active + designs.length + 4) % designs.length) - 4;
          const distance = Math.abs(offset);
          const selected = offset === 0;
          return (
            <motion.button key={design.id} type="button"
              className="absolute top-8 left-1/2 aspect-[4/3] w-[var(--slide-width)] overflow-hidden rounded-xl bg-surface p-0 shadow-float outline-offset-4"
              initial={false}
              animate={{
                x: `${-50 + offset * 82}%`,
                y: selected ? 0 : 16 + distance * 3,
                rotateY: selected ? 0 : offset < 0 ? 32 : -32,
                scale: selected ? 1 : 0.86 - distance * 0.035,
                opacity: distance > 3 ? 0 : distance > 2 ? 0.55 : 1,
              }}
              style={{ zIndex: 10 - distance, pointerEvents: distance > 3 ? "none" : "auto" }}
              transition={{ duration: reduced || keyboard ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
              tabIndex={selected ? 0 : -1}
              aria-hidden={distance > 3}
              aria-label={selected ? `Preview ${design.name}` : `Show ${design.name}`}
              onClick={() => selected ? onPreview(design) : choose(index)}>
              <Image src={`/references/${design.id}.png`} alt={design.name} width={1448} height={1086} sizes="(max-width: 768px) 220px, 390px" className="h-full w-full object-cover object-top" />
            </motion.button>
          );
        })}
      </div>
      <div className="mx-auto -mt-4 max-w-lg text-center" aria-live={autoplay ? "off" : "polite"} aria-atomic="true">
        <button type="button" onClick={() => onPreview(designs[active])} className="min-h-11 text-lg font-semibold tracking-[-0.02em] hover:text-brand">{designs[active].name}</button>
        <p className="text-sm text-muted-foreground">{designs[active].category}</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-1 sm:gap-4" role="group" aria-label="Slideshow controls">
        <button type="button" aria-label="Previous design" onClick={() => choose(active - 1)} className="grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"><ArrowLeft size={18} /></button>
        <div className="flex items-center" role="group" aria-label="Choose a design">
          {designs.map((design, index) => <button key={design.id} type="button" aria-label={`Go to ${design.name}`} aria-pressed={active === index} onClick={() => choose(index)} className="group grid h-11 w-6 place-items-center sm:w-7"><span className={cn("size-2 rounded-full transition-colors group-hover:bg-brand", active === index ? "bg-foreground" : "bg-border")} /></button>)}
        </div>
        <button type="button" aria-label="Next design" onClick={() => choose(active + 1)} className="grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"><ArrowRight size={18} /></button>
        {!reduced && <button type="button" aria-label={playing ? "Pause design slideshow" : "Resume design slideshow"} onClick={() => setPlaying(value => !value)} className="grid size-11 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">{playing ? <Pause size={16} /> : <Play size={16} />}</button>}
      </div>
    </div>
  );
}
