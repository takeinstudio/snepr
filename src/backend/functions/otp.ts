import { createServerFn } from "@tanstack/react-start";
import { generateAndSendEmailOTP, verifyEmailOTP } from "../otp";
import { db } from "../db";
import { salons, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

// ─── Send Email OTP Server Function ───────────────────────────────────────────
export const sendOtp = createServerFn({ method: "POST" })
  .validator((d: { email: string }) => d)
  .handler(async ({ data }) => {
    return generateAndSendEmailOTP(data.email);
  });

// ─── Verify Email OTP Server Function ─────────────────────────────────────────
export const verifyOtp = createServerFn({ method: "POST" })
  .validator((d: { email: string; code: string }) => d)
  .handler(async ({ data }) => {
    const isVerified = await verifyEmailOTP(data.email, data.code);
    return { success: isVerified };
  });

// ─── Salon Registration with Password & OTP Verification ─────────────────────
export const registerSalonWithOtp = createServerFn({ method: "POST" })
  .validator((d: {
    name: string;
    category?: string;
    address?: string;
    phone: string;
    email: string;
    ownerName: string;
    password: string;
    otpCode: string;
  }) => d)
  .handler(async ({ data }) => {
    const { name, category, address, phone, email, ownerName, password, otpCode } = data;

    // Verify OTP first
    const isValidOtp = await verifyEmailOTP(email, otpCode);
    if (!isValidOtp) {
      throw new Error("Invalid or expired email verification OTP code.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0].toLowerCase() + "_" + Math.floor(100 + Math.random() * 900);

    // Create user (role: salon_owner)
    const [user] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        name: ownerName,
        email,
        phone,
        role: "salon_owner",
      })
      .returning();

    // Create salon (approval_status: pending)
    const [salon] = await db
      .insert(salons)
      .values({
        name,
        category: category || "Salon",
        address,
        phone,
        email,
        ownerId: user.id,
        approvalStatus: "pending",
        status: "closed",
      })
      .returning();

    // Update user salonId
    await db
      .update(users)
      .set({ salonId: salon.id })
      .where(eq(users.id, user.id));

    return {
      success: true,
      user: { id: user.id, username: user.username, role: user.role, salonId: salon.id },
      salon: { id: salon.id, name: salon.name, address: salon.address },
      message: "Salon registration submitted successfully! Awaiting Admin approval.",
    };
  });

// ─── Claim Salon with Password & OTP Verification ──────────────────────────────
export const claimSalonWithOtp = createServerFn({ method: "POST" })
  .validator((d: {
    salonId: number;
    ownerName: string;
    phone: string;
    email: string;
    password: string;
    otpCode: string;
    claimNotes?: string;
  }) => d)
  .handler(async ({ data }) => {
    const { salonId, ownerName, phone, email, password, otpCode, claimNotes } = data;

    // Verify OTP first
    const isValidOtp = await verifyEmailOTP(email, otpCode);
    if (!isValidOtp) {
      throw new Error("Invalid or expired email verification OTP code.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0].toLowerCase() + "_claim_" + Math.floor(100 + Math.random() * 900);

    // Create user (role: salon_owner)
    const [user] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        name: ownerName,
        email,
        phone,
        role: "salon_owner",
      })
      .returning();

    // Update salon to pending approval & bind owner
    const [updatedSalon] = await db
      .update(salons)
      .set({
        ownerId: user.id,
        phone,
        email,
        approvalStatus: "pending",
        rejectionReason: claimNotes ? `Claim request notes: ${claimNotes}` : null,
      })
      .where(eq(salons.id, salonId))
      .returning();

    // Bind salonId to user
    await db
      .update(users)
      .set({ salonId: updatedSalon.id })
      .where(eq(users.id, user.id));

    return {
      success: true,
      message: `Claim request submitted for ${updatedSalon.name}! Pending Admin verification.`,
    };
  });
