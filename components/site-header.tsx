"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Brand } from "@/components/brand";

const links = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "References", href: "/#references" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    const media = window.matchMedia("(min-width: 1024px)");
    const resize = () => { if (media.matches) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    media.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      media.removeEventListener("change", resize);
    };
  }, [open]);

  return (
    <header ref={header} className="landing-header sticky top-4 z-40 flex h-16 items-center justify-between gap-3 pt-2 md:top-5 md:h-20">
      <div className="flex min-h-12 items-center rounded-xl bg-background px-3 py-2 shadow-float md:px-4"><Brand className="text-[22px] [&_svg]:h-7 [&_svg]:w-6" /></div>
      <nav aria-label="Main navigation" className="flex items-center gap-1 rounded-full bg-background p-1.5 shadow-float">
        {links.map(link => <Link key={link.href} href={link.href} className="hidden min-h-11 items-center rounded-full px-5 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground lg:inline-flex">{link.label}</Link>)}
        <Link href="/library" className="inline-flex min-h-11 items-center gap-3 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-85 md:px-5">Open library <ArrowRight size={15} className="hidden min-[400px]:block" /></Link>
        <button ref={toggle} type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(value => !value)} className="grid size-11 place-items-center rounded-full text-foreground hover:bg-surface lg:hidden">{open ? <X size={19} /> : <Menu size={19} />}</button>
      </nav>
      {open && <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-20 grid gap-1 rounded-xl bg-background p-3 shadow-dialog lg:hidden" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== toggle.current) setOpen(false); }}>
        {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-between rounded-md px-4 text-sm hover:bg-surface">{link.label}<ArrowRight size={15} /></Link>)}
      </nav>}
    </header>
  );
}
