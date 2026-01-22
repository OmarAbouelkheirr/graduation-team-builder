import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    
    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }
    
    const result = await verifyOTP(email, code);
    
    if (!result.valid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }
    
    // Return a temporary token (in production, use JWT or session)
    // For now, we'll use a simple approach with the studentId
    return NextResponse.json(
      { 
        verified: true,
        studentId: result.studentId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
