import { cn } from "@/lib/utils";
import Link from "next/link";

/** Two collected frames form a compact visual-reference mark. */
export function Brand({ className }: { className?: string }) {
  return (
    <>
    <Link href="/">
      <span
        className={cn(
          "inline-flex items-center gap-2.5 font-sans text-[25px] leading-none font-bold tracking-[-.04em] text-brand",
          className,
        )}
      >
        <svg
          aria-hidden="true"
          width="29"
          height="32"
          viewBox="0 0 29 32"
          fill="none"
        >
          <path
            d="M19 2H6a3 3 0 0 0-3 3v20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity=".38"
          />
          <path
            d="M10 7h13a3 3 0 0 1 3 3v18a1 1 0 0 1-1.6.8L17 23l-7.4 5.8A1 1 0 0 1 8 28V9a2 2 0 0 1 2-2Z"
            fill="currentColor"
          />
          <path
            d="M13 13h8M13 17h5"
            stroke="var(--background)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span>UIRef</span>
      </span>
    </Link>
    </>
  );
}
