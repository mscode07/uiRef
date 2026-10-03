"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Mail, MessageSquare } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

function ContactGlobe() {
  const reduced = useReducedMotion();
  const raw = useMotionValue(0);
  const rotateY = useSpring(raw, { stiffness: 70, damping: 24 });
  return <div aria-hidden="true" className="relative mt-10 h-52 overflow-hidden sm:h-64 lg:mt-16 lg:h-80 [perspective:900px] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
    onPointerMove={event => { if (!reduced && event.pointerType === "mouse") { const rect = event.currentTarget.getBoundingClientRect(); raw.set((event.clientX - rect.left) / rect.width * 16 - 8); } }}
    onPointerLeave={() => raw.set(0)}>
    <motion.svg viewBox="0 0 500 500" className="mx-auto w-full max-w-[520px] text-muted-foreground" style={{ rotateY: reduced ? 0 : rotateY }} fill="none">
      <circle cx="250" cy="250" r="222" stroke="currentColor" strokeWidth="1.2" />
      {[65, 135, 195].map(radius => <ellipse key={radius} cx="250" cy="250" rx={radius} ry="222" stroke="currentColor" strokeOpacity=".4" />)}
      {[92, 162, 250, 338, 408].map(y => <ellipse key={y} cx="250" cy={y} rx={Math.sqrt(222 ** 2 - (y - 250) ** 2)} ry="26" stroke="currentColor" strokeOpacity=".4" />)}
      <path d="M72 205 Q255 20 427 205" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 7" />
      <circle cx="72" cy="205" r="5" fill="var(--accent)" />
      <circle cx="427" cy="205" r="5" fill="var(--accent)" />
    </motion.svg>
  </div>;
}

export function ContactExperience() {
  const reduced = useReducedMotion();
  return <div className="mx-auto max-w-6xl">
    <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
      <h1 className="text-[38px] leading-[1.12] font-semibold tracking-[-0.035em] md:text-[52px]">Let’s get in touch.</h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">A question, a fresh idea, or a detail that could be better.<br className="hidden sm:block" /> Share a thought and help shape what UIRef becomes.</p>
    </div>
    <motion.div initial={false} whileInView={{ y: [reduced ? 0 : 16, 0] }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : .65, ease: [.22, 1, .36, 1] }} className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <section aria-labelledby="contact-details-title" className="pt-2">
        <h2 id="contact-details-title" className="text-[26px] font-semibold tracking-[-0.03em]">Get in touch</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Reach out directly or leave a note using the form. Design feedback is always welcome.</p>
        <div className="mt-8 space-y-4">
          <a href="mailto:msabhithakur7777@gmail.com" className="flex min-h-12 items-center gap-4 text-sm text-muted-foreground transition-colors hover:text-foreground"><span className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-surface"><Mail size={18} /></span><span className="break-all">msabhithakur7777@gmail.com</span></a>
          <a href="https://x.com/mscode07" target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-4 text-sm text-muted-foreground transition-colors hover:text-foreground"><span className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-surface"><MessageSquare size={18} /></span>@mscode07 on X <ArrowUpRight size={14} /></a>
        </div>
        <ContactGlobe />
      </section>
      <section aria-labelledby="message-title" className="rounded-xl border border-border bg-surface p-6 sm:p-8 md:p-10">
        <h2 id="message-title" className="text-[26px] font-semibold tracking-[-0.03em]">Leave a message</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Tell me what you’re thinking. Every useful detail helps.</p>
        <div className="my-8 border-t border-dashed border-input" />
        <ContactForm />
      </section>
    </motion.div>
  </div>;
}
