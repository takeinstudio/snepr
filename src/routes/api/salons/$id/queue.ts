// @ts-nocheck
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../../backend/db";
import { salons, queues, staff, users } from "../../../../backend/db/schema";
import { eq, and } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/salons/$id/queue")({
  GET: async ({ request, params }) => {
    try {
      const salonId = parseInt(params.id);
      if (isNaN(salonId)) throw new Error("Invalid salon ID");

      const salon = await db.select().from(salons).where(eq(salons.id, salonId));
      if (!salon.length) throw new Error("Salon not found");

      const activeQueues = await db.select().from(queues).where(
        and(eq(queues.salonId, salonId), eq(queues.status, "waiting"))
      );

      // Fetch real staff from database
      const dbStaff = await db.select({
        id: staff.id,
        role: staff.role,
        breakMode: staff.breakMode,
        name: users.name,
      }).from(staff)
      .innerJoin(users, eq(staff.userId, users.id))
      .where(eq(staff.salonId, salonId));

      const barbers = dbStaff.length > 0 ? dbStaff.map(s => ({
        name: s.name || "Stylist",
        role: s.role === "manager" ? "Master Stylist" : "Sr. Barber",
        status: s.breakMode ? "busy" : "available",
        eta: s.breakMode ? "20 min" : "Now",
      })) : [
        { name: "Master Stylist", role: "Hair Specialist", status: "available", eta: "Now" }
      ];

      return new Response(JSON.stringify({
        salon: salon[0],
        totalWaiting: activeQueues.length,
        estimatedWaitTime: activeQueues.length * 15,
        barbers
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
  },
});
