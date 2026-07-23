import { db } from "./db";
import { emailOtps } from "./db/schema";
import { sendEmailDirectly } from "./email";
import { eq, and, desc, gte } from "drizzle-orm";

export async function generateAndSendEmailOTP(email: string): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes("@")) {
    throw new Error("Valid email address is required for OTP verification.");
  }

  const cleanEmail = email.trim().toLowerCase();

  // Generate 6-digit numeric code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 10 minutes expiry
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Save to DB
  await db.insert(emailOtps).values({
    email: cleanEmail,
    code,
    expiresAt,
    isVerified: false,
  });

  // Construct styled HTML email
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background-color: #141210; color: #F3EFEA; border-radius: 16px; border: 1px solid #2D2824;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #D4A373; font-size: 24px; font-weight: bold; margin: 0;">Snepr Security</h1>
        <p style="color: #A69F96; font-size: 13px; margin-top: 4px;">Email Verification Code</p>
      </div>

      <div style="background-color: #1A1714; border: 1px solid #2D2824; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <p style="color: #A69F96; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; margin: 0 0 12px 0;">Your 6-Digit Verification Code</p>
        <div style="font-size: 36px; font-family: monospace; font-weight: bold; letter-spacing: 6px; color: #FFFFFF; background-color: #25211D; padding: 12px 24px; border-radius: 8px; display: inline-block; border: 1px solid #3D352E;">
          ${code}
        </div>
        <p style="color: #8E867E; font-size: 11px; margin-top: 12px;">This code will expire in <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>

      <p style="font-size: 12px; color: #8E867E; text-align: center; margin: 0;">
        If you did not request this verification code, please ignore this email.
      </p>
    </div>
  `;

  await sendEmailDirectly({
    fromIdentity: "Snepr Security <support@snepr.in>",
    recipientType: "single",
    toEmail: cleanEmail,
    subject: `Your Snepr Verification Code: ${code}`,
    body: htmlBody,
  });

  return {
    success: true,
    message: `Verification code sent to ${cleanEmail}`,
  };
}

export async function verifyEmailOTP(email: string, code: string): Promise<boolean> {
  if (!email || !code) return false;

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  const now = new Date();

  // Find latest valid unexpired OTP
  const [record] = await db
    .select()
    .from(emailOtps)
    .where(
      and(
        eq(emailOtps.email, cleanEmail),
        eq(emailOtps.code, cleanCode),
        eq(emailOtps.isVerified, false),
        gte(emailOtps.expiresAt, now)
      )
    )
    .orderBy(desc(emailOtps.createdAt))
    .limit(1);

  if (!record) return false;

  // Mark as verified
  await db
    .update(emailOtps)
    .set({ isVerified: true })
    .where(eq(emailOtps.id, record.id));

  return true;
}
