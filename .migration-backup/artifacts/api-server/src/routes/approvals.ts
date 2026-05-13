import { Router, type IRouter } from "express";
import { db, requisitionsTable, offersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/approvals/pending", async (_req, res): Promise<void> => {
  const pendingReqs = await db.select().from(requisitionsTable).where(eq(requisitionsTable.status, "submitted"));
  const pendingOffers = await db.select().from(offersTable).where(eq(offersTable.status, "pending_approval"));

  const now = new Date();

  const approvals = [
    ...pendingReqs.map((r) => ({
      id: r.id,
      entityType: "requisition",
      entityId: r.id,
      entityLabel: `${r.jobTitle} — ${r.department}`,
      requestedBy: "Hiring Manager",
      requestedAt: r.createdAt,
      stage: r.workflowStage,
      daysWaiting: Math.floor((now.getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    })),
    ...pendingOffers.map((o) => ({
      id: o.id + 10000,
      entityType: "offer",
      entityId: o.id,
      entityLabel: `Offer #${o.id} — ${o.currency} ${Number(o.totalPackage).toLocaleString()}`,
      requestedBy: "Recruiter",
      requestedAt: o.createdAt,
      stage: "finance_approval",
      daysWaiting: Math.floor((now.getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    })),
  ];

  res.json(approvals);
});

export default router;
