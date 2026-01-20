import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "graduation_teams";

if (!uri) {
  throw new Error(
    "MONGODB_URI is not defined in environment variables (.env.local)."
  );
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;

  if (!client) {
    client = new MongoClient(uri);
  }

  if (!client.topology?.isConnected()) {
    await client.connect();
  }

  db = client.db(dbName);
  return db;
}

