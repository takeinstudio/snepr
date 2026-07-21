// @ts-nocheck
import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { salons, bookings, queues, users } from "../db/schema";
import { eq, and, count, sql } from "drizzle-orm";

// ─── Salon CRUD ───────────────────────────────────────────────────────────────

export const getSalons = createServerFn({ method: "GET" })
  .validator((d: { callerRole?: string; cityId?: number }) => d)
  .handler(async ({ data }) => {
    let allSalons = await db.select().from(salons);
    
    if (data.callerRole === "sub_admin" && data.cityId) {
      allSalons = allSalons.filter(s => s.cityId === data.cityId);
    }

    // Calculate live wait time based on actual queues
    const salonsWithStatus = await Promise.all(allSalons.map(async (salon) => {
      const waiting = await db.select().from(queues).where(
        and(eq(queues.salonId, salon.id), eq(queues.status, "waiting"))
      );
      
      const waitingCount = waiting.length;
      const waitTime = waitingCount * 15; // 15 mins per person

      let queueStatus = "available";
      if (waitingCount >= 3) queueStatus = "busy";
      else if (waitingCount > 0) queueStatus = "finishing";

      return {
        ...salon,
        queueStatus,
        waitTime,
        waitingCount
      };
    }));

    return salonsWithStatus;
  });

export const getSalonStylists = createServerFn({ method: "GET" })
  .validator((d?: any) => d)
  .handler(async () => {
    try {
      const allStaff = await db.select({
        id: staff.id,
        role: staff.role,
        breakMode: staff.breakMode,
        name: users.name,
      }).from(staff)
      .innerJoin(users, eq(staff.userId, users.id));

      if (allStaff.length > 0) {
        return allStaff.map(s => ({
          name: s.name || "Stylist",
          role: s.role === "manager" ? "Master Stylist" : "Sr. Barber",
          status: s.breakMode ? "busy" : "available",
          eta: s.breakMode ? "20 min" : "Now",
        }));
      }
    } catch (e) {
      console.error("Staff fetch error", e);
    }

    return [
      { name: "Master Stylist", role: "Hair & Beard Specialist", status: "available", eta: "Now" },
      { name: "Senior Barber", role: "Grooming Specialist", status: "finishing", eta: "10 min" },
    ];
  });

export const getSalonById = createServerFn({ method: "GET" })
  .validator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    const result = await db.select().from(salons).where(eq(salons.id, data.id));
    return result[0] ?? null;
  });

// getSalonDetails — enriched view for the salon detail page
export const getSalonDetails = createServerFn({ method: "GET" })
  .validator((d: number) => d)
  .handler(async ({ data: id }) => {
    const [salon] = await db.select().from(salons).where(eq(salons.id, id));
    if (!salon) return null;

    const waiting = await db.select().from(queues).where(
      and(eq(queues.salonId, id), eq(queues.status, "waiting"))
    );

    return {
      ...salon,
      waitingCount: waiting.length,
      estimatedWaitTimeMins: waiting.length * 15,
    };
  });

export const createSalon = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const [salon] = await db.insert(salons).values(data).returning();
    return salon;
  });

export const updateSalon = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    const [updated] = await db.update(salons).set(rest).where(eq(salons.id, id)).returning();
    return updated;
  });

export const deleteSalon = createServerFn({ method: "POST" })
  .validator((d: number) => d)
  .handler(async ({ data: id }) => {
    await db.delete(salons).where(eq(salons.id, id));
    return { success: true };
  });

// ─── Salon approval (Sub Admin / Super Admin) ─────────────────────────────────

export const approveSalon = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; callerId: number; salonId: number }) => d)
  .handler(async ({ data }) => {
    if (!["super_admin", "sub_admin"].includes(data.callerRole)) throw new Error("Forbidden");
    const [updated] = await db.update(salons)
      .set({
        approvalStatus: "approved",
        approvedById: data.callerId,
        approvedAt: new Date(),
        status: "open",
      })
      .where(eq(salons.id, data.salonId))
      .returning();
    return updated;
  });

export const rejectSalon = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; salonId: number; reason: string }) => d)
  .handler(async ({ data }) => {
    if (!["super_admin", "sub_admin"].includes(data.callerRole)) throw new Error("Forbidden");
    const [updated] = await db.update(salons)
      .set({ approvalStatus: "rejected", rejectionReason: data.reason })
      .where(eq(salons.id, data.salonId))
      .returning();
    return updated;
  });

export const suspendSalon = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; salonId: number }) => d)
  .handler(async ({ data }) => {
    if (!["super_admin", "sub_admin"].includes(data.callerRole)) throw new Error("Forbidden");
    const [updated] = await db.update(salons)
      .set({ approvalStatus: "suspended", status: "closed" })
      .where(eq(salons.id, data.salonId))
      .returning();
    return updated;
  });

// ─── Platform Stats (Super Admin) ─────────────────────────────────────────────

export const getPlatformStats = createServerFn({ method: "GET" })
  .validator((d: { callerRole: string }) => d)
  .handler(async ({ data }) => {
    if (data.callerRole !== "super_admin") throw new Error("Forbidden");

    const [totalSalons] = await db.select({ count: count() }).from(salons);
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalBookings] = await db.select({ count: count() }).from(bookings);
    const [liveQueues] = await db.select({ count: count() }).from(queues)
      .where(eq(queues.status, "waiting"));
    const [approvedSalons] = await db.select({ count: count() }).from(salons)
      .where(eq(salons.approvalStatus, "approved"));
    const [pendingSalons] = await db.select({ count: count() }).from(salons)
      .where(eq(salons.approvalStatus, "pending"));

    return {
      totalSalons: totalSalons.count,
      totalUsers: totalUsers.count,
      totalBookings: totalBookings.count,
      liveQueues: liveQueues.count,
      approvedSalons: approvedSalons.count,
      pendingSalons: pendingSalons.count,
    };
  });

// ─── Salon Owner Stats ────────────────────────────────────────────────────────

export const getSalonStats = createServerFn({ method: "GET" })
  .validator((d: { callerRole: string; salonId: number }) => d)
  .handler(async ({ data }) => {
    if (!["super_admin", "sub_admin", "salon_owner"].includes(data.callerRole)) throw new Error("Forbidden");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayBookings] = await db.select({ count: count() }).from(bookings)
      .where(and(
        eq(bookings.salonId, data.salonId),
        sql`${bookings.createdAt} >= ${today}`
      ));

    const [waiting] = await db.select({ count: count() }).from(queues)
      .where(and(
        eq(queues.salonId, data.salonId),
        eq(queues.status, "waiting")
      ));

    const allBookings = await db.select().from(bookings)
      .where(eq(bookings.salonId, data.salonId));

    const totalRevenue = allBookings
      .filter(b => b.status === "completed")
      .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);

    return {
      todayBookings: todayBookings.count,
      customersWaiting: waiting.count,
      totalRevenue,
    };
  });
