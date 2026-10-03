"use client";

// Adapted from the supplied Hyperiux Vault Stack Spread component.
// Original: https://vault.hyperiux.com
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const cards = [
  { id: "daylight", alt: "Daylight interface reference", x: -34, y: -27, rotate: -16 },
  { id: "array", alt: "Array interface reference", x: -11, y: -34, rotate: 12 },
  { id: "stackkit", alt: "Stackkit interface reference", x: 13, y: -29, rotate: -8 },
  { id: "lanapark", alt: "Lana Park portfolio reference", x: 35, y: -24, rotate: 18 },
  { id: "nova", alt: "Project management dashboard reference", x: -35, y: 25, rotate: -12 },
  { id: "roam", alt: "Travel editorial reference", x: -13, y: 33, rotate: 9 },
  { id: "forma", alt: "Minimal ecommerce reference", x: 13, y: 28, rotate: -5 },
  { id: "atelier", alt: "Architecture portfolio reference", x: 35, y: 32, rotate: 5 },
];

function SpreadCard({ card, index, progress, small }: { card: (typeof cards)[number]; index: number; progress: MotionValue<number>; small: boolean }) {
  const endX = small ? (index % 2 ? 23 : -23) : card.x;
  const endY = small ? [-40, -40, -24, -24, 24, 24, 40, 40][index] : card.y;
  const left = useTransform(progress, [0, 1], [`${50 + (index % 3 - 1) * 1.5}%`, `${50 + endX}%`]);
  const top = useTransform(progress, [0, 1], [`${50 + (index % 2 ? 1 : -1)}%`, `${50 + endY}%`]);
  const rotate = useTransform(progress, [0, 1], [card.rotate, small ? 0 : (index % 2 ? 2 : -2)]);
  const scale = useTransform(progress, [0, 1], [small ? 1.25 : 1.15, 1]);
  return <motion.div aria-hidden="true" className="absolute aspect-[4/3] w-[32%] overflow-hidden rounded-md bg-surface shadow-float md:w-[22%] md:rounded-lg" style={{ left, top, x: "-50%", y: "-50%", rotate, scale, zIndex: index + 1 }}>
    <Image src={`/references/${card.id}.png`} alt="" width={1448} height={1086} sizes="(max-width: 768px) 32vw, 24vw" className="h-full w-full object-cover object-top" draggable={false} />
  </motion.div>;
}

export default function StackSpread() {
  const wrap = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setSmall(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const progress = useTransform(scrollYProgress, [0, 0.08, 0.8, 1], [0, 0, 1, 1]);
  const opacity = useTransform(progress, [0.4, 0.8], [0, 1]);
  const scale = useTransform(progress, [0.4, 1], [0.9, 1]);
  const hint = useTransform(progress, [0, 0.15], [1, 0]);

  return <section ref={wrap} aria-labelledby="spread-title" className={reduced ? "mt-16 border-t border-border py-12 md:mt-24" : "relative mt-16 h-[220svh] border-t border-border md:mt-24"}>
    {reduced ? <>
      <div className="mx-auto mb-8 max-w-md text-center"><h2 id="spread-title" className="text-[30px] font-semibold tracking-[-0.03em]">Different references.<br />A point of view that’s yours.</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Collect widely. Notice what connects. Bring those ideas into your next interface.</p></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{cards.map(card => <Image key={card.id} src={`/references/${card.id}.png`} alt={card.alt} width={1448} height={1086} sizes="(max-width: 768px) 40vw, 22vw" className="aspect-[4/3] rounded-md object-cover" />)}</div>
    </> : <div className="sticky top-24 h-[calc(100svh-112px)] min-h-[480px] max-h-[760px] overflow-hidden">
      <motion.div style={{ opacity, scale }} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h2 id="spread-title" className="max-w-sm text-[26px] leading-tight font-semibold tracking-[-0.03em] md:max-w-lg md:text-[36px]">Different references.<br /><span className="text-brand">A point of view that’s yours.</span></h2>
        <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-muted-foreground md:max-w-sm">Collect widely. Notice what connects. Bring those ideas into your next interface.</p>
      </motion.div>
      {cards.map((card, index) => <SpreadCard key={card.id} card={card} index={index} progress={progress} small={small} />)}
      <motion.p aria-hidden="true" style={{ opacity: hint }} className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">Scroll to explore the collection <ArrowDown size={14} /></motion.p>
    </div>}
  </section>;
}
