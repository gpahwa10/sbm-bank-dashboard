import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  currentRole: text("current_role"),
  currentCompany: text("current_company"),
  yearsOfExperience: numeric("years_of_experience", { precision: 4, scale: 1 }),
  skills: text("skills").array().notNull().default([]),
  source: text("source").notNull().default("direct"),
  resumeUrl: text("resume_url"),
  notes: text("notes"),
  tags: text("tags").array().notNull().default([]),
  aiMatchScore: numeric("ai_match_score", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const aiAnalysesTable = pgTable("ai_analyses", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  summary: text("summary").notNull(),
  matchScore: numeric("match_score", { precision: 5, scale: 2 }).notNull(),
  extractedSkills: text("extracted_skills").array().notNull().default([]),
  strengths: text("strengths").array().notNull().default([]),
  gaps: text("gaps").array().notNull().default([]),
  recommendation: text("recommendation").notNull(),
  recommendationRationale: text("recommendation_rationale").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;

export const insertAiAnalysisSchema = createInsertSchema(aiAnalysesTable).omit({ id: true, generatedAt: true });
export type InsertAiAnalysis = z.infer<typeof insertAiAnalysisSchema>;
export type AiAnalysis = typeof aiAnalysesTable.$inferSelect;
