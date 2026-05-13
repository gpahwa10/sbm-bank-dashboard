import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ListNotificationsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const toNotif = (n: typeof notificationsTable.$inferSelect) => ({
  ...n,
  createdAt: n.createdAt.toISOString(),
});

router.get("/notifications", async (req, res): Promise<void> => {
  const query = ListNotificationsQueryParams.safeParse(req.query);
  let rows = await db.select().from(notificationsTable).orderBy(notificationsTable.createdAt);
  if (query.success && query.data.unread != null) {
    rows = rows.filter((n) => n.read === !query.data.unread);
  }
  res.json(rows.map(toNotif));
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [row] = await db.update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toNotif(row));
});

export default router;
