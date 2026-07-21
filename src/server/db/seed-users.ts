import { db, connection } from "./index";
import { users } from "./schema";

async function seedUsers() {
  console.log("Seeding admin users...");

  await db.insert(users).values([
    { username: "admin", password: "admin", role: "admin" }, 
    { username: "subadmin", password: "subadmin", role: "subadmin" },
  ]).onConflictDoNothing(); // Ignore if they already exist

  console.log("Users seeded successfully!");
  await connection.end();
}

seedUsers().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
