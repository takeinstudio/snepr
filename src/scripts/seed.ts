/*
 * seed.ts — Snepr database seeder & cleanup
 * Run with: npx tsx src/scripts/seed.ts
 */
import { db } from "../backend/db";
import * as schema from "../backend/db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding & cleaning up Snepr database…\n");

  // ── 1. Clean up legacy admin users, keeping only snepr@2026 ─────────────────
  console.log("→ Cleaning up extra admin users…");

  // Delete legacy admin/subadmin test users except snepr@2026
  await db.delete(schema.users)
    .where(
      sql`${schema.users.username} IN ('admin', 'subadmin') AND ${schema.users.username} != 'snepr@2026'`
    );

  const hashed = await bcrypt.hash("sn#admin!epr@", 12);

  // Upsert snepr@2026 as superior super_admin
  const existingSuper = await db.select().from(schema.users)
    .where(eq(schema.users.username, "snepr@2026"));

  if (existingSuper.length > 0) {
    await db.update(schema.users)
      .set({
        name: "Snepr Super Admin",
        role: "super_admin",
        password: hashed,
        suspendedAt: null,
      })
      .where(eq(schema.users.username, "snepr@2026"));
    console.log("   ✓ Primary Super Admin (snepr@2026) synced & active.");
  } else {
    await db.insert(schema.users).values({
      username: "snepr@2026",
      password: hashed,
      name: "Snepr Super Admin",
      role: "super_admin",
    });
    console.log("   ✓ Primary Super Admin (snepr@2026) created.");
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

  // ── 3. Check Salons ───────────────────────────────────────────────────────
  const existingSalons = await db.select().from(schema.salons);
  if (existingSalons.length > 0) {
    console.log(`\n→ ${existingSalons.length} salons in DB.`);
    for (const salon of existingSalons) {
      if (!salon.approvalStatus || salon.approvalStatus === "open") {
        await db.update(schema.salons)
          .set({ approvalStatus: "pending" })
          .where(eq(schema.salons.id, salon.id));
      }
    }
    console.log("   ✓ Salons synced.");
  }

  console.log("\n✅ Database clean & synced!\n");
  console.log("─────────────────────────────────────────");
  console.log("  Portal:   https://snepr.in/admin");
  console.log("  Username: snepr@2026");
  console.log("  Password: sn#admin!epr@");
  console.log("─────────────────────────────────────────\n");

  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
