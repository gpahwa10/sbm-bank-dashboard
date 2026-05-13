import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || password !== "admin123") {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = Buffer.from(`${user.id}:${user.email}`).toString("base64");
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department ?? null,
      jobGrade: user.jobGrade ?? null,
      status: user.status,
    },
  });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ ok: true });
});

export default router;
