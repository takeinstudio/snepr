import { db } from "../backend/db";
import { sql } from "drizzle-orm";

async function runMigration() {
  console.log("Running manual migration...");
  
  try {
    await db.execute(sql`ALTER TABLE salons ADD COLUMN IF NOT EXISTS latitude numeric(10, 7);`);
    await db.execute(sql`ALTER TABLE salons ADD COLUMN IF NOT EXISTS longitude numeric(10, 7);`);
    console.log("Added latitude and longitude to salons table successfully.");
  } catch (error) {
    console.error("Migration error:", error);
  }
  
  process.exit(0);
}

runMigration();
