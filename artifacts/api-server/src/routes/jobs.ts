import { Router, type IRouter } from "express";
import { db, jobsTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import {
  CreateJobBody,
  UpdateJobBody,
  GetJobParams,
  UpdateJobParams,
  DeleteJobParams,
  ListJobsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/jobs", async (req, res): Promise<void> => {
  const query = ListJobsQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  const conditions = [];
  if (filters.status) conditions.push(eq(jobsTable.status, filters.status));
  if (filters.type) conditions.push(eq(jobsTable.type, filters.type));
  if (filters.department) conditions.push(eq(jobsTable.department, filters.department));
  if (filters.search) conditions.push(ilike(jobsTable.title, `%${filters.search}%`));

  const data = conditions.length
    ? await db.select().from(jobsTable).where(and(...conditions)).orderBy(sql`${jobsTable.createdAt} desc`)
    : await db.select().from(jobsTable).orderBy(sql`${jobsTable.createdAt} desc`);

  res.json(data);
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [job] = await db.insert(jobsTable).values({
    ...parsed.data,
    competencies: parsed.data.competencies ?? [],
    status: "active",
  }).returning();

  res.status(201).json(job);
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.json(job);
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [job] = await db.update(jobsTable).set(parsed.data).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.json(job);
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteJobParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
