import { NextRequest, NextResponse } from "next/server";
import {
  getStudentById,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  StudentStatus,
} from "@/lib/students";
import { assertAdminAuthorized } from "@/lib/adminAuth";

type ParamsPromise = Promise<{ id: string }>;

export async function PATCH(
  req: NextRequest,
  { params }: { params: ParamsPromise }
) {
  const auth = assertAdminAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    // إذا تم إرسال status فقط، نستخدم دالة خاصة
    if (body.status) {
      const status = body.status as StudentStatus;
      if (!["pending", "approved", "rejected", "hidden"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      const updated = await updateStudentStatus(id, status);
      return NextResponse.json(updated, { status: 200 });
    }

    const updated = await updateStudent(id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating student", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: ParamsPromise }
) {
  try {
    const { id } = await params;
    const student = await getStudentById(id);
    if (!student) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error("Error fetching student", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: ParamsPromise }
) {
  const auth = assertAdminAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const deleted = await deleteStudent(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting student", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}

