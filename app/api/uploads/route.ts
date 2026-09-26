import sharp from "sharp";
import { NextResponse } from "next/server";
import { imageType, storage } from "@/lib/storage";
export async function POST(req: Request) {
  if (
    req.headers.get("origin") &&
    new URL(req.headers.get("origin")!).host !== req.headers.get("host")
  )
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  if (Number(req.headers.get("content-length")) > 11 * 1024 * 1024)
    return NextResponse.json(
      { error: "Choose an image smaller than 10 MB." },
      { status: 413 },
    );
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File) || file.size > 10 * 1024 * 1024)
      return NextResponse.json(
        { error: "Choose a PNG, JPEG or WebP image smaller than 10 MB." },
        { status: 400 },
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = imageType(bytes);
    if (!extension)
      return NextResponse.json(
        { error: "This file is not a PNG, JPEG or WebP image." },
        { status: 400 },
      );
    try {
      await sharp(bytes, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize(1, 1)
        .toBuffer();
    } catch {
      return NextResponse.json(
        {
          error:
            "This image is damaged or too large to decode. Choose a valid screenshot under 40 megapixels.",
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ url: await storage.put(bytes, extension) });
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
