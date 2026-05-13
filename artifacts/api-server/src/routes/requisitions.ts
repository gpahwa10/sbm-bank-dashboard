import { Router, type IRouter } from "express";
import { db, requisitionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateRequisitionBody, ListRequisitionsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const toReq = (r: typeof requisitionsTable.$inferSelect) => ({
  ...r,
  createdAt: r.createdAt.toISOString(),
  approvedAt: r.approvedAt?.toISOString() ?? null,
});

router.get("/requisitions", async (req, res): Promise<void> => {
  const query = ListRequisitionsQueryParams.safeParse(req.query);
  let rows = await db.select().from(requisitionsTable).orderBy(requisitionsTable.createdAt);
  if (query.success && query.data.status) {
    rows = rows.filter((r) => r.status === query.data.status);
  }
  res.json(rows.map(toReq));
});

router.post("/requisitions", async (req, res): Promise<void> => {
  const parsed = CreateRequisitionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(requisitionsTable).values({ ...parsed.data, requestedBy: "HR Admin" }).returning();
  res.status(201).json(toReq(row));
});

router.post("/requisitions/:id/approve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [row] = await db.update(requisitionsTable)
    .set({ status: "approved", approvedBy: "HR Admin", approvedAt: new Date() })
    .where(eq(requisitionsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toReq(row));
});

export default router;
