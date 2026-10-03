import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookmarkX } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "404 — A missing reference | UIRef" };

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1600px] flex-col px-6 md:px-10 xl:px-16">
      <a href="#missing-page" className="fixed -top-20 left-4 z-50 bg-foreground p-3 text-background focus:top-4">Skip to content</a>
      <SiteHeader />
      <main id="missing-page" className="flex flex-1 flex-col items-center justify-center py-12 md:py-16">
        <div aria-hidden="true" className="relative mb-8 h-[250px] w-full max-w-[760px] overflow-hidden md:mb-12 md:h-[300px]">
          <div className="absolute top-12 left-1/2 w-[230px] -translate-x-[135%] rotate-[-9deg] overflow-hidden rounded-lg opacity-50 md:w-[280px]"><Image src="/references/atelier.png" alt="" width={1448} height={1086} sizes="280px" className="aspect-[4/3] object-cover" /></div>
          <div className="absolute top-12 left-1/2 w-[230px] translate-x-[35%] rotate-[9deg] overflow-hidden rounded-lg opacity-50 md:w-[280px]"><Image src="/references/forma.png" alt="" width={1448} height={1086} sizes="280px" className="aspect-[4/3] object-cover" /></div>
          <div className="absolute top-4 left-1/2 flex h-[224px] w-[200px] -translate-x-1/2 flex-col items-center justify-center rounded-xl border border-dashed border-brand bg-background md:h-[264px] md:w-[240px]">
            <BookmarkX size={24} strokeWidth={1.5} className="text-brand" />
            <span className="mt-3 text-[64px] leading-none font-semibold tracking-[-0.04em] text-foreground md:text-[80px]">404</span>
            <span className="mt-4 text-xs text-muted-foreground">One reference short.</span>
          </div>
        </div>
        <h1 className="max-w-xl text-center text-[30px] leading-tight font-semibold tracking-[-0.03em] text-balance md:text-[40px]">This page slipped<br />out of the collection.</h1>
        <p className="mt-5 max-w-md text-center text-sm leading-relaxed text-muted-foreground">We couldn’t find a page at this address. There’s still plenty of inspiration waiting in your library.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href="/library" className="inline-flex min-h-12 items-center gap-4 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-85">Open your library <ArrowRight size={16} /></Link>
          <Link href="/" className="inline-flex min-h-12 items-center gap-2 text-sm text-muted-foreground hover:text-brand"><ArrowLeft size={16} />Back to home</Link>
        </div>
      </main>
      <footer className="flex flex-wrap justify-between gap-3 border-t border-border py-6 text-xs text-muted-foreground"><span>UIRef · Your visual memory.</span><span>A missing page. A fresh starting point.</span></footer>
    </div>
  );
}
