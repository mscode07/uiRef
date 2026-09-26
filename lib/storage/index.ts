import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
export interface StorageProvider {
  put(bytes: Uint8Array, extension: string): Promise<string>;
  get(key: string): Promise<Buffer>;
}
const root = path.join(process.cwd(), ".data", "uploads");
export const storage: StorageProvider = {
  async put(bytes, extension) {
    await mkdir(root, { recursive: true });
    const key = `${crypto.randomUUID()}.${extension}`;
    await writeFile(path.join(root, key), bytes);
    return `/api/uploads/${key}`;
  },
  async get(key) {
    if (!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(key))
      throw new Error("Invalid file");
    return readFile(path.join(root, key));
  },
};
export function imageType(b: Uint8Array) {
  if (b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71) return "png";
  if (b[0] === 255 && b[1] === 216 && b[2] === 255) return "jpg";
  if (
    Buffer.from(b.slice(0, 4)).toString() === "RIFF" &&
    Buffer.from(b.slice(8, 12)).toString() === "WEBP"
  )
    return "webp";
  return null;
}
