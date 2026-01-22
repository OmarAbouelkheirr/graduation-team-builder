import { NextRequest, NextResponse } from "next/server";
import { createOTP, getStudentByEmail } from "@/lib/otp";
import sgMail from "@sendgrid/mail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    // Check if student exists
    const student = await getStudentByEmail(email);
    if (!student) {
      return NextResponse.json(
        { error: "No application found with this email address" },
        { status: 404 }
      );
    }
    
    // Create OTP
    const code = await createOTP(email, student.id);
    
    // Send email via SendGrid
    if (!process.env.SENDGRID_API_KEY) {
      console.error("❌ SENDGRID_API_KEY is not configured in environment variables");
      return NextResponse.json(
        { error: "Email service is not configured. Please add SENDGRID_API_KEY to .env.local" },
        { status: 500 }
      );
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const siteName = process.env.SITE_NAME || "UniConnect";
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "noreply@example.com";
    
    console.log(`📧 Attempting to send OTP email to: ${email}`);
    console.log(`📧 From email: ${fromEmail}`);
    console.log(`📧 OTP Code: ${code}`);
    
    try {
      const msg = {
        to: email,
        from: fromEmail,
        subject: `Your ${siteName} Verification Code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #6366f1;">Verify Your Email</h2>
            <p>You requested to edit your student profile. Use this verification code:</p>
            <div style="background: linear-gradient(to right, #6366f1, #d946ef, #e11d48); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 4px;">${code}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      };
      
      await sgMail.send(msg);
      console.log("✅ Email sent successfully via SendGrid");
    } catch (emailError: unknown) {
      console.error("❌ Error sending email:", emailError);
      const errorMessage = emailError instanceof Error ? emailError.message : "Unknown error";
      const errorDetails = emailError instanceof Error ? JSON.stringify(emailError, null, 2) : String(emailError);
      console.error("❌ Error details:", errorDetails);
      
      return NextResponse.json(
        { 
          error: "Failed to send verification email",
          details: process.env.NODE_ENV === "development" ? errorMessage : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: "Verification code sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
