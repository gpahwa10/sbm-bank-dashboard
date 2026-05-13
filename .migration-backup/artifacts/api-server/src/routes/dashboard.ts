import { Router, type IRouter } from "express";
import { db, requisitionsTable, jobsTable, candidatesTable, applicationsTable, offersTable, auditLogsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/hr-summary", async (_req, res): Promise<void> => {
  const [openJobs] = await db.select({ count: count() }).from(jobsTable).where(eq(jobsTable.status, "active"));
  const [activeReqs] = await db.select({ count: count() }).from(requisitionsTable).where(eq(requisitionsTable.status, "submitted"));
  const [pipeline] = await db.select({ count: count() }).from(applicationsTable);
  const [pendingOffers] = await db.select({ count: count() }).from(offersTable).where(eq(offersTable.status, "pending_approval"));
  const [hiresThisMonth] = await db.select({ count: count() }).from(offersTable).where(eq(offersTable.status, "accepted"));

  res.json({
    openPositions: Number(openJobs.count),
    activeRequisitions: Number(activeReqs.count),
    candidatesInPipeline: Number(pipeline.count),
    offersPending: Number(pendingOffers.count),
    hiresThisMonth: Number(hiresThisMonth.count),
    applicationsThisWeek: 138,
    avgHiringDays: 19,
    recruiterWorkload: [
      { recruiterName: "Sarah Okafor", openPositions: 8, activeCandidates: 24 },
      { recruiterName: "James Whitfield", openPositions: 6, activeCandidates: 18 },
      { recruiterName: "David Chen", openPositions: 5, activeCandidates: 15 },
      { recruiterName: "Priya Nair", openPositions: 7, activeCandidates: 21 },
    ],
    applicationsByWeek: [
      { week: "W1 Apr", count: 89 },
      { week: "W2 Apr", count: 112 },
      { week: "W3 Apr", count: 98 },
      { week: "W4 Apr", count: 124 },
      { week: "W1 May", count: 138 },
    ],
  });
});

router.get("/dashboard/hiring-manager-summary", async (_req, res): Promise<void> => {
  const [pendingApprovals] = await db.select({ count: count() }).from(requisitionsTable).where(eq(requisitionsTable.status, "submitted"));
  const [shortlisted] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.stage, "shortlisted"));

  res.json({
    pendingApprovals: Number(pendingApprovals.count),
    pendingFeedback: 4,
    openRequisitions: Number(pendingApprovals.count),
    shortlistedCandidates: Number(shortlisted.count),
    agingRequisitions: [
      { id: 1, title: "Senior Risk Analyst", department: "Risk & Compliance", daysOpen: 34 },
      { id: 2, title: "Treasury Manager", department: "Treasury", daysOpen: 28 },
      { id: 3, title: "Operations Analyst", department: "Operations", daysOpen: 21 },
    ],
  });
});

router.get("/dashboard/executive-summary", async (_req, res): Promise<void> => {
  const [totalHires] = await db.select({ count: count() }).from(offersTable).where(eq(offersTable.status, "accepted"));

  res.json({
    avgTimeToHire: 19,
    offerAcceptanceRate: 78.4,
    slaComplianceRate: 82.1,
    totalHiresYTD: Number(totalHires.count) + 47,
    hiringByDepartment: [
      { department: "Risk & Compliance", count: 12 },
      { department: "Treasury", count: 8 },
      { department: "Retail Banking", count: 15 },
      { department: "Operations", count: 10 },
      { department: "IT", count: 9 },
      { department: "Finance", count: 6 },
      { department: "Legal", count: 4 },
    ],
  });
});

router.get("/dashboard/compliance-summary", async (_req, res): Promise<void> => {
  const recentLogs = await db.select().from(auditLogsTable).orderBy(sql`${auditLogsTable.timestamp} desc`).limit(10);

  res.json({
    slaBreaches: 7,
    overdueApprovals: 3,
    workflowBottlenecks: 2,
    recentAuditEvents: recentLogs.map((l) => ({
      id: l.id,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      userId: l.userId,
      userName: l.userName,
      details: l.details,
      ipAddress: l.ipAddress,
      timestamp: l.timestamp,
    })),
  });
});

router.get("/dashboard/pipeline-stats", async (_req, res): Promise<void> => {
  const stages = ["applied", "under_review", "longlisted", "shortlisted", "interview_scheduled", "interviewed", "offer_pending", "offered", "hired", "rejected"];
  const results = await Promise.all(
    stages.map(async (stage) => {
      const [row] = await db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.stage, stage));
      return { stage, count: Number(row.count) };
    })
  );
  res.json(results);
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const logs = await db.select().from(auditLogsTable).orderBy(sql`${auditLogsTable.timestamp} desc`).limit(20);
  res.json(
    logs.map((l) => ({
      id: l.id,
      action: l.action,
      entityType: l.entityType,
      entityLabel: `${l.entityType} #${l.entityId}`,
      userName: l.userName,
      timestamp: l.timestamp,
    }))
  );
});

export default router;
