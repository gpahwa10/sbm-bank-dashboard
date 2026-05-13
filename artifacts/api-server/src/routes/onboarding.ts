import { Router, type IRouter } from "express";
import { db, onboardingRecordsTable, onboardingTasksTable, candidatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOnboardingRecordBody, ListOnboardingRecordsQueryParams, ListOnboardingTasksParams, UpdateOnboardingTaskBody, UpdateOnboardingTaskParams } from "@workspace/api-zod";

const router: IRouter = Router();

const toRecord = (r: typeof onboardingRecordsTable.$inferSelect) => ({
  ...r,
});

const toTask = (t: typeof onboardingTasksTable.$inferSelect) => ({
  ...t,
});

router.get("/onboarding", async (req, res): Promise<void> => {
  const query = ListOnboardingRecordsQueryParams.safeParse(req.query);
  let rows = await db.select().from(onboardingRecordsTable).orderBy(onboardingRecordsTable.startDate);
  if (query.success && query.data.status) {
    rows = rows.filter((r) => r.status === query.data.status);
  }
  res.json(rows.map(toRecord));
});

router.post("/onboarding", async (req, res): Promise<void> => {
  const parsed = CreateOnboardingRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, parsed.data.candidateId));
  const candidateName = candidate ? `${candidate.firstName} ${candidate.lastName}` : "Unknown";
  const [record] = await db.insert(onboardingRecordsTable)
    .values({ ...parsed.data, candidateName })
    .returning();
  const defaultTasks = [
    { title: "Complete onboarding form", category: "documentation", dueDate: parsed.data.startDate },
    { title: "IT equipment setup", category: "it_setup", dueDate: parsed.data.startDate },
    { title: "HR orientation session", category: "orientation", dueDate: parsed.data.startDate },
    { title: "Meet your team", category: "orientation", dueDate: parsed.data.startDate },
    { title: "Review company policies", category: "documentation", dueDate: parsed.data.startDate },
  ];
  for (const task of defaultTasks) {
    await db.insert(onboardingTasksTable).values({ recordId: record.id, ...task });
  }
  res.status(201).json(toRecord(record));
});

router.get("/onboarding/:recordId/tasks", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.recordId) ? req.params.recordId[0] : req.params.recordId;
  const recordId = parseInt(raw, 10);
  const tasks = await db.select().from(onboardingTasksTable).where(eq(onboardingTasksTable.recordId, recordId));
  res.json(tasks.map(toTask));
});

router.patch("/onboarding/tasks/:taskId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
  const taskId = parseInt(raw, 10);
  const parsed = UpdateOnboardingTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [task] = await db.update(onboardingTasksTable)
    .set(parsed.data)
    .where(eq(onboardingTasksTable.id, taskId))
    .returning();
  if (!task) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toTask(task));
});

export default router;
