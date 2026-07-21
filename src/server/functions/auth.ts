import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { users } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const login = createServerFn({ method: "POST" })
  .validator((d: { username: string; password: string }) => d)
  .handler(async ({ data }) => {
    const userResult = await db.select().from(users).where(
      and(
        eq(users.username, data.username),
        eq(users.password, data.password) // Raw password check for MVP
      )
    );

    const user = userResult[0];
    if (!user) {
      throw new Error("Invalid username or password");
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  });
