import { Router, type IRouter } from "express";
import { db, requisitionsTable, workflowHistoryTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  CreateRequisitionBody,
  UpdateRequisitionBody,
  GetRequisitionParams,
  UpdateRequisitionParams,
  DeleteRequisitionParams,
  ApproveRequisitionParams,
  ApproveRequisitionBody,
  GetRequisitionWorkflowHistoryParams,
  ListRequisitionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/requisitions", async (req, res): Promise<void> => {
  const query = ListRequisitionsQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  let q = db.select().from(requisitionsTable);
  const conditions = [];
  if (filters.status) conditions.push(eq(requisitionsTable.status, filters.status));
  if (filters.department) conditions.push(eq(requisitionsTable.department, filters.department));

  const data = conditions.length
    ? await db.select().from(requisitionsTable).where(and(...conditions)).orderBy(sql`${requisitionsTable.createdAt} desc`)
    : await db.select().from(requisitionsTable).orderBy(sql`${requisitionsTable.createdAt} desc`);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const start = (page - 1) * limit;
  const paged = data.slice(start, start + limit);

  res.json({ data: paged, total: data.length });
});

router.post("/requisitions", async (req, res): Promise<void> => {
  const parsed = CreateRequisitionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [req_] = await db
    .insert(requisitionsTable)
    .values({
      ...parsed.data,
      budget: parsed.data.budget != null ? String(parsed.data.budget) : null,
      status: "submitted",
      workflowStage: "pending_dept_approval",
      createdById: 1,
    })
    .returning();

  res.status(201).json(req_);
});

router.get("/requisitions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetRequisitionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [item] = await db.select().from(requisitionsTable).where(eq(requisitionsTable.id, params.data.id));
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.patch("/requisitions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateRequisitionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateRequisitionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [item] = await db.update(requisitionsTable).set(parsed.data).where(eq(requisitionsTable.id, params.data.id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

router.delete("/requisitions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteRequisitionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [item] = await db.delete(requisitionsTable).where(eq(requisitionsTable.id, params.data.id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

router.post("/requisitions/:id/approve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ApproveRequisitionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = ApproveRequisitionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const newStatus = parsed.data.action === "approve" ? "approved" : "rejected";
  const [item] = await db.update(requisitionsTable)
    .set({ status: newStatus, workflowStage: `${newStatus}_by_hr` })
    .where(eq(requisitionsTable.id, params.data.id))
    .returning();

  if (!item) { res.status(404).json({ error: "Not found" }); return; }

  await db.insert(workflowHistoryTable).values({
    entityType: "requisition",
    entityId: params.data.id,
    step: "hr_review",
    action: parsed.data.action,
    approverId: 1,
    approverName: "Sarah Okafor (HR Admin)",
    comments: parsed.data.comments ?? null,
  });

  res.json(item);
});

router.get("/requisitions/:id/workflow-history", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetRequisitionWorkflowHistoryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const history = await db.select().from(workflowHistoryTable)
    .where(and(eq(workflowHistoryTable.entityType, "requisition"), eq(workflowHistoryTable.entityId, params.data.id)))
    .orderBy(sql`${workflowHistoryTable.timestamp} asc`);

  res.json(history);
});

export default router;
