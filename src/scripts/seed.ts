/**
 * seed.ts — Snepr database seeder
 * Run with: npx tsx src/scripts/seed.ts
 *
 * - Migrates existing admin user to super_admin role
 * - Creates the default cities (Bhubaneswar, Bangalore)
 * - Salons already in the DB are left untouched
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../backend/db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const connection = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(connection, { schema });

async function seed() {
  console.log("🌱 Seeding Snepr database…\n");

  // ── 1. Migrate existing admin to super_admin ──────────────────────────────
  console.log("→ Migrating admin user to super_admin…");
  
  const existingAdmins = await db.select().from(schema.users)
    .where(sql`${schema.users.role} IN ('admin', 'super_admin')`);

  if (existingAdmins.length > 0) {
    // Re-hash with bcrypt if password looks unhashed (no $2b$ prefix)
    for (const admin of existingAdmins) {
      const needsHashing = !admin.password.startsWith("$2b$");
      const hashedPw = needsHashing
        ? await bcrypt.hash(admin.password, 12)
        : admin.password;

      await db.update(schema.users)
        .set({ role: "super_admin", password: hashedPw })
        .where(eq(schema.users.id, admin.id));

      console.log(`   ✓ ${admin.username} → super_admin (password re-hashed: ${needsHashing})`);
    }
  } else {
    // No admin exists — create the super admin from scratch
    console.log("   No existing admin found, creating super admin…");
    const hashed = await bcrypt.hash("sn#admin!epr@", 12);
    await db.insert(schema.users).values({
      username: "snepr@2026",
      password: hashed,
      name: "Snepr Super Admin",
      role: "super_admin",
    }).onConflictDoNothing();
    console.log("   ✓ snepr@2026 created as super_admin");
  }

  // ── 2. Seed cities ────────────────────────────────────────────────────────
  console.log("\n→ Seeding cities…");
  const citySeed = [
    { name: "Bhubaneswar", state: "Odisha" },
    { name: "Bangalore", state: "Karnataka" },
    { name: "Delhi", state: "Delhi" },
    { name: "Mumbai", state: "Maharashtra" },
  ];

  for (const city of citySeed) {
    await db.insert(schema.cities).values(city).onConflictDoNothing();
    console.log(`   ✓ ${city.name}, ${city.state}`);
  }

  // ── 3. Seed default categories on salons (if empty) ───────────────────────
  const existingSalons = await db.select().from(schema.salons);
  if (existingSalons.length > 0) {
    console.log(`\n→ ${existingSalons.length} salons already in DB, skipping salon seed.`);
    // Set any existing salons to "pending" approval if not set
    for (const salon of existingSalons) {
      if (!salon.approvalStatus || salon.approvalStatus === "open") {
        await db.update(schema.salons)
          .set({ approvalStatus: "pending" })
          .where(eq(schema.salons.id, salon.id));
      }
    }
    console.log("   ✓ Set unset salons to pending approval");
  }

  console.log("\n✅ Seed complete!\n");
  console.log("─────────────────────────────────────────");
  console.log("  Portal:   https://snepr.in/admin");
  console.log("  Username: snepr@2026");
  console.log("  Password: sn#admin!epr@");
  console.log("─────────────────────────────────────────\n");

  await connection.end();
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
