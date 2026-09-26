import { z } from "zod";
export const categories = [
  "Landing Page",
  "Dashboard",
  "Pricing",
  "Authentication",
  "Settings",
  "Analytics",
  "Portfolio",
  "E-commerce",
  "Blog",
  "Onboarding",
  "Other",
] as const;
export const styles = [
  "Minimal",
  "Editorial",
  "Brutalist",
  "Swiss",
  "Playful",
  "Corporate",
  "Developer",
  "Retro",
  "Futuristic",
  "Dark",
  "Light",
  "Monochrome",
  "Colorful",
] as const;
export const densities = ["Sparse", "Balanced", "Dense"] as const;
const detail = z.object({
  description: z.string(),
  values: z.record(z.string(), z.string()).default({}),
});
export const DesignAnalysisSchema = z.object({
  category: z.enum(categories),
  styles: z.array(z.string()),
  colors: z.object({
    background: z.string(),
    surface: z.string(),
    primaryText: z.string(),
    secondaryText: z.string(),
    border: z.string(),
    accent: z.string(),
    secondaryAccent: z.string().optional(),
  }),
  typography: detail,
  spacing: detail,
  layout: detail,
  components: z.record(z.string(), detail),
  personality: z.array(z.string()).min(3).max(6),
  principles: z.array(z.string()),
  antiPatterns: z.array(z.string()),
});
export const ReferenceInputSchema = z.object({
  name: z.string().trim().min(1, "Give this reference a name.").max(100),
  url: z
    .union([
      z.literal(""),
      z
        .url()
        .refine((v) => /^https?:\/\//.test(v), "Use an http or https URL."),
    ])
    .default(""),
  notes: z.string().max(2000).default(""),
  likes: z.string().max(2000).default(""),
  category: z.enum(categories).default("Other"),
  styles: z.array(z.string().max(40)).max(20).default([]),
  tags: z.array(z.string().max(40)).max(20).default([]),
  density: z.enum(densities).default("Balanced"),
  screenshot: z
    .string()
    .regex(
      /^\/(?:api\/uploads\/[a-f0-9-]+\.(?:png|jpg|webp)|references\/[a-z]+\.png)$/,
    )
    .optional(),
});
export const ReferenceInsightsSchema = z.object({
  summary: z.string().min(1).max(1600),
  sections: z
    .array(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1).max(2400),
        values: z
          .array(
            z.object({
              label: z.string().max(100),
              value: z.string().max(600),
            }),
          )
          .max(16),
      }),
    )
    .min(1)
    .max(12),
  palette: z
    .array(
      z.object({
        color: z.string().regex(/^#[a-fA-F0-9]{6}$/),
        role: z.string().max(100),
      }),
    )
    .max(10),
  principles: z.array(z.string().max(1000)).max(12),
  limitations: z.array(z.string().max(600)).max(10),
});
export type ReferenceInsights = z.infer<typeof ReferenceInsightsSchema>;
export const ReferenceSchema = ReferenceInputSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  analysis: DesignAnalysisSchema.optional(),
  insights: ReferenceInsightsSchema.optional(),
  analysisSource: z.enum(["vision", "measured", "image"]).optional(),
  analysisError: z.string().optional(),
  captureError: z.string().optional(),
  capturedAt: z.string().optional(),
  analyzedAt: z.string().optional(),
  designEvidence: z.string().max(80000).optional(),
  sample: z.boolean().optional(),
});
export type Reference = z.infer<typeof ReferenceSchema>;
export const DesignBriefSchema = z.object({
  philosophy: z.string(),
  personality: z.array(z.string()),
  layout: detail,
  typography: detail,
  colors: z.record(z.string(), z.string()),
  spacing: z.array(z.number()),
  borders: detail,
  radii: z.array(z.number()),
  shadows: detail,
  components: z.record(z.string(), detail),
  responsiveRules: z.array(z.string()),
  interactionRules: z.array(z.string()),
  do: z.array(z.string()),
  dont: z.array(z.string()),
});
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  productType: z.string(),
  references: z.array(z.string()),
  designMapping: z.object({
    primary: z.string().optional(),
    navigation: z.string().optional(),
    typography: z.string().optional(),
    colors: z.string().optional(),
    layout: z.string().optional(),
    cards: z.string().optional(),
    forms: z.string().optional(),
    tables: z.string().optional(),
    interactions: z.string().optional(),
  }),
  generatedBrief: DesignBriefSchema.optional(),
  generatedPrompt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const ComparisonAnalysisSchema = z.object({
  layout: z.array(z.string()),
  typography: z.array(z.string()),
  spacing: z.array(z.string()),
  colors: z.array(z.string()),
  components: z.array(z.string()),
  hierarchy: z.array(z.string()),
  recommendations: z.array(
    z.object({
      priority: z.enum(["high", "medium", "low"]),
      change: z.string(),
      reason: z.string(),
    }),
  ),
});
export const ComparisonSchema = z.object({
  id: z.string(),
  projectId: z.string().optional(),
  referenceScreenshot: z.string(),
  implementationScreenshot: z.string(),
  analysis: ComparisonAnalysisSchema,
  fixPrompt: z.string(),
  createdAt: z.string(),
});
