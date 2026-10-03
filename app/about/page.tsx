import type { Metadata } from "next";
import { AboutReferenceStack } from "@/components/about-reference-stack";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import StackSpread from "@/components/ui/stack-spread";
import { InfoLayout } from "@/components/info-layout";

export const metadata: Metadata = {
  title: "About UIRef — A place for a developing eye",
  description:
    "Why UIRef exists: collect interfaces, understand their design, and bring better references to your next build.",
};

export default function AboutPage() {
  return (
    <InfoLayout>
      <section
        aria-labelledby="about-title"
        className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8"
      >
        <div>
          <h1
            id="about-title"
            className="max-w-xl text-[38px] leading-[1.12] font-semibold tracking-[-0.035em] md:text-[52px]"
          >
            Good design deserves
            <br />a better memory.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            UIRef is a personal place for the interfaces you keep coming back
            to. Not just how they look, but what makes them work.
          </p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            A thoughtful layout. A clear hierarchy. A small detail that changes
            the whole page. Keep the reference and the reason it caught your
            eye, together.
          </p>
          <Link
            href="/library"
            className="mt-8 inline-flex min-h-12 items-center gap-4 rounded-md bg-foreground px-5 text-sm font-semibold text-background hover:opacity-85"
          >
            Start your collection <ArrowRight size={16} />
          </Link>
        </div>
        <AboutReferenceStack />
      </section>
      <StackSpread />
      <section
        aria-labelledby="purpose-title"
        className="mt-16 grid gap-8 border-t border-border pt-12 md:mt-24 md:grid-cols-[1fr_2fr] md:gap-16"
      >
        <h2
          id="purpose-title"
          className="text-[26px] font-semibold tracking-[-0.03em]"
        >
          From noticing
          <br />
          to making.
        </h2>
        <div className="space-y-8">
          {[
            [
              "Keep the context.",
              "Save a website or screenshot alongside your notes. Build a collection you can search and return to when a new project needs direction.",
            ],
            [
              "Understand the decisions.",
              "Inspect measured colors, typography, and layout details. Optional AI analysis adds interpretation when a provider is configured.",
            ],
            [
              "Bring your eye to the build.",
              "Copy a reference-based prompt into your coding tool. Adapt the design principles to your own product, with original content and identity.",
            ],
          ].map(([title, text]) => (
            <div key={title} className="grid gap-3 sm:grid-cols-[180px_1fr]">
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
      {/* <section
        aria-labelledby="maker-title"
        className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-border pt-8 md:mt-24"
      >
        <div>
          <h2 id="maker-title" className="text-lg font-semibold">
            Built with a developing eye.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Follow @mscode07, or share a thought about UIRef
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <a
            href="https://x.com/mscode07"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-brand hover:underline"
          >
            Find me on X <ArrowUpRight size={15} />
          </a>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center gap-2 hover:text-brand"
          >
            Get in touch <ArrowRight size={15} />
          </Link>
        </div>
      </section> */}
    </InfoLayout>
  );
}
