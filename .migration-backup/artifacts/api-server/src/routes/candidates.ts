import { Router, type IRouter } from "express";
import { db, candidatesTable, aiAnalysesTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import {
  CreateCandidateBody,
  UpdateCandidateBody,
  GetCandidateParams,
  UpdateCandidateParams,
  DeleteCandidateParams,
  GetCandidateAiAnalysisParams,
  GenerateCandidateAiAnalysisParams,
  ListCandidatesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/candidates", async (req, res): Promise<void> => {
  const query = ListCandidatesQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  const conditions = [];
  if (filters.search) conditions.push(ilike(candidatesTable.firstName, `%${filters.search}%`));

  const data = conditions.length
    ? await db.select().from(candidatesTable).where(and(...conditions)).orderBy(sql`${candidatesTable.createdAt} desc`)
    : await db.select().from(candidatesTable).orderBy(sql`${candidatesTable.createdAt} desc`);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const start = (page - 1) * limit;
  const paged = data.slice(start, start + limit);

  res.json({
    data: paged.map((c) => ({
      ...c,
      yearsOfExperience: c.yearsOfExperience != null ? Number(c.yearsOfExperience) : null,
      aiMatchScore: c.aiMatchScore != null ? Number(c.aiMatchScore) : null,
    })),
    total: data.length,
  });
});

router.post("/candidates", async (req, res): Promise<void> => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [candidate] = await db.insert(candidatesTable).values({
    ...parsed.data,
    skills: parsed.data.skills ?? [],
    yearsOfExperience: parsed.data.yearsOfExperience != null ? String(parsed.data.yearsOfExperience) : null,
  }).returning();

  res.status(201).json({ ...candidate, yearsOfExperience: candidate.yearsOfExperience != null ? Number(candidate.yearsOfExperience) : null, aiMatchScore: null });
});

router.get("/candidates/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCandidateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!candidate) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...candidate, yearsOfExperience: candidate.yearsOfExperience != null ? Number(candidate.yearsOfExperience) : null, aiMatchScore: candidate.aiMatchScore != null ? Number(candidate.aiMatchScore) : null });
});

router.patch("/candidates/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateCandidateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateCandidateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [candidate] = await db.update(candidatesTable).set({
    ...parsed.data,
    yearsOfExperience: parsed.data.yearsOfExperience != null ? String(parsed.data.yearsOfExperience) : undefined,
  }).where(eq(candidatesTable.id, params.data.id)).returning();

  if (!candidate) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...candidate, yearsOfExperience: candidate.yearsOfExperience != null ? Number(candidate.yearsOfExperience) : null, aiMatchScore: candidate.aiMatchScore != null ? Number(candidate.aiMatchScore) : null });
});

router.delete("/candidates/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteCandidateParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [candidate] = await db.delete(candidatesTable).where(eq(candidatesTable.id, params.data.id)).returning();
  if (!candidate) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

router.get("/candidates/:id/ai-analysis", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCandidateAiAnalysisParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [analysis] = await db.select().from(aiAnalysesTable).where(eq(aiAnalysesTable.candidateId, params.data.id)).orderBy(sql`${aiAnalysesTable.generatedAt} desc`).limit(1);

  if (!analysis) {
    res.status(404).json({ error: "No AI analysis found. Trigger one using POST." });
    return;
  }

  res.json({
    candidateId: analysis.candidateId,
    summary: analysis.summary,
    matchScore: Number(analysis.matchScore),
    extractedSkills: analysis.extractedSkills,
    strengths: analysis.strengths,
    gaps: analysis.gaps,
    recommendation: analysis.recommendation,
    recommendationRationale: analysis.recommendationRationale,
    generatedAt: analysis.generatedAt,
  });
});

router.post("/candidates/:id/ai-analysis", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GenerateCandidateAiAnalysisParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!candidate) { res.status(404).json({ error: "Candidate not found" }); return; }

  // Simulated AI analysis result (in production, call OpenAI/Azure OpenAI)
  const matchScore = Math.floor(60 + Math.random() * 35);
  const recommendations = ["strong_hire", "hire", "maybe", "no_hire"] as const;
  const recommendation = matchScore >= 85 ? "strong_hire" : matchScore >= 70 ? "hire" : matchScore >= 55 ? "maybe" : "no_hire";

  const [analysis] = await db.insert(aiAnalysesTable).values({
    candidateId: params.data.id,
    summary: `${candidate.firstName} ${candidate.lastName} brings ${candidate.yearsOfExperience ?? "several"} years of experience in ${candidate.currentRole ?? "a relevant role"} at ${candidate.currentCompany ?? "a financial institution"}. The candidate demonstrates strong alignment with core competency requirements.`,
    matchScore: String(matchScore),
    extractedSkills: candidate.skills.length > 0 ? candidate.skills : ["Risk Management", "Financial Analysis", "Regulatory Compliance"],
    strengths: ["Strong regulatory compliance background", "Demonstrated experience in banking operations", "Solid quantitative skills"],
    gaps: matchScore < 80 ? ["Limited treasury exposure", "No direct team leadership experience"] : ["Minor gap in international markets experience"],
    recommendation,
    recommendationRationale: `This candidate matches ${matchScore}% of required competencies. ${recommendation === "strong_hire" ? "Highly recommended to proceed." : recommendation === "hire" ? "Recommended to proceed with standard process." : recommendation === "maybe" ? "Proceed with caution — gaps noted above require further assessment." : "Does not meet minimum requirements."}`,
  }).returning();

  // Update candidate match score
  await db.update(candidatesTable).set({ aiMatchScore: String(matchScore) }).where(eq(candidatesTable.id, params.data.id));

  res.json({
    candidateId: analysis.candidateId,
    summary: analysis.summary,
    matchScore: Number(analysis.matchScore),
    extractedSkills: analysis.extractedSkills,
    strengths: analysis.strengths,
    gaps: analysis.gaps,
    recommendation: analysis.recommendation,
    recommendationRationale: analysis.recommendationRationale,
    generatedAt: analysis.generatedAt,
  });
});

export default router;
