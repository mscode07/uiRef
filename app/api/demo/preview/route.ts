import { NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import { captureWebsiteInMemory } from "@/lib/capture/website";
import { publicTarget } from "@/lib/capture/network";
import { imageEvidence, measuredInsights } from "@/lib/ai/insights";
import { buildReferencePrompt } from "@/lib/reference-prompt";
import { ReferenceInputSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;
const input = z.object({ url: z.string().trim().max(2048).url() });
let active = 0;
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== (request.headers.get("host") || new URL(request.url).host))
        return NextResponse.json({ error: "Origin not allowed." }, { status: 403, headers });
    } catch {
      return NextResponse.json({ error: "Origin not allowed." }, { status: 403, headers });
    }
  }
  let url: string;
  try {
    const parsed = input.safeParse(await request.json());
    if (!parsed.success) throw new Error("Invalid URL");
    await publicTarget(parsed.data.url);
    url = parsed.data.url;
  } catch {
    return NextResponse.json({ error: "Enter a public http or https website URL. Private addresses and custom ports are not supported." }, { status: 400, headers });
  }
  if (active >= 2)
    return NextResponse.json({ error: "The preview is busy. Please try again in a moment." }, { status: 429, headers });
  active++;
  try {
    const capture = await captureWebsiteInMemory(url);
    const insights = measuredInsights(capture.evidence, await imageEvidence(capture.bytes));
    const name = capture.evidence.title.trim().slice(0, 100) || new URL(url).hostname;
    const now = new Date().toISOString();
    const reference = {
      ...ReferenceInputSchema.parse({ name, url }),
      id: "temporary-preview", createdAt: now, updatedAt: now,
      insights, analysisSource: "measured" as const,
    };
    const image = await sharp(capture.bytes).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    return NextResponse.json({
      name, url, insights,
      screenshot: `data:image/webp;base64,${image.toString("base64")}`,
      prompt: buildReferencePrompt(reference),
    }, { headers });
  } catch {
    return NextResponse.json({ error: "This website could not be previewed. It may block automated captures or be unavailable. Try another public URL." }, { status: 502, headers });
  } finally {
    active--;
  }
}
