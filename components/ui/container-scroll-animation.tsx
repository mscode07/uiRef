"use client";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

/** Perspective reveal adapted from the supplied ContainerScroll component. */
export function ContainerScroll({ titleComponent, children }: { titleComponent: ReactNode; children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "center center"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [32, 0]);

  return (
    <div ref={containerRef} className="relative py-12 md:py-16">
      <div className="relative mx-auto w-full max-w-5xl [perspective:1000px]">
        <Header translate={translate} reduced={!!reduced} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale} reduced={!!reduced}>{children}</Card>
      </div>
    </div>
  );
}

export function Header({ translate, titleComponent, reduced = false }: { translate: MotionValue<number>; titleComponent: ReactNode; reduced?: boolean }) {
  return <motion.div style={{ translateY: reduced ? 0 : translate }} className="mx-auto mb-12 max-w-2xl text-center">{titleComponent}</motion.div>;
}

export function Card({ rotate, scale, children, reduced = false }: { rotate: MotionValue<number>; scale: MotionValue<number>; children: ReactNode; reduced?: boolean }) {
  return (
    <motion.div style={{ rotateX: reduced ? 0 : rotate, scale: reduced ? 1 : scale }} className="rounded-2xl bg-foreground p-2 shadow-dialog md:p-3">
      <div className="overflow-hidden rounded-lg bg-background">{children}</div>
    </motion.div>
  );
}
