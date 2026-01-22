import { NextRequest, NextResponse } from "next/server";
import {
  createStudent,
  listStudents,
  StudentStatus,
} from "@/lib/students";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const status = (searchParams.get("status") as StudentStatus | null) ?? "approved";
  const track = searchParams.get("track") || undefined;
  const q = searchParams.get("q") || undefined;

  try {
    const students = await listStudents({
      status,
      track,
      q,
    });

    // لا نعيد الإيميل في الصفحة العامة كحماية بسيطة
    const sanitized = students.map((s) => ({
      id: s._id?.toString(),
      fullName: s.fullName,
      track: s.track,
      skills: s.skills,
      bio: s.bio,
      linkedIn: s.linkedIn,
      github: s.github,
      portfolio: s.portfolio,
      telegram: s.telegram,
      avatar: s.avatar,
      featured: s.featured,
      status: s.status,
      createdAt: s.createdAt,
    }));

    // Sort: featured students first
    const sorted = sanitized.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    return NextResponse.json(sorted, { status: 200 });
  } catch (error) {
    console.error("Error listing students", error);
    return NextResponse.json(
      { error: "Failed to list students" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      linkedIn,
      github,
      portfolio,
      telegram,
      track,
      skills,
      bio,
      avatar,
    } = body ?? {};

    if (
      !fullName ||
      !email ||
      !linkedIn ||
      !telegram ||
      !track ||
      !Array.isArray(skills) ||
      !bio
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { getDb } = await import("@/lib/db");
    const db = await getDb();
    const existingStudent = await db.collection("students").findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "This email is already registered. Please use a different email address." },
        { status: 409 }
      );
    }

    const student = await createStudent({
      fullName,
      email: email.toLowerCase().trim(),
      linkedIn,
      github,
      portfolio,
      telegram,
      track,
      skills,
      bio,
      avatar,
    });

    return NextResponse.json(
      { id: student._id?.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}

