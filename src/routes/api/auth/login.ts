import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "../../../../backend/db";
import { users } from "../../../../backend/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_mobile_auth";

export const APIRoute = createAPIFileRoute("/api/auth/login")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      
      if (!body.username || !body.password) {
        return new Response(JSON.stringify({ error: "Missing credentials" }), { status: 400 });
      }

      const userResult = await db.select().from(users).where(eq(users.username, body.username));
      const user = userResult[0];

      if (!user) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });

      const isValid = await bcrypt.compare(body.password, user.password);
      if (!isValid) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });

      if (user.suspendedAt) return new Response(JSON.stringify({ error: "Account suspended" }), { status: 403 });

      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      return new Response(JSON.stringify({ token, user: payload }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
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
