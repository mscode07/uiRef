import { NextResponse } from "next/server";
import { ReferenceInputSchema } from "@/lib/schemas";
import { listReferences, saveReference } from "@/lib/db/references";
export async function GET() {
  try {
    return NextResponse.json(await listReferences());
  } catch {
    return NextResponse.json(
      {
        error:
          "Your references could not be loaded. Check storage configuration and retry.",
      },
      { status: 503 },
    );
  }
}
export async function POST(req: Request) {
  if (
    req.headers.get("origin") &&
    new URL(req.headers.get("origin")!).host !== req.headers.get("host")
  )
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  try {
    const data = ReferenceInputSchema.safeParse(await req.json());
    if (!data.success)
      return NextResponse.json(
        { error: data.error.issues[0].message },
        { status: 400 },
      );
    if (!data.data.url && !data.data.screenshot)
      return NextResponse.json(
        { error: "Add a website URL or screenshot." },
        { status: 400 },
      );
    const now = new Date().toISOString();
    const reference = {
      ...data.data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    await saveReference(reference);
    return NextResponse.json(reference, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error:
          "Reference could not be saved. Your form is preserved; please retry.",
      },
      { status: 500 },
    );
  }
}
