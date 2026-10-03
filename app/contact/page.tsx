import type { Metadata } from "next";
import { InfoLayout } from "@/components/info-layout";
import { ContactExperience } from "@/components/contact-experience";

export const metadata: Metadata = { title: "Contact UIRef — Let’s compare notes", description: "Share feedback, ask a question, or talk design with the maker of UIRef." };

export default function ContactPage() {
  return <InfoLayout><ContactExperience /></InfoLayout>;
}
