import { getDb } from "./db";
import { ObjectId } from "mongodb";

export interface OTPRecord {
  _id?: ObjectId;
  email: string;
  studentId: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes

export async function createOTP(email: string, studentId: string): Promise<string> {
  const db = await getDb();
  
  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Delete any existing OTPs for this email
  await db.collection<OTPRecord>("otps").deleteMany({
    email,
    verified: false,
  });
  
  // Create new OTP
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);
  
  await db.collection<OTPRecord>("otps").insertOne({
    email,
    studentId,
    code,
    expiresAt,
    verified: false,
    createdAt: new Date(),
  });
  
  return code;
}

export async function verifyOTP(email: string, code: string): Promise<{ valid: boolean; studentId?: string }> {
  const db = await getDb();
  
  const otp = await db.collection<OTPRecord>("otps").findOne({
    email,
    code,
    verified: false,
    expiresAt: { $gt: new Date() },
  });
  
  if (!otp) {
    return { valid: false };
  }
  
  // Mark as verified
  await db.collection<OTPRecord>("otps").updateOne(
    { _id: otp._id },
    { $set: { verified: true } }
  );
  
  // Clean up old OTPs (older than 1 hour)
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  await db.collection<OTPRecord>("otps").deleteMany({
    createdAt: { $lt: oneHourAgo },
  });
  
  return { valid: true, studentId: otp.studentId };
}

export async function getStudentByEmail(email: string): Promise<{ id: string; email: string } | null> {
  const db = await getDb();
  const student = await db.collection("students").findOne({ email });
  
  if (!student) {
    return null;
  }
  
  return {
    id: student._id.toString(),
    email: student.email,
  };
}
