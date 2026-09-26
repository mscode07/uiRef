import type { Reference } from "./schemas";

export function buildReferencePrompt(reference: Reference) {
  const insight = reference.insights;
  return [
    `Build an interface inspired by the visual design of ${reference.name}.`,
    "Adapt the design language to my product. Preserve the hierarchy, proportions, typography, spacing, color relationships, and component treatment described below. Use original branding, copy, and assets.",
    reference.url
      ? `Source: ${reference.url}`
      : "Source: uploaded screenshot. Attach the saved image alongside this prompt for visual fidelity.",
    `Reference category: ${reference.category}. User-selected density: ${reference.density}.`,
    reference.styles.length
      ? `Style labels: ${reference.styles.join(", ")}.`
      : "",
    insight
      ? `EVIDENCE\n${reference.analysisSource === "vision" ? "AI visual interpretation; estimated values require visual verification." : reference.analysisSource === "measured" ? "Computed browser styles measured at desktop width, with a sampled image palette. These are observations, not a complete visual interpretation." : "Image dimensions and sampled colors only. Layout and typography have not been interpreted; inspect the attached screenshot."}\n${insight.summary}`
      : "This reference has not been analyzed. Inspect the source or attached screenshot before implementing; do not invent design details.",
    insight?.palette.length
      ? `COLOR PALETTE\n${insight.palette.map((p) => `- ${p.role}: ${p.color}`).join("\n")}`
      : "",
    ...(insight?.sections.map(
      (section) =>
        `${section.title.toUpperCase()}\n${section.description}\n${section.values.map((v) => `- ${v.label}: ${v.value}`).join("\n")}`,
    ) || []),
    insight?.principles.length
      ? `DESIGN PRINCIPLES\n${insight.principles.map((p) => `- ${p}`).join("\n")}`
      : "",
    reference.likes ? `WHAT I WANT TO PRESERVE\n${reference.likes}` : "",
    reference.notes ? `MY NOTES\n${reference.notes}` : "",
    `IMPLEMENTATION REQUIREMENTS (recommendations, not observed source behavior)\n- Build semantic, responsive components using the existing project stack; use Tailwind utilities when available.\n- Extract reusable color, type, spacing, border, and radius tokens from the evidence.\n- Match the desktop composition first, then adapt to tablet and mobile without horizontal overflow.\n- Keep keyboard focus visible, controls labeled, text readable, and touch targets usable.\n- Include hover, pressed, loading, empty, and error states where appropriate. Respect reduced motion.\n- Do not invent source animations from a static screenshot. Keep any new feedback brief and purposeful.\n- Compare the rendered result with the reference at desktop and mobile sizes and correct hierarchy, alignment, density, and spacing.`,
    insight?.limitations.length
      ? `KNOWN LIMITATIONS\n${insight.limitations.map((p) => `- ${p}`).join("\n")}`
      : "",
    "Deliver the working interface, not a description. State assumptions where the reference provides no evidence.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
