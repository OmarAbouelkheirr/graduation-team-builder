import { ObjectId } from "mongodb";
import { getDb } from "./db";

export type StudentStatus = "pending" | "approved" | "rejected" | "hidden";

export interface Student {
  _id?: ObjectId;
  fullName: string;
  email: string;
  linkedIn: string;
  github: string;
  portfolio?: string;
  telegram?: string;
  track: string;
  skills: string[];
  bio: string;
  avatar?: string;
  preferences?: string;
  status: StudentStatus;
  featured?: boolean;
  special?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentFilters {
  status?: StudentStatus;
  track?: string;
  q?: string;
}

// Extract Telegram username from link or username
function extractTelegramUsername(input?: string): string | undefined {
  if (!input) return undefined;
  
  let cleaned = input.trim();
  
  // Remove protocol (https://, http://)
  cleaned = cleaned.replace(/^https?:\/\//i, "");
  
  // Remove t.me/ prefix
  cleaned = cleaned.replace(/^t\.me\//i, "");
  
  // Remove @ symbol if present
  cleaned = cleaned.replace(/^@/, "");
  
  // Remove trailing slash and any query parameters
  cleaned = cleaned.split("/")[0].split("?")[0];
  
  return cleaned || undefined;
}

export async function createStudent(input: {
  fullName: string;
  email: string;
  linkedIn: string;
  github: string;
  portfolio?: string;
  telegram?: string;
  track: string;
  skills: string[];
  bio: string;
  avatar?: string;
  preferences?: string;
}): Promise<Student> {
  const db = await getDb();
  const now = new Date();

  const student: Student = {
    ...input,
    telegram: extractTelegramUsername(input.telegram),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<Student>("students").insertOne(student);
  return { ...student, _id: result.insertedId };
}

export async function listStudents(filters: StudentFilters = {}): Promise<Student[]> {
  const db = await getDb();
  const query: Record<string, unknown> = {};

  if (filters.status) query.status = filters.status;
  if (filters.track) query.track = filters.track;

  if (filters.q) {
    const regex = new RegExp(filters.q, "i");
    query.$or = [
      { fullName: regex },
      { skills: regex },
      { bio: regex },
    ];
  }

  const students = await db
    .collection<Student>("students")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return students;
}

export async function getStudentById(id: string): Promise<Student | null> {
  const db = await getDb();
  const _id = new ObjectId(id);
  return db.collection<Student>("students").findOne({ _id });
}

export async function updateStudent(
  id: string,
  updates: Partial<Omit<Student, "_id" | "createdAt">>
): Promise<Student | null> {
  const db = await getDb();
  const _id = new ObjectId(id);

  // Clean telegram username if provided
  const cleanedUpdates = {
    ...updates,
    ...(updates.telegram !== undefined && { telegram: extractTelegramUsername(updates.telegram) }),
  };

  const result = await db
    .collection<Student>("students")
    .findOneAndUpdate(
      { _id },
      { $set: { ...cleanedUpdates, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

  return result;
}

export async function updateStudentStatus(
  id: string,
  status: StudentStatus
): Promise<Student | null> {
  return updateStudent(id, { status });
}

export async function deleteStudent(id: string): Promise<boolean> {
  const db = await getDb();
  const _id = new ObjectId(id);
  
  const result = await db.collection<Student>("students").deleteOne({ _id });
  return result.deletedCount === 1;
}
