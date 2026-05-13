import { Router, type IRouter } from "express";
import { db, requisitionsTable, jobsTable, candidatesTable, interviewsTable, offersTable, applicationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [openReqs] = await db.select({ count: sql<number>`count(*)` }).from(requisitionsTable).where(eq(requisitionsTable.status, "pending"));
  const [activeJobs] = await db.select({ count: sql<number>`count(*)` }).from(jobsTable).where(eq(jobsTable.status, "active"));
  const [totalCandidates] = await db.select({ count: sql<number>`count(*)` }).from(candidatesTable);
  const [interviews] = await db.select({ count: sql<number>`count(*)` }).from(interviewsTable).where(eq(interviewsTable.status, "scheduled"));
  const [offers] = await db.select({ count: sql<number>`count(*)` }).from(offersTable);

  res.json({
    openRequisitions: Number(openReqs?.count ?? 0),
    activeJobs: Number(activeJobs?.count ?? 0),
    totalCandidates: Number(totalCandidates?.count ?? 0),
    interviewsThisWeek: Number(interviews?.count ?? 0),
    offersExtended: Number(offers?.count ?? 0),
    timeToHireAvg: 24.5,
  });
});

router.get("/dashboard/pipeline", async (_req, res): Promise<void> => {
  const stages = ["applied", "screening", "interview", "offer", "hired", "rejected"];
  const apps = await db.select().from(applicationsTable);
  const stats = stages.map((stage) => ({
    stage,
    count: apps.filter((a) => a.stage === stage).length,
  }));
  res.json(stats);
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const candidates = await db.select().from(candidatesTable).orderBy(candidatesTable.createdAt).limit(3);
  const apps = await db.select().from(applicationsTable).orderBy(applicationsTable.createdAt).limit(2);
  const activity = [
    ...candidates.map((c, i) => ({
      id: i + 1,
      type: "candidate_added",
      description: `New candidate ${c.firstName} ${c.lastName} added`,
      timestamp: c.createdAt.toISOString(),
    })),
    ...apps.map((a, i) => ({
      id: candidates.length + i + 1,
      type: "application_submitted",
      description: `${a.candidateName} applied for ${a.jobTitle}`,
      timestamp: a.createdAt.toISOString(),
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(activity);
});

export default router;
