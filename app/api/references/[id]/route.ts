import { NextResponse } from "next/server";
import { deleteReference, listReferences, updateReference } from "@/lib/db/references";
import { ReferenceInputSchema, type Reference } from "@/lib/schemas";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
function allowed(request: Request) {
  const origin = request.headers.get("origin");
  try { return !origin || new URL(origin).host === request.headers.get("host"); }
  catch { return false; }
}
export async function PATCH(request: Request, { params }: Context) {
  if (!allowed(request)) return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return NextResponse.json({ error: "Reference not found." }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Send valid reference details." }, { status: 400 }); }
  const parsed = ReferenceInputSchema.partial().strict().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  try {
    const existing = (await listReferences()).find((item) => item.id === id);
    if (!existing) return NextResponse.json({ error: "Reference not found." }, { status: 404 });
    // Zod defaults must not replace fields omitted from a partial edit.
    const patch: Partial<Reference> = Object.fromEntries(
      Object.entries(parsed.data).filter(([key]) => Object.hasOwn(body as object, key)),
    );
    const urlChanged = patch.url !== undefined && patch.url !== existing.url;
    const imageChanged = patch.screenshot !== undefined && patch.screenshot !== existing.screenshot;
    if (urlChanged || imageChanged) {
      Object.assign(patch, { insights: undefined, designEvidence: undefined, analysisSource: undefined,
        analyzedAt: undefined, analysisError: undefined, captureError: undefined, capturedAt: undefined });
      // A generated capture belongs to its original URL; user-uploaded images can remain.
      if (urlChanged && existing.capturedAt && !imageChanged) patch.screenshot = undefined;
    }
    const merged = { ...existing, ...patch };
    if (!merged.url && !merged.screenshot) return NextResponse.json({ error: "Add a website URL or screenshot." }, { status: 400 });
    const updated = await updateReference(id, patch, existing.updatedAt);
    if (!updated) return NextResponse.json({ error: "This reference changed while saving. Reopen it and retry." }, { status: 409 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Changes could not be saved. Your form is preserved; please retry." }, { status: 503 });
  }
}
export async function DELETE(request: Request, { params }: Context) {
  if (!allowed(request)) return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return NextResponse.json({ error: "Reference not found." }, { status: 404 });
  try {
    if (!await deleteReference(id)) return NextResponse.json({ error: "Reference not found." }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Reference could not be deleted. Please retry." }, { status: 503 });
  }
}
