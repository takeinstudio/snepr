import { createFileRoute } from "@tanstack/react-router";
import { sendEmailDirectly, getEmailStats } from "../../../backend/email";

export const Route = createFileRoute("/api/admin/email")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const stats = await getEmailStats();
          return new Response(JSON.stringify(stats), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message || "Failed to fetch email metrics" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const result = await sendEmailDirectly(body);
          return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message || "Failed to deliver email" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
