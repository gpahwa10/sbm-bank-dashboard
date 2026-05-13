import { Router, type IRouter } from "express";
import { db, auditLogsTable, notificationsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  ListAuditLogsQueryParams,
  ListNotificationsQueryParams,
  MarkNotificationReadParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/audit-logs", async (req, res): Promise<void> => {
  const query = ListAuditLogsQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  const conditions = [];
  if (filters.entityType) conditions.push(eq(auditLogsTable.entityType, filters.entityType));
  if (filters.userId) conditions.push(eq(auditLogsTable.userId, filters.userId));

  const data = conditions.length
    ? await db.select().from(auditLogsTable).where(and(...conditions)).orderBy(sql`${auditLogsTable.timestamp} desc`)
    : await db.select().from(auditLogsTable).orderBy(sql`${auditLogsTable.timestamp} desc`);

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 50;
  const start = (page - 1) * limit;
  const paged = data.slice(start, start + limit);

  res.json({ data: paged, total: data.length });
});

router.get("/notifications", async (req, res): Promise<void> => {
  const query = ListNotificationsQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  // Return notifications for user id=1 (current demo user)
  const conditions = [eq(notificationsTable.userId, 1)];
  if (filters.unreadOnly) conditions.push(eq(notificationsTable.read, "false"));

  const data = await db.select().from(notificationsTable).where(and(...conditions)).orderBy(sql`${notificationsTable.createdAt} desc`);

  res.json(data.map((n) => ({ ...n, read: n.read === "true" })));
});

router.post("/notifications/:id/read", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = MarkNotificationReadParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [notification] = await db.update(notificationsTable).set({ read: "true" }).where(eq(notificationsTable.id, params.data.id)).returning();
  if (!notification) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...notification, read: notification.read === "true" });
});

router.post("/notifications/read-all", async (_req, res): Promise<void> => {
  await db.update(notificationsTable).set({ read: "true" }).where(eq(notificationsTable.userId, 1));
  res.sendStatus(204);
});

export default router;
