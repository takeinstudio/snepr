import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { waitlist } from "../db/schema";

export const joinWaitlist = createServerFn({ method: "POST" })
  .validator((d: { email: string }) => d)
  .handler(async ({ data }) => {
    // Basic validation
    if (!data.email.includes("@")) throw new Error("Invalid email address");

    try {
      await db.insert(waitlist).values({ email: data.email });
      return { success: true };
    } catch (e: any) {
      // Handle unique constraint error if email already exists
      if (e.code === '23505') return { success: true }; // Silently succeed
      throw new Error("Failed to join waitlist");
    }
  });
