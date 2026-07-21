import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const login = createServerFn({ method: "POST" })
  .validator((d: { username: string; password: string }) => d)
  .handler(async ({ data }) => {
    const userResult = await db.select().from(users).where(eq(users.username, data.username));

    const user = userResult[0];
    if (!user) {
      throw new Error("Invalid username or password");
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new Error("Invalid username or password");
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  });
