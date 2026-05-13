import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUserBody } from "@workspace/api-zod";

const router: IRouter = Router();

const toUser = (u: typeof usersTable.$inferSelect) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
  department: u.department ?? null,
  jobGrade: u.jobGrade ?? null,
  status: u.status,
});

router.get("/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.name);
  res.json(users.map(toUser));
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { password: _pw, ...rest } = parsed.data;
  const [user] = await db.insert(usersTable).values({ ...rest, passwordHash: "admin123" }).returning();
  res.status(201).json(toUser(user));
});

export default router;
