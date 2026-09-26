import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/geist";
import "./globals.css";
import { InteractionMode } from "@/components/interaction-mode";
export const metadata: Metadata = {
  title: "UIRef — Your visual memory",
  description: "Your visual memory for building better interfaces.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="pointer-fine:[cursor:var(--cursor-ui)] pointer-fine:[&_button:enabled]:[cursor:var(--cursor-ui)] pointer-fine:[&_a]:[cursor:var(--cursor-ui)] pointer-fine:[&_summary]:[cursor:var(--cursor-ui)]">
        <InteractionMode />
        {children}
      </body>
    </html>
  );
}
