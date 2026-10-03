"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const references = [
  { id: "atelier", title: "Editorial architecture", note: "The space around the work. The quiet type. The confidence to leave things out." },
  { id: "forma", title: "Minimal ecommerce", note: "Warm materials, generous photography, and a clear path from browsing to choosing." },
  { id: "roam", title: "Travel editorial", note: "Immersive photography. A strong headline. A story that starts before you scroll." },
];

export function AboutReferenceStack() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [focused, setFocused] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const autoplay = playing && visible && pageVisible && !focused && !reduced;
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    if (root.current) observer.observe(root.current);
    const update = () => setPageVisible(!document.hidden);
    update(); document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  useEffect(() => {
    if (!autoplay) return;
    const timer = setTimeout(() => setActive(value => (value + 1) % references.length), 5000);
    return () => clearTimeout(timer);
  }, [active, autoplay]);

  return <figure ref={root} aria-label="Design references and what to remember" className="mx-auto w-full min-w-0 max-w-[760px]"
    onFocusCapture={() => { if (document.documentElement.dataset.input === "keyboard") { setFocused(true); setKeyboard(true); } }}
    onKeyDown={() => { setFocused(true); setKeyboard(true); }}
    onPointerDown={() => { setKeyboard(false); setFocused(false); }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="relative px-3 pt-5 sm:px-6 sm:pt-8">
      <div aria-hidden="true" className="absolute inset-x-5 top-6 bottom-10 rotate-[-5deg] overflow-hidden rounded-lg bg-surface sm:inset-x-8"><Image src="/references/nova.png" alt="" width={1448} height={1086} sizes="50vw" className="h-full w-full object-cover" /></div>
      <div aria-hidden="true" className="absolute inset-x-5 top-6 bottom-10 rotate-[4deg] overflow-hidden rounded-lg bg-surface sm:inset-x-8"><Image src="/references/forma.png" alt="" width={1448} height={1086} sizes="50vw" className="h-full w-full object-cover" /></div>
      <div className="relative grid aspect-[4/3] rounded-lg bg-surface shadow-float">
        {references.map((reference, index) => <motion.div key={reference.id} aria-hidden={index !== active} initial={false} animate={{ opacity: index === active ? 1 : 0, y: index === active ? 0 : 10, scale: index === active ? 1 : 0.985 }} transition={{ duration: reduced || keyboard ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }} className="col-start-1 row-start-1 overflow-hidden rounded-lg">
          <Image src={`/references/${reference.id}.png`} alt={reference.title} width={1448} height={1086} sizes="(max-width: 1024px) 90vw, 55vw" className="h-full w-full object-cover" />
        </motion.div>)}
      </div>
      <div className="relative z-10 -mt-6 ml-3 mr-3 rounded-lg border border-border bg-background p-4 sm:ml-10 sm:mr-6 sm:p-5" aria-live={autoplay ? "off" : "polite"}>
        <span className="text-sm font-semibold">Worth remembering</span>
        <div className="mt-2 grid">{references.map((reference, index) => <p key={reference.id} aria-hidden={active !== index} className={cn("col-start-1 row-start-1 text-sm leading-relaxed text-muted-foreground transition-opacity duration-300 motion-reduce:transition-none keyboard:transition-none", active === index ? "opacity-100" : "invisible opacity-0")}>{reference.note}</p>)}</div>
      </div>
    </div>
    <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 sm:px-6">
      <span className="text-xs text-muted-foreground">Sample references. Details worth keeping.</span>
      <div className="flex items-center" role="group" aria-label="Choose a reference">
        {references.map((reference,index) => <button key={reference.id} type="button" aria-label={`Show ${reference.title}`} aria-pressed={active === index} onClick={() => setActive(index)} className="grid h-11 w-7 place-items-center"><span className={cn("size-2 rounded-full", active === index ? "bg-brand" : "bg-border")} /></button>)}
        {!reduced && <button type="button" aria-label={playing ? "Pause reference animation" : "Resume reference animation"} onClick={() => setPlaying(value => !value)} className="ml-1 grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-surface hover:text-brand">{playing ? <Pause size={14} /> : <Play size={14} />}</button>}
      </div>
    </figcaption>
  </figure>;
}
