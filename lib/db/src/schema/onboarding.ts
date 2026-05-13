import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const onboardingRecordsTable = pgTable("onboarding_records", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  startDate: text("start_date").notNull(),
  department: text("department").notNull(),
  manager: text("manager"),
  status: text("status").notNull().default("pending"),
  completedTasks: integer("completed_tasks").notNull().default(0),
  totalTasks: integer("total_tasks").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const onboardingTasksTable = pgTable("onboarding_tasks", {
  id: serial("id").primaryKey(),
  onboardingId: integer("onboarding_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("pending"),
  assignee: text("assignee"),
  dueDate: text("due_date").notNull(),
  completedAt: text("completed_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOnboardingRecordSchema = createInsertSchema(onboardingRecordsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOnboardingRecord = z.infer<typeof insertOnboardingRecordSchema>;
export type OnboardingRecord = typeof onboardingRecordsTable.$inferSelect;

export const insertOnboardingTaskSchema = createInsertSchema(onboardingTasksTable).omit({ id: true, createdAt: true });
export type InsertOnboardingTask = z.infer<typeof insertOnboardingTaskSchema>;
export type OnboardingTask = typeof onboardingTasksTable.$inferSelect;
