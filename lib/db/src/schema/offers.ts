import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  applicationId: integer("application_id").notNull(),
  candidateName: text("candidate_name").notNull(),
  jobTitle: text("job_title").notNull(),
  department: text("department").notNull().default(""),
  status: text("status").notNull().default("pending"),
  baseSalary: numeric("base_salary").notNull(),
  currency: text("currency").notNull().default("NGN"),
  startDate: text("start_date"),
  expiresAt: text("expires_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, createdAt: true });
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
