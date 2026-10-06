import { NextResponse } from "next/server";
import { listReferences, updateReference } from "@/lib/db/references";
import { captureWebsite, type WebsiteEvidence } from "@/lib/capture/website";
import {
  imageEvidence,
  measuredInsights,
  readScreenshot,
  visionInsights,
} from "@/lib/ai/insights";
import type { Reference } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 150;
const pending = new Map<string, Promise<Reference | null>>();

async function processReference(reference: Reference, refreshCapture = false) {
  let current = { ...reference };
  let revision = reference.updatedAt;
  async function persist(updates: Partial<Reference>) {
    const saved = await updateReference(reference.id, updates, revision);
    if (!saved) throw new Error("Reference changed or was deleted during processing.");
    revision = saved.updatedAt;
    return saved;
  }
  let evidence: WebsiteEvidence | undefined = current.designEvidence
    ? JSON.parse(current.designEvidence)
    : undefined;
  if (
    current.url &&
    (!current.screenshot || (refreshCapture && current.capturedAt))
  ) {
    try {
      const capture = await captureWebsite(current.url);
      evidence = capture.evidence;
      current = {
        ...current,
        insights: undefined,
        analysisSource: undefined,
        screenshot: capture.screenshot,
        capturedAt: new Date().toISOString(),
        captureError: "",
        designEvidence: JSON.stringify(evidence),
      };
      await persist(current);
    } catch (error) {
      console.error(
        "Reference capture failed:",
        error instanceof Error ? error.message : "Unknown capture error",
      );
      return persist({
        captureError:
          "This website could not be captured. It may block automated previews or be unavailable. Retry, or save a screenshot of the page instead.",
      });
    }
  }
  if (!current.screenshot)
    return persist({
      analysisError: "Add a screenshot or public website URL before analyzing.",
    });
  try {
    const bytes = await readScreenshot(current.screenshot);
    const image = await imageEvidence(bytes);
    if (!current.insights || current.analysisSource !== "vision") {
      current = {
        ...current,
        insights: measuredInsights(evidence, image),
        analysisSource: evidence ? "measured" : "image",
        analyzedAt: new Date().toISOString(),
      };
      await persist(current);
    }
    try {
      const insights = await visionInsights(current, bytes, evidence);
      return persist({
        insights,
        analysisSource: "vision",
        analysisError: "",
        capturedAt: current.capturedAt,
        analyzedAt: new Date().toISOString(),
      });
    } catch (error) {
      const message =
        error instanceof Error &&
        /^(Connect a vision|The vision API|Vision analysis)/.test(error.message)
          ? error.message
          : "Vision analysis returned an incomplete result. Your preview and existing details are saved; try Analyze again.";
      return persist({ analysisError: message });
    }
  } catch {
    return persist({
      analysisError:
        "The saved image could not be read. Try saving a PNG, JPEG, or WebP screenshot again.",
    });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (
    request.headers.get("origin") &&
    new URL(request.headers.get("origin")!).host !== request.headers.get("host")
  )
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id))
    return NextResponse.json(
      { error: "Reference not found." },
      { status: 404 },
    );
  try {
    const existing = pending.get(id);
    if (existing) return NextResponse.json(await existing);
    if (pending.size >= 2)
      return NextResponse.json(
        { error: "Two references are already processing. Retry in a moment." },
        { status: 429 },
      );
    const reference = (await listReferences()).find((item) => item.id === id);
    if (!reference)
      return NextResponse.json(
        { error: "Reference not found." },
        { status: 404 },
      );
    // Recheck after the storage await so concurrent arrivals share one job.
    const concurrent = pending.get(id);
    if (concurrent) return NextResponse.json(await concurrent);
    if (pending.size >= 2)
      return NextResponse.json(
        { error: "Two references are already processing. Retry in a moment." },
        { status: 429 },
      );
    const task = processReference(
      reference,
      request.headers.get("x-refresh-capture") === "true",
    );
    pending.set(id, task);
    try {
      return NextResponse.json(await task);
    } finally {
      pending.delete(id);
    }
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not process this reference. Your saved reference is unchanged; please retry.",
      },
      { status: 500 },
    );
  }
}
