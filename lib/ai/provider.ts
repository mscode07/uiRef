import "server-only";
import { z } from "zod";
import {
  DesignAnalysisSchema,
  DesignBriefSchema,
  ComparisonAnalysisSchema,
} from "../schemas";
export interface AIProvider {
  generate(input: {
    task: "analyze" | "brief" | "compare";
    instructions: string;
    images: string[];
  }): Promise<unknown>;
}
export async function analyzeDesign(
  provider: AIProvider,
  images: string[],
  subjectiveNote: string,
) {
  return DesignAnalysisSchema.parse(
    await provider.generate({
      task: "analyze",
      images,
      instructions: `Extract observable design principles. Values are estimates; do not claim exact fonts. Prioritize this user's preferences: ${subjectiveNote}`,
    }),
  );
}
export async function generateDesignBrief(
  provider: AIProvider,
  input: unknown,
) {
  return DesignBriefSchema.parse(
    await provider.generate({
      task: "brief",
      images: [],
      instructions: `Resolve conflicts into one coherent system with measurable tokens. Input: ${JSON.stringify(input)}`,
    }),
  );
}
export async function compareDesign(
  provider: AIProvider,
  images: [string, string],
) {
  return ComparisonAnalysisSchema.parse(
    await provider.generate({
      task: "compare",
      images,
      instructions:
        "Compare reference first and implementation second. Distinguish estimates from measurements; give concrete prioritized fixes.",
    }),
  );
}
export type DesignAnalysis = z.infer<typeof DesignAnalysisSchema>;
