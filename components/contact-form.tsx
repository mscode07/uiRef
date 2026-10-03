"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
const field = "mt-2 min-h-12 w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
export function ContactForm() {
  const [prepared, setPrepared] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    const email = String(data.get("email")).trim();
    const company = String(data.get("company") || "").trim();
    const message = String(data.get("message")).trim();
    const messageField = event.currentTarget.elements.namedItem("message") as HTMLTextAreaElement;
    if (message.length < 5) {
      messageField.setCustomValidity("Please write a message of at least 5 characters.");
      messageField.reportValidity();
      return;
    }
    const subject = encodeURIComponent(`UIRef — a message from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply to: ${email}${company ? `\nCompany: ${company}` : ""}`);
    window.location.href = `mailto:msabhithakur7777@gmail.com?subject=${subject}&body=${body}`;
    setPrepared(true);
  }
  return <form onSubmit={submit} onChange={event => { setPrepared(false); if (event.target instanceof HTMLTextAreaElement) event.target.setCustomValidity(""); }} className="space-y-6">
    <div className="grid gap-6 sm:grid-cols-2">
      <label className="block text-sm font-medium" htmlFor="contact-name">Your name<input id="contact-name" name="name" autoComplete="name" required maxLength={100} pattern=".*\S.*" className={field} placeholder="Your name" /></label>
      <label className="block text-sm font-medium" htmlFor="contact-company">Company <span className="text-xs font-normal text-muted-foreground">(optional)</span><input id="contact-company" name="company" autoComplete="organization" maxLength={100} className={field} placeholder="Your company" /></label>
    </div>
    <label className="block text-sm font-medium" htmlFor="contact-email">Email address<input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} className={field} placeholder="you@example.com" /></label>
    <label className="block text-sm font-medium" htmlFor="contact-message">What’s on your mind?<textarea id="contact-message" name="message" required minLength={5} maxLength={2000} rows={6} className={`${field} resize-y`} placeholder="An idea, a question, or something that could work better…" /></label>
    <p id="contact-delivery" className="text-xs leading-relaxed text-muted-foreground">This form opens a draft in your email app. Review it and press Send there. Your message isn’t stored on this site.</p>
    <button type="submit" aria-describedby="contact-delivery" className="inline-flex min-h-12 items-center gap-4 rounded-md bg-foreground px-5 text-sm font-semibold text-background hover:opacity-85">Open email draft <ArrowUpRight size={16} /></button>
    {prepared && <p role="status" className="text-sm leading-relaxed text-muted-foreground">Your draft is ready for your email app. If nothing opened, email <a href="mailto:msabhithakur7777@gmail.com" className="break-all text-brand underline underline-offset-4">msabhithakur7777@gmail.com</a> directly. Your message is still here to copy.</p>}
  </form>;
}
