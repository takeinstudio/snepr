import { db, connection } from "./index";
import { salons, services, queues } from "./schema";

async function seed() {
  console.log("Seeding database...");

  // 1. Clear existing data
  await db.delete(queues);
  await db.delete(services);
  await db.delete(salons);

  // 2. Insert dummy salons
  const insertedSalons = await db.insert(salons).values([
    { name: "Premium Fade Lounge", address: "123 Style Street", status: "open" },
    { name: "The Grooming Club", address: "456 Sharp Avenue", status: "open" },
  ]).returning();

  const salon1 = insertedSalons[0];
  const salon2 = insertedSalons[1];

  // 3. Insert services
  await db.insert(services).values([
    { salonId: salon1.id, name: "Haircut & Styling", price: 18000, durationMins: 30 },
    { salonId: salon1.id, name: "Beard Trim", price: 10000, durationMins: 15 },
    { salonId: salon2.id, name: "Classic Haircut", price: 15000, durationMins: 30 },
  ]);

  // 4. Insert some mock queues (people waiting)
  await db.insert(queues).values([
    { salonId: salon1.id, tokenNumber: 421, status: "completed" },
    { salonId: salon1.id, tokenNumber: 422, status: "completed" },
    { salonId: salon1.id, tokenNumber: 423, status: "in-progress" },
    { salonId: salon1.id, tokenNumber: 424, status: "waiting" },
    { salonId: salon1.id, tokenNumber: 425, status: "waiting" },
    
    { salonId: salon2.id, tokenNumber: 101, status: "in-progress" },
    { salonId: salon2.id, tokenNumber: 102, status: "waiting" },
  ]);

  console.log("Seeding completed successfully!");
  
  // Close connection so the script can exit
  await connection.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
