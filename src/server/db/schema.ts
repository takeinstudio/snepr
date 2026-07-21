import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Raw password for MVP
  role: text("role").default("subadmin").notNull(), // 'admin' | 'subadmin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salons = pgTable("salons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  category: text("category"), // e.g., Beauty Parlour, Barber Shop
  rating: text("rating"), // Storing as text (e.g. "4.8") for simplicity or numeric
  reviewCount: integer("review_count").default(0),
  status: text("status").default("open").notNull(), // 'open' | 'closed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id")
    .references(() => salons.id)
    .notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // stored in cents/paise
  durationMins: integer("duration_mins").notNull(),
});

export const queues = pgTable("queues", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id")
    .references(() => salons.id)
    .notNull(),
  tokenNumber: integer("token_number").notNull(),
  status: text("status").default("waiting").notNull(), // 'waiting' | 'in-progress' | 'completed' | 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
