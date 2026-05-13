import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const onboardingRecordsTable = pgTable("onboarding_records", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  candidateName: text("candidate_name").notNull().default(""),
  startDate: text("start_date").notNull(),
  status: text("status").notNull().default("pending"),
  department: text("department").notNull(),
  manager: text("manager"),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const onboardingTasksTable = pgTable("onboarding_tasks", {
  id: serial("id").primaryKey(),
  recordId: integer("record_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("pending"),
  dueDate: text("due_date").notNull(),
  completedAt: text("completed_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOnboardingRecordSchema = createInsertSchema(onboardingRecordsTable).omit({ id: true, createdAt: true });
export const insertOnboardingTaskSchema = createInsertSchema(onboardingTasksTable).omit({ id: true, createdAt: true });
export type InsertOnboardingRecord = z.infer<typeof insertOnboardingRecordSchema>;
export type InsertOnboardingTask = z.infer<typeof insertOnboardingTaskSchema>;
export type OnboardingRecord = typeof onboardingRecordsTable.$inferSelect;
export type OnboardingTask = typeof onboardingTasksTable.$inferSelect;
