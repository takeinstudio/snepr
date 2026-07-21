import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./db";
import { users, salons, queues, bookings } from "./db/schema";
import { eq, and, desc } from "drizzle-orm";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_mobile_auth";

// ─── AUTHENTICATION ───
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const userResult = await db.select().from(users).where(eq(users.username, username));
    const user = userResult[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    if (user.suspendedAt) return res.status(403).json({ error: "Account suspended" });

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: payload });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── SALONS LIST (DB LIVE DATA) ───
app.get("/api/salons", async (req, res) => {
  try {
    const allSalons = await db.select().from(salons);
    
    const salonsWithStatus = await Promise.all(allSalons.map(async (salon) => {
      const waiting = await db.select().from(queues).where(
        and(eq(queues.salonId, salon.id), eq(queues.status, "waiting"))
      );
      
      const waitingCount = waiting.length;
      const waitTime = waitingCount * 15; // 15 mins per waiting customer

      let queueStatus = "available";
      if (waitingCount >= 3) queueStatus = "busy";
      else if (waitingCount > 0) queueStatus = "finishing";

      return {
        ...salon,
        queueStatus,
        waitTime,
        waitingCount,
        latitude: salon.latitude ? parseFloat(salon.latitude.toString()) : null,
        longitude: salon.longitude ? parseFloat(salon.longitude.toString()) : null,
      };
    }));

    res.json(salonsWithStatus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── JOIN QUEUE (DB LIVE INSERT) ───
app.post("/api/queue/join", async (req, res) => {
  try {
    const { salonId, customerName, customerPhone } = req.body;
    if (!salonId) {
      return res.status(400).json({ error: "Missing salonId" });
    }

    const existingWaiting = await db.select().from(queues).where(
      and(eq(queues.salonId, salonId), eq(queues.status, "waiting"))
    );

    const position = existingWaiting.length + 1;
    const estimatedWait = existingWaiting.length * 15;

    const [newQueue] = await db.insert(queues).values({
      salonId,
      tokenNumber: Math.floor(10 + Math.random() * 90),
      position,
      status: "waiting",
      estimatedWaitMins: estimatedWait,
    }).returning();

    res.json({
      success: true,
      queue: newQueue,
      position,
      estimatedWait,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CANCEL QUEUE (DB LIVE UPDATE) ───
app.post("/api/queue/cancel", async (req, res) => {
  try {
    const { queueId } = req.body;
    if (queueId) {
      await db.update(queues).set({ status: "cancelled" }).where(eq(queues.id, queueId));
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET ACTIVE QUEUE FROM DB ───
app.get("/api/user/active-queue", async (req, res) => {
  try {
    const activeList = await db.select().from(queues).where(eq(queues.status, "waiting")).orderBy(desc(queues.createdAt)).limit(1);
    if (activeList.length === 0) {
      return res.json({ activeQueue: null });
    }
    const q = activeList[0];
    const [salon] = await db.select().from(salons).where(eq(salons.id, q.salonId));
    res.json({
      activeQueue: {
        id: q.id,
        tokenNumber: q.tokenNumber || 12,
        salonName: salon ? salon.name : "Salon",
        address: salon ? salon.address : "",
        position: q.position || 1,
        waitTime: q.estimatedWaitMins || 5,
        status: q.status,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET USER HISTORY FROM DB ───
app.get("/api/user/history", async (req, res) => {
  try {
    const historyList = await db.select().from(queues).orderBy(desc(queues.createdAt)).limit(5);
    const formatted = await Promise.all(historyList.map(async (q) => {
      const [salon] = await db.select().from(salons).where(eq(salons.id, q.salonId));
      return {
        id: q.id,
        salonName: salon ? salon.name : "Salon",
        service: salon ? `${salon.category || 'Haircut'} Service` : "Salon Service",
        date: new Date(q.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
        price: "₹350",
        status: q.status === "waiting" ? "Active" : q.status === "cancelled" ? "Cancelled" : "Completed",
      };
    }));
    res.json({ history: formatted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mobile API Server running on http://localhost:${PORT}`);
});
