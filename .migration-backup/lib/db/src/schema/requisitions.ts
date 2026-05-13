import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const requisitionsTable = pgTable("requisitions", {
  id: serial("id").primaryKey(),
  department: text("department").notNull(),
  jobTitle: text("job_title").notNull(),
  grade: text("grade").notNull(),
  budget: numeric("budget", { precision: 12, scale: 2 }),
  headcount: integer("headcount").notNull().default(1),
  justification: text("justification").notNull(),
  employmentType: text("employment_type").notNull().default("permanent"),
  location: text("location").notNull(),
  joiningDate: text("joining_date"),
  status: text("status").notNull().default("draft"),
  workflowStage: text("workflow_stage").notNull().default("pending_dept_approval"),
  currentApproverId: integer("current_approver_id"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const workflowHistoryTable = pgTable("workflow_history", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  step: text("step").notNull(),
  action: text("action").notNull(),
  approverId: integer("approver_id").notNull(),
  approverName: text("approver_name").notNull(),
  comments: text("comments"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRequisitionSchema = createInsertSchema(requisitionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRequisition = z.infer<typeof insertRequisitionSchema>;
export type Requisition = typeof requisitionsTable.$inferSelect;

export const insertWorkflowHistorySchema = createInsertSchema(workflowHistoryTable).omit({ id: true, timestamp: true });
export type InsertWorkflowHistory = z.infer<typeof insertWorkflowHistorySchema>;
export type WorkflowHistory = typeof workflowHistoryTable.$inferSelect;
