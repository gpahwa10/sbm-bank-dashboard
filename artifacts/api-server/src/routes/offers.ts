import { Router, type IRouter } from "express";
import { db, offersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOfferBody, ApproveOfferParams, ListOffersQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const toOffer = (o: typeof offersTable.$inferSelect) => ({
  ...o,
  baseSalary: parseFloat(String(o.baseSalary)),
  createdAt: o.createdAt.toISOString(),
});

router.get("/offers", async (req, res): Promise<void> => {
  const query = ListOffersQueryParams.safeParse(req.query);
  let rows = await db.select().from(offersTable).orderBy(offersTable.createdAt);
  if (query.success && query.data.status) {
    rows = rows.filter((o) => o.status === query.data.status);
  }
  res.json(rows.map(toOffer));
});

router.post("/offers", async (req, res): Promise<void> => {
  const parsed = CreateOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(offersTable).values({ ...parsed.data, candidateName: "Candidate", jobTitle: "Position" }).returning();
  res.status(201).json(toOffer(row));
});

router.post("/offers/:id/approve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [row] = await db.update(offersTable)
    .set({ status: "approved" })
    .where(eq(offersTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toOffer(row));
});

export default router;
