import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import requisitionsRouter from "./requisitions";
import jobsRouter from "./jobs";
import candidatesRouter from "./candidates";
import applicationsRouter from "./applications";
import interviewsRouter from "./interviews";
import offersRouter from "./offers";
import onboardingRouter from "./onboarding";
import auditRouter from "./audit";
import approvalsRouter from "./approvals";
import reportsRouter from "./reports";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(requisitionsRouter);
router.use(jobsRouter);
router.use(candidatesRouter);
router.use(applicationsRouter);
router.use(interviewsRouter);
router.use(offersRouter);
router.use(onboardingRouter);
router.use(auditRouter);
router.use(approvalsRouter);
router.use(reportsRouter);
router.use(adminRouter);

export default router;
