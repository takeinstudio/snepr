import nodemailer from "nodemailer";
import { db } from "./db";
import { emailLogs } from "./db/schema";
import { desc, sql, gte, eq } from "drizzle-orm";

// ─── Brevo SMTP Transporter Configuration ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER || "b2fb80001@smtp-brevo.com",
    pass: process.env.SMTP_PASS,
  },
});

export interface SendEmailPayload {
  fromIdentity: string;
  recipientType: "single" | "customers" | "salons" | "broadcast";
  toEmail: string;
  subject: string;
  body: string;
}

function parseFromIdentity(input: string): { name: string; email: string } {
  if (!input) return { name: "Snepr Support", email: "support@snepr.in" };

  const angleMatch = input.match(/^(.*?)\s*<([^>]+)>$/);
  if (angleMatch) {
    return { name: angleMatch[1].replace(/["']/g, "").trim() || "Snepr Support", email: angleMatch[2].trim() };
  }

  const parenMatch = input.match(/^(.*?)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    return { name: parenMatch[1].replace(/["']/g, "").trim() || "Snepr Support", email: parenMatch[2].trim() };
  }

  if (input.includes("@")) {
    return { name: "Snepr Support", email: input.trim() };
  }

  return { name: "Snepr Support", email: "support@snepr.in" };
}

export async function sendEmailDirectly(payload: SendEmailPayload) {
  const { fromIdentity, recipientType, toEmail, subject, body } = payload;
  
  const { name, email: senderEmail } = parseFromIdentity(fromIdentity);
  const formattedFrom = `"${name}" <${senderEmail}>`;

  // Determine recipients list
  let recipients: string[] = [];
  if (recipientType === "single") {
    if (!toEmail) throw new Error("Recipient email address is required for single email.");
    recipients = [toEmail.trim()];
  } else {
    // For customers, salons or broadcast, send to provided email or list
    recipients = toEmail ? toEmail.split(",").map(e => e.trim()).filter(Boolean) : [toEmail];
  }

  const results = [];

  for (const targetEmail of recipients) {
    let status = "sent";
    let errorMessage: string | null = null;

    try {
      if (process.env.SMTP_PASS) {
        await transporter.sendMail({
          from: formattedFrom,
          replyTo: `"${name}" <${senderEmail}>`,
          to: targetEmail,
          subject: subject,
          html: body,
          envelope: {
            from: process.env.SMTP_USER || "b2fb80001@smtp-brevo.com",
            to: targetEmail,
          },
        });
      } else {
        console.log(`[SMTP SIMULATOR] Email to ${targetEmail} | Subject: ${subject}`);
      }
    } catch (err: any) {
      console.error(`[SMTP ERROR] Delivery failed to ${targetEmail}:`, err);
      status = "failed";
      errorMessage = err.message || "Delivery failed via Brevo SMTP";
    }

    // Save log to DB
    try {
      await db.insert(emailLogs).values({
        fromIdentity,
        recipientType,
        toEmail: targetEmail,
        subject,
        body,
        status,
        errorMessage,
      });
    } catch (dbErr) {
      console.error("[DB ERROR] Failed to save email log:", dbErr);
    }

    results.push({ email: targetEmail, status, errorMessage });
  }

  const failedCount = results.filter(r => r.status === "failed").length;
  if (failedCount === results.length && results.length > 0) {
    throw new Error(results[0].errorMessage || "Failed to deliver email via Brevo SMTP.");
  }

  return {
    success: true,
    totalSent: results.length - failedCount,
    totalFailed: failedCount,
    results,
  };
}

export async function getEmailStats() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [sentTodayRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailLogs)
      .where(gte(emailLogs.sentAt, todayStart));

    const [sentMonthRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailLogs)
      .where(gte(emailLogs.sentAt, monthStart));

    const [failedRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailLogs)
      .where(eq(emailLogs.status, "failed"));

    const [totalRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailLogs);

    const totalCount = Number(totalRes?.count || 0);
    const failedCount = Number(failedRes?.count || 0);
    const successCount = totalCount - failedCount;
    const successRate = totalCount > 0 ? `${Math.round((successCount / totalCount) * 100)}%` : "100%";

    const recentLogs = await db
      .select()
      .from(emailLogs)
      .orderBy(desc(emailLogs.sentAt))
      .limit(50);

    return {
      sentToday: Number(sentTodayRes?.count || 0),
      sentThisMonth: Number(sentMonthRes?.count || 0),
      successRate,
      failedDeliveries: failedCount,
      history: recentLogs,
    };
  } catch (e) {
    return {
      sentToday: 0,
      sentThisMonth: 0,
      successRate: "100%",
      failedDeliveries: 0,
      history: [],
    };
  }
}
