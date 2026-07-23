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

// ─── Haversine Distance Helper ───
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistanceLabel(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

// ─── SALONS LIST & NEARBY SEARCH (DB LIVE DATA) ───
app.get(["/api/salons", "/api/salons/nearby"], async (req, res) => {
  try {
    const userLat = req.query.lat ? parseFloat(req.query.lat as string) : null;
    const userLng = req.query.lng ? parseFloat(req.query.lng as string) : null;
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : 50; // default 50km
    const sort = (req.query.sort as string) || "distance";

    const allSalons = await db.select().from(salons);
    
    let salonsWithStatus = await Promise.all(allSalons.map(async (salon) => {
      const waiting = await db.select().from(queues).where(
        and(eq(queues.salonId, salon.id), eq(queues.status, "waiting"))
      );
      
      const waitingCount = waiting.length;
      const waitTime = waitingCount * 15; // 15 mins per waiting customer

      let queueStatus = "available";
      if (waitingCount >= 3) queueStatus = "busy";
      else if (waitingCount > 0) queueStatus = "finishing";

      const salonLat = salon.latitude ? parseFloat(salon.latitude.toString()) : null;
      const salonLng = salon.longitude ? parseFloat(salon.longitude.toString()) : null;

      let distanceKm: number | null = null;
      let formattedDistance = "Nearby";

      if (userLat !== null && userLng !== null && salonLat !== null && salonLng !== null) {
        distanceKm = calculateHaversineKm(userLat, userLng, salonLat, salonLng);
        formattedDistance = formatDistanceLabel(distanceKm);
      }

      return {
        ...salon,
        queueStatus,
        waitTime,
        waitingCount,
        latitude: salonLat,
        longitude: salonLng,
        distanceKm,
        formattedDistance,
      };
    }));

    // Filter by radius if user location provided
    if (userLat !== null && userLng !== null) {
      salonsWithStatus = salonsWithStatus.filter(
        (s) => s.distanceKm === null || s.distanceKm <= radius
      );
    }

    // Sort strategy
    salonsWithStatus.sort((a, b) => {
      if (sort === "wait") return a.waitTime - b.waitTime;
      if (sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
      
      // Default: distance
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return a.waitTime - b.waitTime;
    });

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

// ─── SALON OS API ROUTES (Web & Mobile Partner Portal) ───
import { getSalonOSData, addWalkInCustomer, calculateDynamicWaitTime } from "./salon-os";

app.get("/api/salon-os/dashboard", async (req, res) => {
  try {
    const salonId = req.query.salonId ? parseInt(req.query.salonId as string) : 1;
    const data = await getSalonOSData(salonId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/salon-os/walkin", async (req, res) => {
  try {
    const { salonId, customerName, phone, serviceId, staffId } = req.body;
    const result = await addWalkInCustomer({
      salonId: salonId || 1,
      customerName: customerName || "Walk-In Customer",
      phone,
      serviceId: serviceId || 1,
      staffId,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/salon-os/queue/action", async (req, res) => {
  try {
    const { queueId, action } = req.body;
    if (!queueId || !action) {
      return res.status(400).json({ error: "Missing queueId or action" });
    }
    await db.update(queues).set({ status: action }).where(eq(queues.id, queueId));
    res.json({ success: true, action });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mobile API Server running on http://localhost:${PORT}`);
});
