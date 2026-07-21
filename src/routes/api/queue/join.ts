// @ts-nocheck
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../../backend/db";
import { queues } from "../../../../backend/db/schema";

export const APIRoute = createAPIFileRoute("/api/queue/join")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const salonId = parseInt(body.salonId);
      
      if (!salonId || isNaN(salonId)) {
        return new Response(JSON.stringify({ error: "Invalid salonId" }), { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
      }

      // Generate a random token number for MVP
      const tokenNumber = Math.floor(Math.random() * 1000) + 1;

      const [newQueue] = await db.insert(queues).values({
        salonId,
        tokenNumber,
        status: "waiting",
      }).returning();

      return new Response(JSON.stringify(newQueue), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
  },
  OPTIONS: async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }
});
