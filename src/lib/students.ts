import { ObjectId } from "mongodb";
import { getDb } from "./db";

export type StudentStatus = "pending" | "approved" | "rejected" | "hidden";

export interface Student {
  _id?: ObjectId;
  fullName: string;
  email: string;
  linkedIn: string;
  github?: string;
  portfolio?: string;
  telegram?: string;
  track: string;
  skills: string[];
  bio: string;
  preferences?: string;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentFilters {
  status?: StudentStatus;
  track?: string;
  q?: string;
}

export async function createStudent(input: {
  fullName: string;
  email: string;
  linkedIn: string;
  github?: string;
  portfolio?: string;
  telegram?: string;
  track: string;
  skills: string[];
  bio: string;
  preferences?: string;
}): Promise<Student> {
  const db = await getDb();
  const now = new Date();

  const student: Student = {
    ...input,
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

  const result = await db
    .collection<Student>("students")
    .findOneAndUpdate(
      { _id },
      { $set: { ...updates, updatedAt: new Date() } },
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
