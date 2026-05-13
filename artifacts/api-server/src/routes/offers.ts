import { Router, type IRouter } from "express";
import { db, offersTable, applicationsTable, candidatesTable, jobsTable, workflowHistoryTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  CreateOfferBody,
  UpdateOfferBody,
  GetOfferParams,
  UpdateOfferParams,
  ApproveOfferParams,
  ApproveOfferBody,
  ListOffersQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichOffer(offer: typeof offersTable.$inferSelect) {
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, offer.applicationId));
  if (!app) return { ...offer, application: null };
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, app.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  return {
    ...offer,
    baseSalary: Number(offer.baseSalary),
    allowances: Number(offer.allowances),
    bonus: offer.bonus != null ? Number(offer.bonus) : null,
    totalPackage: Number(offer.totalPackage),
    application: {
      ...app,
      candidate: candidate ? { ...candidate, yearsOfExperience: candidate.yearsOfExperience != null ? Number(candidate.yearsOfExperience) : null, aiMatchScore: candidate.aiMatchScore != null ? Number(candidate.aiMatchScore) : null } : null,
      job: job ?? null,
    },
  };
}

router.get("/offers", async (req, res): Promise<void> => {
  const query = ListOffersQueryParams.safeParse(req.query);
  const filters = query.success ? query.data : {};

  const conditions = [];
  if (filters.status) conditions.push(eq(offersTable.status, filters.status));
  if (filters.applicationId) conditions.push(eq(offersTable.applicationId, filters.applicationId));

  const data = conditions.length
    ? await db.select().from(offersTable).where(and(...conditions)).orderBy(sql`${offersTable.createdAt} desc`)
    : await db.select().from(offersTable).orderBy(sql`${offersTable.createdAt} desc`);

  res.json(data.map((o) => ({ ...o, baseSalary: Number(o.baseSalary), allowances: Number(o.allowances), bonus: o.bonus != null ? Number(o.bonus) : null, totalPackage: Number(o.totalPackage) })));
});

router.post("/offers", async (req, res): Promise<void> => {
  const parsed = CreateOfferBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const totalPackage = parsed.data.baseSalary + parsed.data.allowances + (parsed.data.bonus ?? 0);

  const [offer] = await db.insert(offersTable).values({
    ...parsed.data,
    baseSalary: String(parsed.data.baseSalary),
    allowances: String(parsed.data.allowances),
    bonus: parsed.data.bonus != null ? String(parsed.data.bonus) : null,
    totalPackage: String(totalPackage),
    status: "draft",
  }).returning();

  res.status(201).json(await enrichOffer(offer));
});

router.get("/offers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOfferParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [offer] = await db.select().from(offersTable).where(eq(offersTable.id, params.data.id));
  if (!offer) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichOffer(offer));
});

router.patch("/offers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateOfferParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateOfferBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.baseSalary != null) updateData.baseSalary = String(parsed.data.baseSalary);
  if (parsed.data.allowances != null) updateData.allowances = String(parsed.data.allowances);
  if (parsed.data.bonus != null) updateData.bonus = String(parsed.data.bonus);

  const [offer] = await db.update(offersTable).set(updateData).where(eq(offersTable.id, params.data.id)).returning();
  if (!offer) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichOffer(offer));
});

router.post("/offers/:id/approve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ApproveOfferParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = ApproveOfferBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const newStatus = parsed.data.action === "approve" ? "approved" : "withdrawn";
  const [offer] = await db.update(offersTable).set({ status: newStatus }).where(eq(offersTable.id, params.data.id)).returning();
  if (!offer) { res.status(404).json({ error: "Not found" }); return; }

  await db.insert(workflowHistoryTable).values({
    entityType: "offer",
    entityId: params.data.id,
    step: "finance_approval",
    action: parsed.data.action,
    approverId: 1,
    approverName: "Finance Approver",
    comments: parsed.data.comments ?? null,
  });

  res.json(await enrichOffer(offer));
});

export default router;
