import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import departmentsRouter from "./departments";
import jobGradesRouter from "./job-grades";
import jobsRouter from "./jobs";
import requisitionsRouter from "./requisitions";
import candidatesRouter from "./candidates";
import applicationsRouter from "./applications";
import interviewsRouter from "./interviews";
import offersRouter from "./offers";
import onboardingRouter from "./onboarding";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";
import complianceRouter from "./compliance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(departmentsRouter);
router.use(jobGradesRouter);
router.use(jobsRouter);
router.use(requisitionsRouter);
router.use(candidatesRouter);
router.use(applicationsRouter);
router.use(interviewsRouter);
router.use(offersRouter);
router.use(onboardingRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(reportsRouter);
router.use(complianceRouter);

export default router;
