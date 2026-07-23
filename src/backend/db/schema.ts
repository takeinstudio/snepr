import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  json,
} from "drizzle-orm/pg-core";

// ─── Role type ────────────────────────────────────────────────────────────────
// super_admin > sub_admin > salon_owner > staff > customer

// ─── Cities ──────────────────────────────────────────────────────────────────
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  country: text("country").default("India").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  // Roles: super_admin | sub_admin | salon_owner | staff | customer
  role: text("role").default("customer").notNull(),
  // Scope restrictions
  cityId: integer("city_id").references(() => cities.id),      // sub_admin scope
  salonId: integer("salon_id"),                                 // salon_owner / staff scope (set after salon created)
  parentId: integer("parent_id"),                              // who created this user
  // Account state
  suspendedAt: timestamp("suspended_at"),
  suspendReason: text("suspend_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Salons ───────────────────────────────────────────────────────────────────
export const salons = pgTable("salons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  cityId: integer("city_id").references(() => cities.id),
  phone: text("phone"),
  email: text("email"),
  category: text("category"),
  rating: text("rating"),
  reviewCount: integer("review_count").default(0),
  ownerId: integer("owner_id").references(() => users.id),
  // Approval flow: pending | approved | rejected | suspended
  approvalStatus: text("approval_status").default("pending").notNull(),
  approvedById: integer("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  kycVerified: boolean("kyc_verified").default(false).notNull(),
  // Operational
  status: text("status").default("closed").notNull(), // open | closed
  openingHours: json("opening_hours"),                // { mon: { open: "09:00", close: "21:00" }, ... }
  location: text("location"),
  amenities: json("amenities"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Staff ────────────────────────────────────────────────────────────────────
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").default("barber").notNull(), // manager | barber
  workingHours: json("working_hours"),
  breakMode: boolean("break_mode").default(false).notNull(),
  leaveAt: timestamp("leave_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Services ─────────────────────────────────────────────────────────────────
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // paise
  durationMins: integer("duration_mins").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  discountPercent: integer("discount_percent").default(0),
});

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  customerId: integer("customer_id").references(() => users.id),
  staffId: integer("staff_id").references(() => staff.id),
  serviceId: integer("service_id").references(() => services.id),
  // Status: pending | confirmed | in_progress | completed | cancelled | no_show
  status: text("status").default("pending").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  totalPrice: integer("total_price"), // paise
  commissionAmount: integer("commission_amount"), // paise
  notes: text("notes"),
  disputeAt: timestamp("dispute_at"),
  disputeReason: text("dispute_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Queues ───────────────────────────────────────────────────────────────────
export const queues = pgTable("queues", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  customerId: integer("customer_id").references(() => users.id),
  staffId: integer("staff_id").references(() => staff.id),
  tokenNumber: integer("token_number").notNull(),
  status: text("status").default("waiting").notNull(), // waiting | in-progress | completed | cancelled | skipped
  estimatedWaitMins: integer("estimated_wait_mins"),
  calledAt: timestamp("called_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Commissions & Settlements ────────────────────────────────────────────────
export const settlements = pgTable("settlements", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  grossRevenue: integer("gross_revenue").notNull(), // paise
  commissionDeducted: integer("commission_deducted").notNull(),
  netPayable: integer("net_payable").notNull(),
  status: text("status").default("pending").notNull(), // pending | processing | paid
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // flat | percent
  value: integer("value").notNull(),
  minOrderValue: integer("min_order_value").default(0),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").default(0),
  cityId: integer("city_id").references(() => cities.id), // null = global
  createdById: integer("created_by_id").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Notifications (push campaigns) ──────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  targetRole: text("target_role"),       // null = all
  targetCityId: integer("target_city_id").references(() => cities.id),
  targetSalonId: integer("target_salon_id").references(() => salons.id),
  createdById: integer("created_by_id").references(() => users.id),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(),   // 1–5
  comment: text("comment"),
  ownerReply: text("owner_reply"),
  isFlagged: boolean("is_flagged").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Salon Media ─────────────────────────────────────────────────────────────
export const salonMedia = pgTable("salon_media", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  type: text("type").notNull(), // photo | banner
  url: text("url").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Waitlist (existing) ──────────────────────────────────────────────────────
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Email Logs (Admin Center) ────────────────────────────────────────────────
export const emailLogs = pgTable("email_logs", {
  id: serial("id").primaryKey(),
  fromIdentity: text("from_identity").notNull(),
  recipientType: text("recipient_type").notNull(),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").default("sent").notNull(), // sent | failed
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// ─── Inventory Management ─────────────────────────────────────────────────────
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Shampoos, Hair Colors, Creams, Consumables
  stockCount: integer("stock_count").default(0).notNull(),
  minThreshold: integer("min_threshold").default(5).notNull(),
  unitPrice: integer("unit_price").notNull(), // paise
  unit: text("unit").default("pcs").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Employee Payroll & Attendance ───────────────────────────────────────────
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  status: text("status").default("present").notNull(), // present | absent | half_day | leave
});

export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  month: text("month").notNull(), // YYYY-MM
  baseSalary: integer("base_salary").default(0).notNull(), // paise
  commissionAmount: integer("commission_amount").default(0).notNull(), // paise
  tips: integer("tips").default(0).notNull(), // paise
  incentives: integer("incentives").default(0).notNull(), // paise
  totalPaid: integer("total_paid").default(0).notNull(), // paise
  status: text("status").default("pending").notNull(), // pending | processed | paid
  paidAt: timestamp("paid_at"),
});

// ─── Subscriptions & Invoices ─────────────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  planTier: text("plan_tier").default("pro").notNull(), // basic | pro | enterprise
  status: text("status").default("active").notNull(), // active | trial | cancelled | past_due
  billingCycle: text("billing_cycle").default("monthly").notNull(),
  price: integer("price").notNull(), // paise
  nextBillingAt: timestamp("next_billing_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: integer("amount").notNull(), // paise
  pdfUrl: text("pdf_url"),
  status: text("status").default("paid").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Marketing & Promotions ───────────────────────────────────────────────────
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // sms | whatsapp | push | referral | loyalty
  audience: text("audience").default("all").notNull(),
  content: text("content").notNull(),
  sentCount: integer("sent_count").default(0).notNull(),
  conversionRate: text("conversion_rate").default("0%").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Multi-Branch Management ──────────────────────────────────────────────────
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  parentSalonId: integer("parent_salon_id").references(() => salons.id).notNull(),
  name: text("name").notNull(),
  cityId: integer("city_id").references(() => cities.id),
  address: text("address"),
  phone: text("phone"),
  revenue: integer("revenue").default(0).notNull(), // paise
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Salon Operating Settings ────────────────────────────────────────────────
export const salonSettings = pgTable("salon_settings", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull().unique(),
  autoAssignStaff: boolean("auto_assign_staff").default(true).notNull(),
  defaultWaitTimeBuffer: integer("default_wait_time_buffer").default(5).notNull(), // minutes
  maxQueueLength: integer("max_queue_length").default(30).notNull(),
  cancellationFeePercent: integer("cancellation_fee_percent").default(0).notNull(),
  allowWalkins: boolean("allow_walkins").default(true).notNull(),
  notifyProximityMins: integer("notify_proximity_mins").default(10).notNull(),
  isQueuePaused: boolean("is_queue_paused").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Calendar Exceptions & Blocked Dates ──────────────────────────────────────
export const calendarExceptions = pgTable("calendar_exceptions", {
  id: serial("id").primaryKey(),
  salonId: integer("salon_id").references(() => salons.id).notNull(),
  type: text("type").notNull(), // holiday | block_date | custom_hours
  date: text("date").notNull(), // YYYY-MM-DD
  description: text("description"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
