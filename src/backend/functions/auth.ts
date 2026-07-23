import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { users, cities, salons } from "../db/schema";
import { eq, ne, sql, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export type UserRole = "super_admin" | "sub_admin" | "salon_owner" | "staff" | "customer";

export interface SessionUser {
  id: number;
  username: string;
  name: string | null;
  role: UserRole;
  cityId: number | null;
  salonId: number | null;
}

// ─── Permission guards ────────────────────────────────────────────────────────

export function requireRole(user: SessionUser, ...roles: UserRole[]) {
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: requires one of [${roles.join(", ")}]`);
  }
}

export function isSuperAdmin(user: SessionUser) {
  return user.role === "super_admin";
}

export function canManageCity(user: SessionUser, cityId: number) {
  if (user.role === "super_admin") return true;
  if (user.role === "sub_admin" && user.cityId === cityId) return true;
  return false;
}

export function canManageSalon(user: SessionUser, salonId: number) {
  if (user.role === "super_admin") return true;
  if (user.role === "salon_owner" && user.salonId === salonId) return true;
  return false;
}

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = createServerFn({ method: "POST" })
  .validator((d: { username: string; password: string }) => d)
  .handler(async ({ data }) => {
    const userResult = await db.select().from(users).where(eq(users.username, data.username));
    const user = userResult[0];

    if (!user) throw new Error("Invalid username or password");

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error("Invalid username or password");

    if (user.suspendedAt) throw new Error("This account has been suspended.");

    let approvalStatus = "approved";
    let rejectionReason: string | null = null;

    if (user.salonId) {
      const [salon] = await db.select().from(salons).where(eq(salons.id, user.salonId));
      if (salon) {
        approvalStatus = salon.approvalStatus || "approved";
        rejectionReason = salon.rejectionReason || null;
      }
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role as UserRole,
      cityId: user.cityId ?? null,
      salonId: user.salonId ?? null,
      approvalStatus,
      rejectionReason,
    };
  });

// ─── Create Any User (Super Admin) ────────────────────────────────────────────

export const createUser = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; username: string; password: string; name: string; role: UserRole; cityId?: number }) => d)
  .handler(async ({ data }) => {
    if (data.callerRole !== "super_admin") throw new Error("Forbidden");

    const hashed = await bcrypt.hash(data.password, 10);
    const [created] = await db.insert(users).values({
      username: data.username,
      password: hashed,
      name: data.name,
      role: data.role,
      cityId: data.cityId ?? null,
    }).returning();
    return created;
  });

// ─── Create Sub Admin ─────────────────────────────────────────────────────────

export const createSubAdmin = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; username: string; password: string; name: string; cityId: number }) => d)
  .handler(async ({ data }) => {
    if (data.callerRole !== "super_admin") throw new Error("Forbidden");

    const hashed = await bcrypt.hash(data.password, 10);
    const [created] = await db.insert(users).values({
      username: data.username,
      password: hashed,
      name: data.name,
      role: "sub_admin",
      cityId: data.cityId,
    }).returning();
    return { id: created.id, username: created.username, cityId: created.cityId };
  });

// ─── Delete User (Super Admin) ────────────────────────────────────────────────

export const deleteUser = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; userId: number }) => d)
  .handler(async ({ data }) => {
    if (data.callerRole !== "super_admin") throw new Error("Forbidden");

    // Do not allow deleting snepr@2026
    const [target] = await db.select().from(users).where(eq(users.id, data.userId));
    if (target?.username === "snepr@2026") {
      throw new Error("Cannot delete primary Super Admin snepr@2026");
    }

    await db.delete(users).where(eq(users.id, data.userId));
    return { success: true };
  });

// ─── Update User Role ─────────────────────────────────────────────────────────

export const updateUserRole = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; userId: number; newRole: UserRole }) => d)
  .handler(async ({ data }) => {
    if (data.callerRole !== "super_admin") throw new Error("Forbidden");

    await db.update(users)
      .set({ role: data.newRole })
      .where(eq(users.id, data.userId));
    return { success: true };
  });

// ─── Suspend / Unsuspend User ─────────────────────────────────────────────────

export const suspendUser = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; userId: number; reason: string }) => d)
  .handler(async ({ data }) => {
    if (!["super_admin", "sub_admin"].includes(data.callerRole)) throw new Error("Forbidden");
    await db.update(users)
      .set({ suspendedAt: new Date(), suspendReason: data.reason })
      .where(eq(users.id, data.userId));
    return { success: true };
  });

// ─── Get all users with auto-cleanup (Super Admin) ───────────────────────────

export const getAllUsers = createServerFn({ method: "GET" })
  .validator((d: { callerRole: string }) => d)
  .handler(async ({ data }) => {
    if (data.callerRole !== "super_admin") throw new Error("Forbidden");

    // Auto-cleanup legacy test admin/subadmin accounts
    try {
      await db.delete(users).where(
        sql`${users.username} IN ('admin', 'subadmin') AND ${users.username} != 'snepr@2026'`
      );
    } catch {
      // Ignore if constraint error
    }

    return db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      cityId: users.cityId,
      salonId: users.salonId,
      suspendedAt: users.suspendedAt,
      createdAt: users.createdAt,
    }).from(users);
  });

// ─── Get cities ────────────────────────────────────────────────────────────────

export const getCities = createServerFn({ method: "GET" })
  .handler(async () => {
    return db.select().from(cities);
  });

// ─── Create city ─────────────────────────────────────────────────────────────

export const createCity = createServerFn({ method: "POST" })
  .validator((d: { callerRole: string; name: string; state: string }) => d)
  .handler(async ({ data }) => {
    if (data.callerRole !== "super_admin") throw new Error("Forbidden");
    const [city] = await db.insert(cities).values({
      name: data.name,
      state: data.state,
    }).returning();
    return city;
  });
