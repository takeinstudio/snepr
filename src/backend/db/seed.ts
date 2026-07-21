import { db, connection } from "./index";
import { salons, services, queues, cities } from "./schema";

async function seed() {
  console.log("Seeding database with live Bhubaneswar data...");

  // 1. Clear existing dynamic data
  await db.delete(queues);
  await db.delete(services);
  await db.delete(salons);
  // Do not delete cities/users if they are already seeded by auth/seed scripts, but let's ensure BBSR exists
  const [bbsr] = await db.insert(cities).values({
    name: "Bhubaneswar",
    state: "Odisha",
  }).onConflictDoNothing().returning();

  // 2. Insert realistic mid-size salons in central Bhubaneswar areas
  const insertedSalons = await db.insert(salons).values([
    { 
      name: "The Scissors Edge", 
      address: "Plot 142, Saheed Nagar, Bhubaneswar", 
      category: "Unisex Salon",
      rating: "4.8",
      reviewCount: 124,
      status: "open", 
      approvalStatus: "approved",
      latitude: "20.2961000", 
      longitude: "85.8245000" 
    },
    { 
      name: "Urban Look Salon", 
      address: "1st Floor, Near Pal Heights, Jaydev Vihar", 
      category: "Men's Grooming",
      rating: "4.6",
      reviewCount: 89,
      status: "open", 
      approvalStatus: "approved",
      latitude: "20.3010000", 
      longitude: "85.8170000" 
    },
    { 
      name: "Glamour Touch Hair & Beauty", 
      address: "VIP Road, IRC Village, Nayapalli", 
      category: "Beauty Parlour",
      rating: "4.9",
      reviewCount: 210,
      status: "open", 
      approvalStatus: "approved",
      latitude: "20.2870000", 
      longitude: "85.8115000" 
    },
    { 
      name: "Style Studio by Jawed Habib", 
      address: "KIIT Square, Patia, Bhubaneswar", 
      category: "Premium Salon",
      rating: "4.7",
      reviewCount: 450,
      status: "open", 
      approvalStatus: "approved",
      latitude: "20.3533000", 
      longitude: "85.8266000" 
    },
    { 
      name: "Toni & Guy Essensuals", 
      address: "Janpath Road, Kharvela Nagar", 
      category: "Luxury Salon",
      rating: "4.8",
      reviewCount: 312,
      status: "open", 
      approvalStatus: "approved",
      latitude: "20.2750000", 
      longitude: "85.8340000" 
    },
  ]).returning();

  // 3. Insert services
  const servicesData = insertedSalons.flatMap(salon => [
    { salonId: salon.id, name: "Haircut & Styling", price: 25000, durationMins: 30 },
    { salonId: salon.id, name: "Beard Trim", price: 15000, durationMins: 15 },
    { salonId: salon.id, name: "Hair Spa", price: 80000, durationMins: 45 },
  ]);
  await db.insert(services).values(servicesData);

  // 4. Insert live-updating queues (mix of waiting, in-progress)
  // This gives the impression of a living, breathing application with people currently queued.
  const queuesData: any[] = [];
  
  insertedSalons.forEach((salon, i) => {
    // Generate realistic queues based on the salon's popularity
    const waitingCount = i % 2 === 0 ? 3 : (i === 1 ? 0 : 1); // Varied wait times
    let tokenStart = 100 + (i * 50);

    // Some completed
    queuesData.push({ salonId: salon.id, tokenNumber: tokenStart++, status: "completed" });
    queuesData.push({ salonId: salon.id, tokenNumber: tokenStart++, status: "completed" });
    
    // One in-progress
    queuesData.push({ salonId: salon.id, tokenNumber: tokenStart++, status: "in-progress" });

    // Rest waiting
    for (let w = 0; w < waitingCount; w++) {
      queuesData.push({ salonId: salon.id, tokenNumber: tokenStart++, status: "waiting" });
    }
  });

  await db.insert(queues).values(queuesData);

  console.log("Realistic Bhubaneswar Data seeded successfully!");
  
  // Close connection so the script can exit
  await connection.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
