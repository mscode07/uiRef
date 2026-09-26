import "server-only";
import { MongoClient } from "mongodb";
const cached = globalThis as unknown as {
  mongoConnection?: Promise<MongoClient>;
};
export async function database() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MongoDB is not configured.");
  if (!cached.mongoConnection)
    cached.mongoConnection = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    })
      .connect()
      .catch((e) => {
        cached.mongoConnection = undefined;
        throw e;
      });
  return (await cached.mongoConnection).db(
    process.env.MONGODB_DB || "designforme",
  );
}
