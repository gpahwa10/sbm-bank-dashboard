import { Router, type IRouter } from "express";
import { db, jobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateJobBody, UpdateJobBody, UpdateJobParams, ListJobsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/jobs", async (req, res): Promise<void> => {
  const query = ListJobsQueryParams.safeParse(req.query);
  let rows = await db.select().from(jobsTable).orderBy(jobsTable.createdAt);
  if (query.success && query.data.status) {
    rows = rows.filter((j) => j.status === query.data.status);
  }
  res.json(rows.map((j) => ({ ...j, createdAt: j.createdAt.toISOString() })));
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [job] = await db.insert(jobsTable).values(parsed.data).returning();
  res.status(201).json({ ...job, createdAt: job.createdAt.toISOString() });
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [job] = await db.update(jobsTable).set(parsed.data).where(eq(jobsTable.id, id)).returning();
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...job, createdAt: job.createdAt.toISOString() });
});

export default router;
