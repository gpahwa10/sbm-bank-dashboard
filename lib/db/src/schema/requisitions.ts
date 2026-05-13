import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const requisitionsTable = pgTable("requisitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  status: text("status").notNull().default("pending"),
  requestedBy: text("requested_by").notNull(),
  approvedBy: text("approved_by"),
  justification: text("justification"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
});

export const insertRequisitionSchema = createInsertSchema(requisitionsTable).omit({ id: true, createdAt: true });
export type InsertRequisition = z.infer<typeof insertRequisitionSchema>;
export type Requisition = typeof requisitionsTable.$inferSelect;
