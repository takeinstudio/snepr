import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { salons, queues } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export const getSalons = createServerFn({ method: "GET" }).handler(async () => {
  // Get all salons with their current waiting queue length
  const allSalons = await db.select().from(salons);
  
  // For each salon, get the live wait time (mocking 15 mins per waiting person)
  const salonsWithStats = await Promise.all(
    allSalons.map(async (salon) => {
      const waitingCountResult = await db
        .select({ count: sql<number>`cast(count(${queues.id}) as int)` })
        .from(queues)
        .where(sql`${queues.salonId} = ${salon.id} AND ${queues.status} = 'waiting'`);
        
      const waitingCount = waitingCountResult[0]?.count || 0;
      
      return {
        ...salon,
        waitingCount,
        estimatedWaitTimeMins: waitingCount * 15,
      };
    })
  );

  return salonsWithStats;
});

export const getSalonDetails = createServerFn({ method: "GET" })
  .validator((d: number) => d)
  .handler(async ({ data: salonId }) => {
    const salonResult = await db.select().from(salons).where(eq(salons.id, salonId));
    const salon = salonResult[0];

    if (!salon) throw new Error("Salon not found");

    const waitingCountResult = await db
      .select({ count: sql<number>`cast(count(${queues.id}) as int)` })
      .from(queues)
      .where(sql`${queues.salonId} = ${salon.id} AND ${queues.status} = 'waiting'`);
      
    const waitingCount = waitingCountResult[0]?.count || 0;

    return {
      ...salon,
      waitingCount,
      estimatedWaitTimeMins: waitingCount * 15,
    };
  });

// Admin CRUD Operations
export const createSalon = createServerFn({ method: "POST" })
  .validator((d: { name: string; address?: string; phone?: string; category?: string; status?: string }) => d)
  .handler(async ({ data }) => {
    const newSalon = await db.insert(salons).values({
      ...data,
      status: data.status || "open"
    }).returning();
    return newSalon[0];
  });

export const updateSalon = createServerFn({ method: "POST" })
  .validator((d: { id: number; name?: string; address?: string; phone?: string; category?: string; status?: string }) => d)
  .handler(async ({ data }) => {
    const { id, ...updates } = data;
    const updated = await db.update(salons).set(updates).where(eq(salons.id, id)).returning();
    return updated[0];
  });

export const deleteSalon = createServerFn({ method: "POST" })
  .validator((d: number) => d)
  .handler(async ({ data: id }) => {
    // Delete associated queues first to satisfy foreign key constraints
    await db.delete(queues).where(eq(queues.salonId, id));
    const deleted = await db.delete(salons).where(eq(salons.id, id)).returning();
    return deleted[0];
  });
