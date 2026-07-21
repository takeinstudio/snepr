import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("Seeding admin user...");

  const username = "snepr@2026";
  const rawPassword = "sn#admin!epr@";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  try {
    await db.insert(users).values({
      username,
      password: hashedPassword,
      role: "admin",
    });
    console.log("Successfully created admin user.");
  } catch (err: any) {
    if (err.code === '23505') { // Unique violation
      console.log("User already exists, updating password...");
      await db.update(users).set({ password: hashedPassword, role: "admin" });
      console.log("Password updated.");
    } else {
      console.error("Error creating user:", err);
    }
  }

  process.exit(0);
}

main();
