import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Brand } from "@/components/brand";

export function InfoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1600px] flex-col px-6 md:px-10 xl:px-16">
      <a
        href="#main"
        className="fixed -top-20 left-4 z-50 bg-foreground p-3 text-background focus:top-4"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1 py-16 md:py-24">
        {children}
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-t border-border py-6">
        <Brand className="text-[20px] [&_svg]:h-6 [&_svg]:w-5" />
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-x-6 text-sm text-muted-foreground"
        >
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center hover:text-brand"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center hover:text-brand"
          >
            Contact
          </Link>
          <a
            href="https://x.com/mscode07"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 hover:text-brand"
          >
            @mscode07 on X <ArrowUpRight size={14} />
          </a>
        </nav>
      </footer>
    </div>
  );
}
