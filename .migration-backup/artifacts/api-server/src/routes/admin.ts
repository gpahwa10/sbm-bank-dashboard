import { Router, type IRouter } from "express";
import { db, departmentsTable, jobGradesTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateDepartmentBody,
  CreateUserBody,
  UpdateUserBody,
  UpdateUserParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/departments", async (_req, res): Promise<void> => {
  const data = await db.select().from(departmentsTable).orderBy(sql`${departmentsTable.name} asc`);
  res.json(data);
});

router.post("/admin/departments", async (req, res): Promise<void> => {
  const parsed = CreateDepartmentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [dept] = await db.insert(departmentsTable).values({ ...parsed.data, headCount: 0 }).returning();
  res.status(201).json(dept);
});

router.get("/admin/job-grades", async (_req, res): Promise<void> => {
  const data = await db.select().from(jobGradesTable).orderBy(sql`${jobGradesTable.grade} asc`);
  res.json(data.map((g) => ({ ...g, minSalary: Number(g.minSalary), maxSalary: Number(g.maxSalary) })));
});

router.get("/admin/users", async (_req, res): Promise<void> => {
  const data = await db.select().from(usersTable).orderBy(sql`${usersTable.name} asc`);
  res.json(data.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    isActive: u.isActive,
    createdAt: u.createdAt,
  })));
});

router.post("/admin/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [user] = await db.insert(usersTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    role: parsed.data.role,
    department: parsed.data.department ?? null,
    passwordHash: parsed.data.password,
    isActive: true,
  }).returning();

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
});

router.patch("/admin/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateUserParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
});

export default router;
