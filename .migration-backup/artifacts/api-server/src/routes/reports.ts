import { Router, type IRouter } from "express";
import { GetHiringTrendsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reports/hiring-trends", async (req, res): Promise<void> => {
  const query = GetHiringTrendsQueryParams.safeParse(req.query);
  const months = query.success && query.data.months ? query.data.months : 6;

  const data = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toLocaleString("default", { month: "short", year: "2-digit" });
    data.push({
      month: monthStr,
      applications: Math.floor(80 + Math.random() * 80),
      hires: Math.floor(5 + Math.random() * 15),
    });
  }

  res.json(data);
});

router.get("/reports/source-effectiveness", async (_req, res): Promise<void> => {
  res.json([
    { source: "LinkedIn", applications: 312, hires: 28, conversionRate: 8.97 },
    { source: "Employee Referral", applications: 94, hires: 19, conversionRate: 20.21 },
    { source: "Company Portal", applications: 187, hires: 14, conversionRate: 7.49 },
    { source: "Job Boards", applications: 143, hires: 8, conversionRate: 5.59 },
    { source: "Recruitment Agency", applications: 67, hires: 11, conversionRate: 16.42 },
    { source: "Direct Application", applications: 54, hires: 4, conversionRate: 7.41 },
  ]);
});

router.get("/reports/recruiter-performance", async (_req, res): Promise<void> => {
  res.json([
    { recruiterName: "Sarah Okafor", openPositions: 8, candidatesManaged: 47, avgTimeToClose: 17.2, offersExtended: 6 },
    { recruiterName: "James Whitfield", openPositions: 6, candidatesManaged: 38, avgTimeToClose: 21.5, offersExtended: 4 },
    { recruiterName: "David Chen", openPositions: 5, candidatesManaged: 29, avgTimeToClose: 15.8, offersExtended: 5 },
    { recruiterName: "Priya Nair", openPositions: 7, candidatesManaged: 42, avgTimeToClose: 19.3, offersExtended: 5 },
    { recruiterName: "Michael Adeyemi", openPositions: 4, candidatesManaged: 22, avgTimeToClose: 24.1, offersExtended: 2 },
  ]);
});

router.get("/reports/offer-acceptance", async (_req, res): Promise<void> => {
  res.json([
    { department: "Risk & Compliance", offered: 14, accepted: 11, declined: 3, acceptanceRate: 78.6 },
    { department: "Treasury", offered: 9, accepted: 7, declined: 2, acceptanceRate: 77.8 },
    { department: "Retail Banking", offered: 18, accepted: 15, declined: 3, acceptanceRate: 83.3 },
    { department: "Operations", offered: 12, accepted: 9, declined: 3, acceptanceRate: 75.0 },
    { department: "IT", offered: 10, accepted: 8, declined: 2, acceptanceRate: 80.0 },
    { department: "Finance", offered: 7, accepted: 6, declined: 1, acceptanceRate: 85.7 },
    { department: "Legal", offered: 5, accepted: 4, declined: 1, acceptanceRate: 80.0 },
  ]);
});

export default router;
