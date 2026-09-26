import { storage } from "@/lib/storage";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params;
    const bytes = await storage.get(key);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": key.endsWith("png")
          ? "image/png"
          : key.endsWith("webp")
            ? "image/webp"
            : "image/jpeg",
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
