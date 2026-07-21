import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { queues } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const joinQueue = createServerFn({ method: "POST" })
  .validator((d: { salonId: number }) => d)
  .handler(async ({ data: { salonId } }) => {
    // Determine next token number for this salon
    const lastTokenResult = await db
      .select({ tokenNumber: queues.tokenNumber })
      .from(queues)
      .where(eq(queues.salonId, salonId))
      .orderBy(desc(queues.tokenNumber))
      .limit(1);

    const nextTokenNumber = (lastTokenResult[0]?.tokenNumber || 0) + 1;

    // Insert new queue entry
    const newQueueEntry = await db.insert(queues).values({
      salonId,
      tokenNumber: nextTokenNumber,
      status: "waiting",
    }).returning();

    return newQueueEntry[0];
  });

export const getQueueStatus = createServerFn({ method: "GET" })
  .validator((d: number) => d) // queue id
  .handler(async ({ data: queueId }) => {
    const queueResult = await db.select().from(queues).where(eq(queues.id, queueId));
    if (!queueResult[0]) throw new Error("Queue not found");
    
    return queueResult[0];
  });
