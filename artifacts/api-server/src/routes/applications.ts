import { Router, type IRouter } from "express";
import { db, applicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { MoveApplicationStageBody, MoveApplicationStageParams, ListApplicationsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const toApp = (a: typeof applicationsTable.$inferSelect) => ({
  ...a,
  createdAt: a.createdAt.toISOString(),
});

router.get("/applications", async (req, res): Promise<void> => {
  const query = ListApplicationsQueryParams.safeParse(req.query);
  let rows = await db.select().from(applicationsTable).orderBy(applicationsTable.createdAt);
  if (query.success) {
    if (query.data.status) rows = rows.filter((a) => a.status === query.data.status);
    if (query.data.candidateId) rows = rows.filter((a) => a.candidateId === query.data.candidateId);
    if (query.data.jobId) rows = rows.filter((a) => a.jobId === query.data.jobId);
  }
  res.json(rows.map(toApp));
});

router.patch("/applications/:id/stage", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = MoveApplicationStageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(applicationsTable)
    .set({ stage: parsed.data.stage })
    .where(eq(applicationsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApp(row));
});

export default router;
