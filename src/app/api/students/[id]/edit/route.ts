import { NextRequest, NextResponse } from "next/server";
import { updateStudent, getStudentById } from "@/lib/students";
import { verifyOTP } from "@/lib/otp";

type ParamsPromise = Promise<{ id: string }>;

export async function PATCH(
  req: NextRequest,
  { params }: { params: ParamsPromise }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const { email, code, ...updates } = body;
    
    // Verify OTP
    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }
    
    // Verify OTP was verified and matches
    const db = await import("@/lib/db").then(m => m.getDb());
    const otp = await db.collection("otps").findOne({
      email,
      code,
      verified: true, // Must be verified first
      studentId: id, // Must match student ID
    });
    
    if (!otp) {
      return NextResponse.json(
        { error: "Invalid verification code. Please verify your code first." },
        { status: 401 }
      );
    }
    
    // Check if OTP was verified recently (within last 30 minutes)
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    
    if (otp.createdAt < thirtyMinutesAgo) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 401 }
      );
    }
    
    // Verify email matches the student
    const student = await getStudentById(id);
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }
    
    if (student.email !== email) {
      return NextResponse.json(
        { error: "Email does not match student record" },
        { status: 403 }
      );
    }
    
    // Update student (exclude status, createdAt from updates)
    const { status, createdAt, ...allowedUpdates } = updates;
    const updated = await updateStudent(id, allowedUpdates);
    
    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update student" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true,
        message: "Your profile has been updated successfully",
        student: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating student", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}
