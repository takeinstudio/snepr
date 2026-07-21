// @ts-nocheck
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../../backend/db";
import { salons, queues } from "../../../../backend/db/schema";
import { eq, and } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/salons/")({
  GET: async ({ request, params }) => {
    try {
      const allSalons = await db.select().from(salons).where(eq(salons.status, "open"));
      
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

      return new Response(JSON.stringify(salonsWithStatus), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  },
});
