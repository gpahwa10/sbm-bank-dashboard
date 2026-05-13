import { Router, type IRouter } from "express";
import { db, interviewsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateInterviewBody, UpdateInterviewBody, UpdateInterviewParams, SubmitInterviewFeedbackBody, SubmitInterviewFeedbackParams, ListInterviewsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const toInterview = (i: typeof interviewsTable.$inferSelect) => ({
  ...i,
});

router.get("/interviews", async (req, res): Promise<void> => {
  const query = ListInterviewsQueryParams.safeParse(req.query);
  let rows = await db.select().from(interviewsTable).orderBy(interviewsTable.scheduledAt);
  if (query.success) {
    if (query.data.applicationId) rows = rows.filter((i) => i.applicationId === query.data.applicationId);
    if (query.data.status) rows = rows.filter((i) => i.status === query.data.status);
  }
  res.json(rows.map(toInterview));
});

router.post("/interviews", async (req, res): Promise<void> => {
  const parsed = CreateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(interviewsTable).values(parsed.data).returning();
  res.status(201).json(toInterview(row));
});

router.patch("/interviews/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(interviewsTable).set(parsed.data).where(eq(interviewsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toInterview(row));
});

router.post("/interviews/:id/feedback", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = SubmitInterviewFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(interviewsTable)
    .set({ feedback: parsed.data.feedback, rating: parsed.data.rating, status: "completed" })
    .where(eq(interviewsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toInterview(row));
});

export default router;
