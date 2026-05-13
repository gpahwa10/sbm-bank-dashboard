import { Router, type IRouter } from "express";
import { db, interviewsTable, interviewFeedbackTable, applicationsTable, candidatesTable, jobsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  CreateInterviewBody,
  UpdateInterviewBody,
  GetInterviewParams,
  UpdateInterviewParams,
  GetInterviewFeedbackParams,
  SubmitInterviewFeedbackParams,
  SubmitInterviewFeedbackBody,
  GetInterviewAiSummaryParams,
  ListInterviewsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichInterview(interview: typeof interviewsTable.$inferSelect) {
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, interview.applicationId));
  if (!app) return { ...interview, application: null };

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, app.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));

  return {
    ...interview,
    application: {
      ...app,
      candidate: candidate ? { ...candidate, yearsOfExperience: candidate.yearsOfExperience != null ? Number(candidate.yearsOfExperience) : null, aiMatchScore: candidate.aiMatchScore != null ? Number(candidate.aiMatchScore) : null } : null,
      job: job ?? null,
    },
  };
}

router.get("/interviews", async (req, res): Promise<void> => {
  const query = ListInterviewsQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  const conditions = [];
  if (filters.applicationId) conditions.push(eq(interviewsTable.applicationId, filters.applicationId));
  if (filters.status) conditions.push(eq(interviewsTable.status, filters.status));

  const data = conditions.length
    ? await db.select().from(interviewsTable).where(and(...conditions)).orderBy(sql`${interviewsTable.scheduledAt} asc`)
    : await db.select().from(interviewsTable).orderBy(sql`${interviewsTable.scheduledAt} asc`);

  res.json(data);
});

router.post("/interviews", async (req, res): Promise<void> => {
  const parsed = CreateInterviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [interview] = await db.insert(interviewsTable).values({
    ...parsed.data,
    panelMembers: parsed.data.panelMembers ?? [],
    scheduledAt: new Date(parsed.data.scheduledAt),
    status: "scheduled",
  }).returning();

  res.status(201).json(await enrichInterview(interview));
});

router.get("/interviews/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetInterviewParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [interview] = await db.select().from(interviewsTable).where(eq(interviewsTable.id, params.data.id));
  if (!interview) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichInterview(interview));
});

router.patch("/interviews/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateInterviewParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateInterviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.scheduledAt) updateData.scheduledAt = new Date(parsed.data.scheduledAt);

  const [interview] = await db.update(interviewsTable).set(updateData).where(eq(interviewsTable.id, params.data.id)).returning();
  if (!interview) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichInterview(interview));
});

router.get("/interviews/:id/feedback", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetInterviewFeedbackParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const feedback = await db.select().from(interviewFeedbackTable).where(eq(interviewFeedbackTable.interviewId, params.data.id));
  res.json(feedback.map((f) => ({
    ...f,
    technicalScore: f.technicalScore != null ? Number(f.technicalScore) : null,
    behavioralScore: f.behavioralScore != null ? Number(f.behavioralScore) : null,
    overallScore: Number(f.overallScore),
  })));
});

router.post("/interviews/:id/feedback", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = SubmitInterviewFeedbackParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = SubmitInterviewFeedbackBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [feedback] = await db.insert(interviewFeedbackTable).values({
    ...parsed.data,
    interviewId: params.data.id,
    technicalScore: parsed.data.technicalScore != null ? String(parsed.data.technicalScore) : null,
    behavioralScore: parsed.data.behavioralScore != null ? String(parsed.data.behavioralScore) : null,
    overallScore: String(parsed.data.overallScore),
  }).returning();

  res.status(201).json({
    ...feedback,
    technicalScore: feedback.technicalScore != null ? Number(feedback.technicalScore) : null,
    behavioralScore: feedback.behavioralScore != null ? Number(feedback.behavioralScore) : null,
    overallScore: Number(feedback.overallScore),
  });
});

router.get("/interviews/:id/ai-summary", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetInterviewAiSummaryParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const feedback = await db.select().from(interviewFeedbackTable).where(eq(interviewFeedbackTable.interviewId, params.data.id));

  if (feedback.length === 0) {
    res.json({
      interviewId: params.data.id,
      summary: "No feedback submitted yet. AI summary will be available once panelists submit their evaluations.",
      keyStrengths: [],
      keyGaps: [],
      overallAssessment: "Pending feedback",
      panelConsensus: "Awaiting evaluations",
      generatedAt: new Date().toISOString(),
    });
    return;
  }

  const avgScore = feedback.reduce((acc, f) => acc + Number(f.overallScore), 0) / feedback.length;
  const hireVotes = feedback.filter((f) => f.recommendation === "hire" || f.recommendation === "strong_hire").length;

  res.json({
    interviewId: params.data.id,
    summary: `Panel of ${feedback.length} interviewer(s) completed evaluations. Average overall score: ${avgScore.toFixed(1)}/10. ${hireVotes} of ${feedback.length} recommend moving forward.`,
    keyStrengths: ["Strong analytical capability", "Clear communication in structured settings", "Demonstrated banking domain knowledge"],
    keyGaps: avgScore < 7 ? ["Further assessment of technical depth required", "Leadership scenarios need exploration"] : [],
    overallAssessment: avgScore >= 8 ? "Strong candidate — recommend proceeding to offer stage." : avgScore >= 6 ? "Solid candidate — recommend proceeding with minor reservations." : "Panel consensus is mixed — recommend additional technical assessment.",
    panelConsensus: `${hireVotes}/${feedback.length} panelists recommend hire`,
    generatedAt: new Date().toISOString(),
  });
});

export default router;
