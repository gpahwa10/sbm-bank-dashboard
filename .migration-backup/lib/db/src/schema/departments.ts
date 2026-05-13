import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const departmentsTable = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  headCount: integer("head_count").notNull().default(0),
  headOfDepartment: text("head_of_department"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobGradesTable = pgTable("job_grades", {
  id: serial("id").primaryKey(),
  grade: text("grade").notNull(),
  band: text("band").notNull(),
  minSalary: text("min_salary").notNull(),
  maxSalary: text("max_salary").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDepartmentSchema = createInsertSchema(departmentsTable).omit({ id: true, createdAt: true });
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departmentsTable.$inferSelect;

export const insertJobGradeSchema = createInsertSchema(jobGradesTable).omit({ id: true, createdAt: true });
export type InsertJobGrade = z.infer<typeof insertJobGradeSchema>;
export type JobGrade = typeof jobGradesTable.$inferSelect;
