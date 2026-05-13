import { Router, type IRouter } from "express";
import { db, applicationsTable, candidatesTable, jobsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  CreateApplicationBody,
  UpdateApplicationBody,
  GetApplicationParams,
  UpdateApplicationParams,
  MoveApplicationStageParams,
  MoveApplicationStageBody,
  ListApplicationsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichApplication(app: typeof applicationsTable.$inferSelect) {
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, app.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  return {
    ...app,
    candidate: candidate ? { ...candidate, yearsOfExperience: candidate.yearsOfExperience != null ? Number(candidate.yearsOfExperience) : null, aiMatchScore: candidate.aiMatchScore != null ? Number(candidate.aiMatchScore) : null } : null,
    job: job ?? null,
  };
}

router.get("/applications", async (req, res): Promise<void> => {
  const query = ListApplicationsQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  const conditions = [];
  if (filters.jobId) conditions.push(eq(applicationsTable.jobId, filters.jobId));
  if (filters.candidateId) conditions.push(eq(applicationsTable.candidateId, filters.candidateId));
  if (filters.stage) conditions.push(eq(applicationsTable.stage, filters.stage));

  const data = conditions.length
    ? await db.select().from(applicationsTable).where(and(...conditions)).orderBy(sql`${applicationsTable.appliedAt} desc`)
    : await db.select().from(applicationsTable).orderBy(sql`${applicationsTable.appliedAt} desc`);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const start = (page - 1) * limit;
  const paged = data.slice(start, start + limit);

  const enriched = await Promise.all(paged.map(enrichApplication));
  res.json({ data: enriched, total: data.length });
});

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [app] = await db.insert(applicationsTable).values({
    ...parsed.data,
    stage: "applied",
  }).returning();

  const enriched = await enrichApplication(app);
  res.status(201).json(enriched);
});

router.get("/applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetApplicationParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, params.data.id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichApplication(app));
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateApplicationParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [app] = await db.update(applicationsTable).set(parsed.data).where(eq(applicationsTable.id, params.data.id)).returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichApplication(app));
});

router.post("/applications/:id/move-stage", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = MoveApplicationStageParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = MoveApplicationStageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [app] = await db.update(applicationsTable)
    .set({ stage: parsed.data.stage, notes: parsed.data.notes ?? undefined })
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichApplication(app));
});

export default router;
