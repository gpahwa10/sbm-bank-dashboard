import { Router, type IRouter } from "express";
import { db, onboardingRecordsTable, onboardingTasksTable, candidatesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  CreateOnboardingRecordBody,
  GetOnboardingRecordParams,
  ListOnboardingRecordsQueryParams,
  ListOnboardingTasksParams,
  UpdateOnboardingTaskBody,
  UpdateOnboardingTaskParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_TASKS = [
  { title: "Provision laptop and peripherals", category: "it_provisioning", daysFromStart: 0 },
  { title: "Create Active Directory account", category: "it_provisioning", daysFromStart: 0 },
  { title: "Set up corporate email", category: "it_provisioning", daysFromStart: 1 },
  { title: "Grant system access based on role", category: "access", daysFromStart: 2 },
  { title: "Complete HR induction form", category: "hr_admin", daysFromStart: 0 },
  { title: "Process payroll enrollment", category: "payroll", daysFromStart: 3 },
  { title: "Collect signed employment contract", category: "compliance", daysFromStart: 0 },
  { title: "Complete AML/KYC compliance training", category: "compliance", daysFromStart: 7 },
  { title: "Assign ID card and access badge", category: "access", daysFromStart: 1 },
];

async function enrichRecord(record: typeof onboardingRecordsTable.$inferSelect) {
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, record.candidateId));
  return {
    ...record,
    candidate: candidate ? { ...candidate, yearsOfExperience: candidate.yearsOfExperience != null ? Number(candidate.yearsOfExperience) : null, aiMatchScore: candidate.aiMatchScore != null ? Number(candidate.aiMatchScore) : null } : null,
  };
}

router.get("/onboarding", async (req, res): Promise<void> => {
  const query = ListOnboardingRecordsQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  const conditions = [];
  if (filters.status) conditions.push(eq(onboardingRecordsTable.status, filters.status));
  if (filters.candidateId) conditions.push(eq(onboardingRecordsTable.candidateId, filters.candidateId));

  const data = conditions.length
    ? await db.select().from(onboardingRecordsTable).where(and(...conditions)).orderBy(sql`${onboardingRecordsTable.createdAt} desc`)
    : await db.select().from(onboardingRecordsTable).orderBy(sql`${onboardingRecordsTable.createdAt} desc`);

  res.json(data);
});

router.post("/onboarding", async (req, res): Promise<void> => {
  const parsed = CreateOnboardingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const startDate = new Date(parsed.data.startDate);
  const totalTasks = DEFAULT_TASKS.length;

  const [record] = await db.insert(onboardingRecordsTable).values({
    ...parsed.data,
    status: "pending",
    completedTasks: 0,
    totalTasks,
  }).returning();

  // Create default tasks
  await Promise.all(
    DEFAULT_TASKS.map((task) => {
      const dueDate = new Date(startDate);
      dueDate.setDate(dueDate.getDate() + task.daysFromStart);
      return db.insert(onboardingTasksTable).values({
        onboardingId: record.id,
        title: task.title,
        category: task.category,
        status: "pending",
        dueDate: dueDate.toISOString().split("T")[0],
      });
    })
  );

  res.status(201).json(await enrichRecord(record));
});

router.get("/onboarding/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOnboardingRecordParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [record] = await db.select().from(onboardingRecordsTable).where(eq(onboardingRecordsTable.id, params.data.id));
  if (!record) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichRecord(record));
});

router.get("/onboarding/:id/tasks", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ListOnboardingTasksParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const tasks = await db.select().from(onboardingTasksTable).where(eq(onboardingTasksTable.onboardingId, params.data.id)).orderBy(sql`${onboardingTasksTable.dueDate} asc`);
  res.json(tasks);
});

router.patch("/onboarding/tasks/:taskId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
  const params = UpdateOnboardingTaskParams.safeParse({ taskId: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateOnboardingTaskBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [task] = await db.update(onboardingTasksTable).set(parsed.data).where(eq(onboardingTasksTable.id, params.data.taskId)).returning();
  if (!task) { res.status(404).json({ error: "Not found" }); return; }

  // Update completed task count
  const tasks = await db.select().from(onboardingTasksTable).where(eq(onboardingTasksTable.onboardingId, task.onboardingId));
  const completed = tasks.filter((t) => t.status === "completed").length;
  const overallStatus = completed === tasks.length ? "completed" : completed > 0 ? "in_progress" : "pending";

  await db.update(onboardingRecordsTable)
    .set({ completedTasks: completed, status: overallStatus })
    .where(eq(onboardingRecordsTable.id, task.onboardingId));

  res.json(task);
});

export default router;
