import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { queues, staff, bookings } from "../db/schema";
import { eq, and } from "drizzle-orm";

// ─── Get live queue for a salon ───────────────────────────────────────────────

export const getLiveQueue = createServerFn({ method: "GET" })
  .validator((d: { salonId: number }) => d)
  .handler(async ({ data }) => {
    return db.select().from(queues)
      .where(and(
        eq(queues.salonId, data.salonId),
        eq(queues.status, "waiting")
      ));
  });

// ─── Join queue (Customer) ────────────────────────────────────────────────────

export const joinQueue = createServerFn({ method: "POST" })
  .validator((d: { salonId: number; customerId?: number }) => d)
  .handler(async ({ data }) => {
    // Get next token number
    const existing = await db.select().from(queues)
      .where(and(eq(queues.salonId, data.salonId), eq(queues.status, "waiting")));
    const tokenNumber = existing.length + 1;

    const [entry] = await db.insert(queues).values({
      salonId: data.salonId,
      customerId: data.customerId ?? null,
      tokenNumber,
      status: "waiting",
      estimatedWaitMins: tokenNumber * 15,
    }).returning();

    return entry;
  });

// ─── Call next customer (Salon Owner / Staff) ─────────────────────────────────

export const callNext = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; salonId: number }) => d)
  .handler(async ({ data }) => {
    if (!["super_admin", "sub_admin", "salon_owner", "staff"].includes(data.callerRole)) {
      throw new Error("Forbidden");
    }

    const waiting = await db.select().from(queues)
      .where(and(eq(queues.salonId, data.salonId), eq(queues.status, "waiting")));

    const next = waiting.sort((a, b) => a.tokenNumber - b.tokenNumber)[0];
    if (!next) throw new Error("No customers in queue");

    const [updated] = await db.update(queues)
      .set({ status: "in-progress", calledAt: new Date() })
      .where(eq(queues.id, next.id))
      .returning();

    return updated;
  });

// ─── Skip customer ─────────────────────────────────────────────────────────────

export const skipCustomer = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; queueId: number }) => d)
  .handler(async ({ data }) => {
    if (!["super_admin", "sub_admin", "salon_owner", "staff"].includes(data.callerRole)) {
      throw new Error("Forbidden");
    }
    const [updated] = await db.update(queues)
      .set({ status: "skipped" })
      .where(eq(queues.id, data.queueId))
      .returning();
    return updated;
  });

// ─── Complete service ─────────────────────────────────────────────────────────

export const completeService = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; queueId: number }) => d)
  .handler(async ({ data }) => {
    if (!["super_admin", "sub_admin", "salon_owner", "staff"].includes(data.callerRole)) {
      throw new Error("Forbidden");
    }
    const [updated] = await db.update(queues)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(queues.id, data.queueId))
      .returning();
    return updated;
  });

// ─── Staff management ─────────────────────────────────────────────────────────

export const getStaff = createServerFn({ method: "GET" })
  .validator((d: { salonId: number }) => d)
  .handler(async ({ data }) => {
    return db.select().from(staff).where(eq(staff.salonId, data.salonId));
  });

export const addStaff = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; salonId: number; userId: number; role: string }) => d)
  .handler(async ({ data }) => {
    if (!["super_admin", "salon_owner"].includes(data.callerRole)) throw new Error("Forbidden");
    const [member] = await db.insert(staff).values({
      salonId: data.salonId,
      userId: data.userId,
      role: data.role,
    }).returning();
    return member;
  });

export const removeStaff = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; staffId: number }) => d)
  .handler(async ({ data }) => {
    if (!["super_admin", "salon_owner"].includes(data.callerRole)) throw new Error("Forbidden");
    await db.delete(staff).where(eq(staff.id, data.staffId));
    return { success: true };
  });

export const toggleBreakMode = createServerFn({ method: "POST" })
  .validator((d: { staffId: number; breakMode: boolean }) => d)
  .handler(async ({ data }) => {
    const [updated] = await db.update(staff)
      .set({ breakMode: data.breakMode })
      .where(eq(staff.id, data.staffId))
      .returning();
    return updated;
  });
