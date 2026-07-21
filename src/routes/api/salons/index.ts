import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../../backend/db";
import { salons } from "../../../../backend/db/schema";
import { eq } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/salons/")({
  GET: async ({ request, params }) => {
    try {
      const allSalons = await db.select().from(salons).where(eq(salons.status, "open"));
      
      // In a real app we would join with queues table to get live wait time.
      // For MVP we will add mock wait times based on id.
      const salonsWithStatus = allSalons.map(salon => ({
        ...salon,
        queueStatus: salon.id % 3 === 0 ? "busy" : salon.id % 2 === 0 ? "finishing" : "available",
        waitTime: salon.id * 5 + 5, // mock minutes
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
