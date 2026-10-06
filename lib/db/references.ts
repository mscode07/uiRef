import "server-only";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { database } from "./mongodb";
import { ReferenceSchema, type Reference } from "../schemas";
const dir = path.join(process.cwd(), ".data");
const file = path.join(dir, "references.json");
async function readLocal(): Promise<Reference[]> {
  try {
    return ReferenceSchema.array().parse(
      JSON.parse(await readFile(file, "utf8")),
    );
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}
let queue = Promise.resolve();
export async function listReferences() {
  if (process.env.MONGODB_URI)
    return (await database())
      .collection<Reference>("references")
      .find({}, { projection: { _id: 0 } })
      .toArray();
  return readLocal();
}
export async function saveReference(reference: Reference) {
  if (process.env.MONGODB_URI) {
    await (
      await database()
    )
      .collection<Reference>("references")
      .insertOne(reference);
    return;
  }
  const write = queue.then(async () => {
    const refs = await readLocal();
    await mkdir(dir, { recursive: true });
    const tmp = `${file}.${crypto.randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify([reference, ...refs], null, 2));
    await rename(tmp, file);
  });
  queue = write.catch(() => {});
  await write;
}

export async function updateReference(id: string, updates: Partial<Reference>, expectedUpdatedAt?: string) {
  const patch = { ...updates, updatedAt: new Date().toISOString() };
  if (process.env.MONGODB_URI) {
    return (await database())
      .collection<Reference>("references")
      .findOneAndUpdate(
        { id, ...(expectedUpdatedAt ? { updatedAt: expectedUpdatedAt } : {}) },
        {
          $set: Object.fromEntries(
            Object.entries(patch).filter(([, value]) => value !== undefined),
          ),
          $unset: Object.fromEntries(
            Object.entries(patch)
              .filter(([, value]) => value === undefined)
              .map(([key]) => [key, ""]),
          ),
        },
        { returnDocument: "after", projection: { _id: 0 } },
      );
  }
  let result: Reference | null = null;
  const write = queue.then(async () => {
    const refs = await readLocal();
    const index = refs.findIndex((reference) => reference.id === id);
    if (index < 0 || (expectedUpdatedAt && refs[index].updatedAt !== expectedUpdatedAt)) return;
    result = ReferenceSchema.parse({ ...refs[index], ...patch });
    refs[index] = result;
    const tmp = `${file}.${crypto.randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(refs, null, 2));
    await rename(tmp, file);
  });
  queue = write.catch(() => {});
  await write;
  return result as Reference | null;
}

export async function deleteReference(id: string) {
  if (process.env.MONGODB_URI) {
    const result = await (await database()).collection<Reference>("references").deleteOne({ id });
    return result.deletedCount === 1;
  }
  let deleted = false;
  const write = queue.then(async () => {
    const refs = await readLocal();
    const remaining = refs.filter((reference) => reference.id !== id);
    if (remaining.length === refs.length) return;
    const tmp = `${file}.${crypto.randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(remaining, null, 2));
    await rename(tmp, file);
    deleted = true;
  });
  queue = write.catch(() => {});
  await write;
  return deleted;
}
