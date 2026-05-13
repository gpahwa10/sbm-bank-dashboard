import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const interviewsTable = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  candidateName: text("candidate_name").notNull().default(""),
  jobTitle: text("job_title").notNull().default(""),
  type: text("type").notNull().default("screening"),
  scheduledAt: text("scheduled_at").notNull(),
  interviewers: text("interviewers").array().notNull().default([]),
  status: text("status").notNull().default("scheduled"),
  feedback: text("feedback"),
  rating: integer("rating"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInterviewSchema = createInsertSchema(interviewsTable).omit({ id: true, createdAt: true });
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviewsTable.$inferSelect;
