import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { bookings, salons, users, services, settlements, coupons, notifications, cities } from "../db/schema";
import { eq, desc, sql, count } from "drizzle-orm";

// ─── Booking Management ───────────────────────────────────────────────────────

export const getAllBookings = createServerFn({ method: "GET" })
  .validator((d: { callerRole?: string }) => d)
  .handler(async ({ data }) => {
    const allBookings = await db.select({
      id: bookings.id,
      salonId: bookings.salonId,
      status: bookings.status,
      scheduledAt: bookings.scheduledAt,
      completedAt: bookings.completedAt,
      totalPrice: bookings.totalPrice,
      notes: bookings.notes,
      createdAt: bookings.createdAt,
      salonName: salons.name,
      customerName: users.name,
      customerEmail: users.email,
    })
    .from(bookings)
    .leftJoin(salons, eq(bookings.salonId, salons.id))
    .leftJoin(users, eq(bookings.customerId, users.id))
    .orderBy(desc(bookings.createdAt))
    .limit(100);

    return allBookings;
  });

// ─── Financials & Settlements ─────────────────────────────────────────────────

export const getFinancialStats = createServerFn({ method: "GET" })
  .validator((d: { callerRole?: string }) => d)
  .handler(async ({ data }) => {
    const allSettlements = await db.select({
      id: settlements.id,
      salonId: settlements.salonId,
      salonName: salons.name,
      periodStart: settlements.periodStart,
      periodEnd: settlements.periodEnd,
      grossRevenue: settlements.grossRevenue,
      commissionDeducted: settlements.commissionDeducted,
      netPayable: settlements.netPayable,
      status: settlements.status,
      settledAt: settlements.settledAt,
    })
    .from(settlements)
    .leftJoin(salons, eq(settlements.salonId, salons.id))
    .orderBy(desc(settlements.createdAt));

    // Calculate totals
    const [rev] = await db.select({
      totalGross: sql<number>`COALESCE(SUM(${bookings.totalPrice}), 0)`,
      totalCommission: sql<number>`COALESCE(SUM(${bookings.commissionAmount}), 0)`,
    }).from(bookings);

    return {
      grossVolume: rev?.totalGross ?? 0,
      totalCommission: rev?.totalCommission ?? 0,
      settlementsList: allSettlements,
    };
  });

// ─── Marketing & Coupons ──────────────────────────────────────────────────────

export const getCoupons = createServerFn({ method: "GET" })
  .validator((d: { callerRole?: string }) => d)
  .handler(async () => {
    return db.select().from(coupons).orderBy(desc(coupons.id));
  });

export const createCoupon = createServerFn({ method: "POST" })
  .validator((d: { code: string; discountType: string; value: number; minOrderValue?: number; cityId?: number }) => d)
  .handler(async ({ data }) => {
    const [newCoupon] = await db.insert(coupons).values({
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      value: data.value,
      minOrderValue: data.minOrderValue ?? 0,
      cityId: data.cityId ?? null,
    }).returning();

    return newCoupon;
  });

// ─── Push Campaigns ───────────────────────────────────────────────────────────

export const getNotifications = createServerFn({ method: "GET" })
  .validator((d: { callerRole?: string }) => d)
  .handler(async () => {
    return db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(20);
  });

export const createNotification = createServerFn({ method: "POST" })
  .validator((d: { title: string; body: string; targetRole?: string; cityId?: number }) => d)
  .handler(async ({ data }) => {
    const [notif] = await db.insert(notifications).values({
      title: data.title,
      body: data.body,
      targetRole: data.targetRole ?? "all",
      cityId: data.cityId ?? null,
    }).returning();

    return notif;
  });
