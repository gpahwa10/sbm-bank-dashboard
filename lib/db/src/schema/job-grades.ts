import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobGradesTable = pgTable("job_grades", {
  id: serial("id").primaryKey(),
  grade: text("grade").notNull().unique(),
  title: text("title").notNull(),
});

export const insertJobGradeSchema = createInsertSchema(jobGradesTable).omit({ id: true });
export type InsertJobGrade = z.infer<typeof insertJobGradeSchema>;
export type JobGrade = typeof jobGradesTable.$inferSelect;
