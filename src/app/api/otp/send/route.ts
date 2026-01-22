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
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px 12px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">${siteName}</h1>
                      </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                        <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">You requested to edit your student profile. Use this verification code to continue:</p>
                        
                        <!-- OTP Code Box -->
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
                          <p style="margin: 0 0 12px; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
                          <h1 style="margin: 0; color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</h1>
                        </div>
                        
                        <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 16px; margin: 24px 0;">
                          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                            <strong style="color: #1f2937;">⏱️ Expires in:</strong> 10 minutes<br>
                            <strong style="color: #1f2937;">🔒 Security:</strong> Do not share this code with anyone
                          </p>
                        </div>
                        
                        <p style="margin: 24px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">If you didn't request this verification code, please ignore this email or contact support if you have concerns.</p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; text-align: center; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
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
