import { Router, type IRouter } from "express";
import { GetHiringTrendsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reports/hiring-trends", async (req, res): Promise<void> => {
  const query = GetHiringTrendsQueryParams.safeParse(req.query);
  const months = (query.success && query.data.months) ? query.data.months : 6;
  const now = new Date();
  const trends = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const label = d.toLocaleString("default", { month: "short" });
    return {
      month: label,
      applications: Math.floor(Math.random() * 30) + 10,
      interviews: Math.floor(Math.random() * 15) + 5,
      offers: Math.floor(Math.random() * 8) + 2,
      hires: Math.floor(Math.random() * 5) + 1,
    };
  });
  res.json(trends);
});

router.get("/reports/source-effectiveness", async (_req, res): Promise<void> => {
  res.json([
    { source: "LinkedIn", candidates: 45, hires: 12, conversionRate: 26.7 },
    { source: "Referral", candidates: 20, hires: 8, conversionRate: 40.0 },
    { source: "Direct", candidates: 15, hires: 3, conversionRate: 20.0 },
    { source: "Agency", candidates: 10, hires: 2, conversionRate: 20.0 },
    { source: "Portal", candidates: 8, hires: 1, conversionRate: 12.5 },
  ]);
});

router.get("/reports/recruiter-performance", async (_req, res): Promise<void> => {
  res.json([
    { name: "Amaka Okonkwo", placements: 12, avgTimeToHire: 21.3, offerAcceptRate: 88.5 },
    { name: "Chidi Nwosu", placements: 9, avgTimeToHire: 27.8, offerAcceptRate: 77.8 },
    { name: "Fatima Bello", placements: 15, avgTimeToHire: 18.5, offerAcceptRate: 93.3 },
    { name: "Emeka Eze", placements: 7, avgTimeToHire: 32.1, offerAcceptRate: 71.4 },
  ]);
});

router.get("/reports/offer-acceptance", async (_req, res): Promise<void> => {
  res.json([
    { department: "Risk & Compliance", offered: 8, accepted: 7, declined: 1 },
    { department: "Technology", offered: 12, accepted: 10, declined: 2 },
    { department: "Finance", offered: 6, accepted: 5, declined: 1 },
    { department: "Operations", offered: 5, accepted: 4, declined: 1 },
    { department: "HR", offered: 3, accepted: 3, declined: 0 },
  ]);
});

export default router;
