import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const interviewsTable = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  duration: integer("duration").notNull().default(60),
  type: text("type").notNull().default("behavioral"),
  status: text("status").notNull().default("scheduled"),
  location: text("location"),
  meetingUrl: text("meeting_url"),
  panelMembers: text("panel_members").array().notNull().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const interviewFeedbackTable = pgTable("interview_feedback", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").notNull(),
  interviewerName: text("interviewer_name").notNull(),
  technicalScore: numeric("technical_score", { precision: 3, scale: 1 }),
  behavioralScore: numeric("behavioral_score", { precision: 3, scale: 1 }),
  overallScore: numeric("overall_score", { precision: 3, scale: 1 }).notNull(),
  strengths: text("strengths"),
  concerns: text("concerns"),
  recommendation: text("recommendation").notNull(),
  comments: text("comments"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInterviewSchema = createInsertSchema(interviewsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviewsTable.$inferSelect;

export const insertInterviewFeedbackSchema = createInsertSchema(interviewFeedbackTable).omit({ id: true, createdAt: true });
export type InsertInterviewFeedback = z.infer<typeof insertInterviewFeedbackSchema>;
export type InterviewFeedback = typeof interviewFeedbackTable.$inferSelect;
