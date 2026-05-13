import { Router, type IRouter } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListAuditLogsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/compliance/dashboard", async (_req, res): Promise<void> => {
  res.json({
    complianceScore: 94.2,
    openIssues: 3,
    resolvedThisMonth: 8,
    pendingReview: 5,
  });
});

router.get("/compliance/audit-logs", async (req, res): Promise<void> => {
  const query = ListAuditLogsQueryParams.safeParse(req.query);
  let rows = await db.select().from(auditLogsTable).orderBy(auditLogsTable.createdAt);
  if (query.success) {
    if (query.data.action) rows = rows.filter((r) => r.action === query.data.action);
    if (query.data.userId) rows = rows.filter((r) => r.userId === query.data.userId);
  }
  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

export default router;
