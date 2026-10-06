import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { GridFSBucket } from "mongodb";
import { database } from "../db/mongodb";
export interface StorageProvider {
  put(bytes: Uint8Array, extension: string): Promise<string>;
  get(key: string): Promise<Buffer>;
}
const root = path.join(process.cwd(), ".data", "uploads");
export const storage: StorageProvider = {
  async put(bytes, extension) {
    if (!["png", "jpg", "webp"].includes(extension)) throw new Error("Invalid image type");
    const key = `${crypto.randomUUID()}.${extension}`;
    if (process.env.MONGODB_URI) {
      const bucket = new GridFSBucket(await database(), { bucketName: "screenshots" });
      await new Promise<void>((resolve, reject) => {
        const upload = bucket.openUploadStream(key);
        upload.once("finish", resolve);
        upload.once("error", reject);
        upload.end(Buffer.from(bytes));
      });
    } else {
      if (process.env.VERCEL) throw new Error("Configure MongoDB to store screenshots on Vercel.");
      await mkdir(root, { recursive: true });
      await writeFile(path.join(root, key), bytes);
    }
    return `/api/uploads/${key}`;
  },
  async get(key) {
    if (!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(key))
      throw new Error("Invalid file");
    if (process.env.MONGODB_URI) {
      const bucket = new GridFSBucket(await database(), { bucketName: "screenshots" });
      const chunks: Buffer[] = [];
      for await (const chunk of bucket.openDownloadStreamByName(key)) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }
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
