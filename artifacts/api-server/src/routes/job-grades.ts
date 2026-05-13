import { Router, type IRouter } from "express";
import { db, jobGradesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/job-grades", async (_req, res): Promise<void> => {
  const grades = await db.select().from(jobGradesTable).orderBy(jobGradesTable.grade);
  res.json(grades);
});

export default router;
