import { Router, type IRouter } from "express";
import { db, candidatesTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { CreateCandidateBody, GenerateCandidateAiAnalysisParams, ListCandidatesQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const toCandidate = (c: typeof candidatesTable.$inferSelect) => ({
  ...c,
  createdAt: c.createdAt.toISOString(),
});

router.get("/candidates", async (req, res): Promise<void> => {
  const query = ListCandidatesQueryParams.safeParse(req.query);
  let rows;
  if (query.success && query.data.search) {
    const s = `%${query.data.search}%`;
    rows = await db.select().from(candidatesTable).where(
      or(ilike(candidatesTable.firstName, s), ilike(candidatesTable.lastName, s), ilike(candidatesTable.email, s))
    );
  } else {
    rows = await db.select().from(candidatesTable).orderBy(candidatesTable.createdAt);
  }
  res.json({ data: rows.map(toCandidate), total: rows.length });
});

router.post("/candidates", async (req, res): Promise<void> => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(candidatesTable).values(parsed.data).returning();
  res.status(201).json(toCandidate(row));
});

router.post("/candidates/:id/ai-analysis", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const score = Math.floor(Math.random() * 40) + 60;
  const summaries = [
    "Strong communication skills and relevant industry experience.",
    "Excellent technical background with solid problem-solving abilities.",
    "Good cultural fit with demonstrated leadership potential.",
    "Meets core requirements; further assessment recommended.",
  ];
  const aiSummary = summaries[Math.floor(Math.random() * summaries.length)];
  const [row] = await db.update(candidatesTable)
    .set({ aiScore: score, aiSummary })
    .where(eq(candidatesTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toCandidate(row));
});

export default router;
