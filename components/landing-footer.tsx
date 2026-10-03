import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUp, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";

type Sample = { id: string; name: string; category: string };
const samples: Sample[] = [
  {
    id: "atelier",
    name: "Architectural studio homepage",
    category: "Portfolio · Editorial",
  },
  {
    id: "nova",
    name: "Project management dashboard",
    category: "Dashboard · Developer",
  },
  { id: "roam", name: "Travel editorial", category: "Blog · Editorial" },
];
const linkStyle =
  "inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-brand";

export function LandingFooter({
  onPreview,
}: {
  onPreview: (sample: Sample) => void;
}) {
  return (
    <footer
      className="landing-footer border-t border-border pt-12 md:pt-16"
      aria-label="UIRef footer"
    >
      <div className="grid items-center gap-10 pb-12 md:grid-cols-[1.3fr_1fr] md:gap-16 md:pb-16">
        <div>
          <h2 className="max-w-md text-[28px] leading-tight font-semibold tracking-[-0.03em] md:text-[32px]">
            Keep your next good idea
            <br />
            within reach.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            A layout worth studying. A detail worth keeping. Give the interfaces
            that inspire you a place to live.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/library"
              className="inline-flex min-h-12 items-center gap-4 rounded-md bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85"
            >
              Open your library <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex min-h-11 items-center text-sm underline decoration-brand underline-offset-4 hover:text-brand"
            >
              Try a reference first
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPreview(samples[2])}
          aria-label="Preview travel editorial reference"
          className="group relative mx-auto block aspect-[4/3] w-full max-w-[280px] rounded-lg outline-offset-8 md:mr-8 md:max-w-[320px]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rotate-[-7deg] overflow-hidden rounded-lg bg-surface"
          >
            <Image
              src="/references/atelier.png"
              alt=""
              width={1448}
              height={1086}
              sizes="320px"
              className="h-full w-full object-cover"
            />
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 rotate-[5deg] overflow-hidden rounded-lg bg-surface"
          >
            <Image
              src="/references/forma.png"
              alt=""
              width={1448}
              height={1086}
              sizes="320px"
              className="h-full w-full object-cover"
            />
          </span>
          <span className="relative block overflow-hidden rounded-lg shadow-float transition-transform duration-200 pointer-fine:group-hover:-translate-y-1 motion-reduce:transform-none">
            <Image
              src="/references/roam.png"
              alt="Travel editorial design with a mountain landscape"
              width={1448}
              height={1086}
              sizes="320px"
              className="h-full w-full object-cover"
            />
          </span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-8 py-8 md:grid-cols-[1.5fr_1fr_1fr] md:gap-16 md:pb-12">
        <div className="col-span-2 md:col-span-1">
          <Brand />
          <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
            Your visual memory for building better interfaces.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Collect with curiosity. Build with intention.
          </p>
          <a
            href="https://x.com/mscode07"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-brand"
          >
            @mscode07 on X <ArrowUpRight size={14} />
          </a>
        </div>
        <nav aria-label="Footer navigation">
          <h3 className="mb-3 text-sm font-semibold">Explore UIRef</h3>
          <ul>
            <li>
              <Link href="/about" className={linkStyle}>
                About UIRef
              </Link>
            </li>
            <li>
              <Link href="/contact" className={linkStyle}>
                Contact
              </Link>
            </li>
            <li>
              <Link href="/library" className={linkStyle}>
                Your library
              </Link>
            </li>
            <li>
              <a href="#how-it-works" className={linkStyle}>
                How it works
              </a>
            </li>
            <li>
              <a href="#references" className={linkStyle}>
                Browse references
              </a>
            </li>
          </ul>
        </nav>
        <div>
          <h3 className="mb-3 text-sm font-semibold">A little inspiration</h3>
          <ul>
            {samples.map((sample, index) => (
              <li key={sample.id}>
                <button
                  type="button"
                  className={linkStyle}
                  onClick={() => onPreview(sample)}
                >
                  {
                    [
                      "Editorial portfolios",
                      "Product dashboards",
                      "Travel & storytelling",
                    ][index]
                  }
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-border py-5 text-xs text-muted-foreground">
        <p>© 2026 UIRef. A personal place for a developing eye.</p>
        <a
          href="#main"
          className="inline-flex min-h-11 items-center gap-2 hover:text-brand"
        >
          Back to top <ArrowUp size={14} />
        </a>
      </div>
    </footer>
  );
}
