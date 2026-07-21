import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../../backend/db";
import { salons, queues } from "../../../../backend/db/schema";
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

      // Mock barbers data for MVP
      const barbers = [
        { name: "Arjun", role: "Sr. Stylist", status: "available", eta: "Now" },
        { name: "Rahul", role: "Barber", status: "busy", eta: "15 min" },
      ];

      return new Response(JSON.stringify({
        salon: salon[0],
        totalWaiting: activeQueues.length,
        estimatedWaitTime: activeQueues.length * 15, // 15 mins per person
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
