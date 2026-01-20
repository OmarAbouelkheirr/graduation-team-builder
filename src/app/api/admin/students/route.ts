import { NextRequest, NextResponse } from "next/server";
import { listStudents } from "@/lib/students";
import { assertAdminAuthorized } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = assertAdminAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  try {
    const students = await listStudents({
      status: status as never,
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error listing admin students", error);
    return NextResponse.json(
      { error: "Failed to list students for admin" },
      { status: 500 }
    );
  }
}

