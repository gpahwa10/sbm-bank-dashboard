import { useMockStore } from "./mock-store";
export type { User, OnboardingRecord } from "./mock-store";

const noop = () => {};
const makeQuery = <T>(data: T) => ({ data, refetch: noop, isLoading: false });
const makeMutation = <TArgs, TResult>(fn: (args: TArgs) => TResult) => ({
  mutateAsync: async (args: TArgs): Promise<TResult> => fn(args),
  isPending: false,
});

// Auth
export function useLogin() {
  const users = useMockStore((s) => s.users);
  return makeMutation(({ data }: { data: { email: string; password: string } }) => {
    const user = users.find((u) => u.email === data.email);
    if (!user || data.password !== "admin123") throw new Error("Invalid credentials");
    const token = btoa(`${user.id}:${user.email}`);
    return { token, user };
  });
}

export function useLogout() {
  return makeMutation(() => undefined);
}

// Dashboard
export function useGetHrDashboard() {
  const jobs = useMockStore((s) => s.jobs);
  const requisitions = useMockStore((s) => s.requisitions);
  const candidates = useMockStore((s) => s.candidates);
  const offers = useMockStore((s) => s.offers);
  const interviews = useMockStore((s) => s.interviews);
  return makeQuery({
    openPositions: jobs.filter((j) => j.status === "active").length,
    activeRequisitions: requisitions.filter((r) => r.status === "submitted" || r.status === "approved").length,
    candidatesInPipeline: candidates.length,
    offersPending: offers.filter((o) => o.status === "pending_approval").length,
    hiresThisMonth: offers.filter((o) => o.status === "accepted").length,
    avgHiringDays: 24,
    recruiterWorkload: [
      { recruiterName: "Amaka Okonkwo", openPositions: 4, activeCandidates: 12 },
      { recruiterName: "Fatima Bello", openPositions: 3, activeCandidates: 9 },
      { recruiterName: "Emeka Eze", openPositions: 2, activeCandidates: 6 },
    ],
  });
}

export function useGetPipelineStats() {
  const applications = useMockStore((s) => s.applications);
  const stages = ["applied", "under_review", "longlisted", "shortlisted", "interview_scheduled", "interviewed", "offer_pending", "hired", "rejected"];
  return makeQuery(stages.map((stage) => ({ stage, count: applications.filter((a) => a.stage === stage).length })));
}

export function useGetRecentActivity() {
  const auditLogs = useMockStore((s) => s.auditLogs);
  return makeQuery(
    auditLogs.slice(0, 8).map((l) => ({
      id: l.id,
      action: l.action,
      entityLabel: `${l.entityType} #${l.entityId}`,
      userName: l.userName,
      timestamp: l.timestamp,
    }))
  );
}

// Users
export function useListUsers() {
  const users = useMockStore((s) => s.users);
  return makeQuery(users);
}

export function useCreateUser() {
  const addUser = useMockStore((s) => s.addUser);
  return makeMutation(({ data }: { data: { name: string; email: string; role: string; department?: string } }) => {
    const user = { ...data, id: 0, isActive: true, department: data.department ?? null };
    addUser(user);
    return user;
  });
}

// Departments
export function useListDepartments() {
  const departments = useMockStore((s) => s.departments);
  return makeQuery(departments);
}

export function useCreateDepartment() {
  const addDepartment = useMockStore((s) => s.addDepartment);
  return makeMutation(({ data }: { data: { name: string; headOfDepartment?: string } }) => {
    const dept = { ...data, id: 0, headCount: 0 };
    addDepartment(dept);
    return dept;
  });
}

// Job Grades
export function useListJobGrades() {
  const grades = useMockStore((s) => s.jobGrades);
  return makeQuery(grades);
}

// Jobs
export function useListJobs(params?: { status?: string }) {
  const jobs = useMockStore((s) => s.jobs);
  const filtered = params?.status ? jobs.filter((j) => j.status === params.status) : jobs;
  return makeQuery(filtered);
}

export function useCreateJob() {
  const addJob = useMockStore((s) => s.addJob);
  return makeMutation(({ data }: { data: { title: string; department: string; type: string; source: string; description?: string; competencies?: string[] } }) => {
    const job = { ...data, status: "active", competencies: data.competencies ?? [] };
    addJob(job);
    return job;
  });
}

export function useUpdateJob() {
  const updateJobStatus = useMockStore((s) => s.updateJobStatus);
  return makeMutation(({ id, data }: { id: number; data: { status?: string } }) => {
    if (data.status) updateJobStatus(id, data.status);
    return { id };
  });
}

// Requisitions
export function useListRequisitions(_params?: object) {
  const requisitions = useMockStore((s) => s.requisitions);
  return makeQuery({ data: requisitions, total: requisitions.length });
}

export function useCreateRequisition() {
  const addRequisition = useMockStore((s) => s.addRequisition);
  return makeMutation(({ data }: { data: { jobTitle: string; department: string; grade: string; headcount: number; justification: string; employmentType: string; location: string } }) => {
    addRequisition(data);
    return data;
  });
}

export function useApproveRequisition() {
  const approveRequisition = useMockStore((s) => s.approveRequisition);
  return makeMutation(({ id, data }: { id: number; data: { action: "approve" | "reject"; comments?: string } }) => {
    approveRequisition(id, data.action);
    return { id };
  });
}

// Candidates
export function useListCandidates(params?: { search?: string }) {
  const candidates = useMockStore((s) => s.candidates);
  const filtered = params?.search
    ? candidates.filter((c) => `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(params.search!.toLowerCase()))
    : candidates;
  return makeQuery({ data: filtered, total: filtered.length });
}

export function useCreateCandidate() {
  const addCandidate = useMockStore((s) => s.addCandidate);
  return makeMutation(({ data }: { data: { firstName: string; lastName: string; email: string; phone?: string; currentRole?: string; currentCompany?: string; source?: string; yearsOfExperience?: number; skills?: string[] } }) => {
    const candidate = { ...data, source: data.source ?? "direct", skills: data.skills ?? [] };
    addCandidate(candidate);
    return candidate;
  });
}

export function useGenerateCandidateAiAnalysis() {
  const generateAiAnalysis = useMockStore((s) => s.generateAiAnalysis);
  return makeMutation(({ id }: { id: number }) => {
    generateAiAnalysis(id);
    return { id };
  });
}

// Applications
export function useListApplications(_params?: object) {
  const applications = useMockStore((s) => s.applications);
  return makeQuery({ data: applications, total: applications.length });
}

export function useMoveApplicationStage() {
  const moveApplicationStage = useMockStore((s) => s.moveApplicationStage);
  return makeMutation(({ id, data }: { id: number; data: { stage: string } }) => {
    moveApplicationStage(id, data.stage);
    return { id };
  });
}

// Interviews
export function useListInterviews(_params?: object) {
  const interviews = useMockStore((s) => s.interviews);
  return makeQuery(interviews);
}

export function useCreateInterview() {
  const addInterview = useMockStore((s) => s.addInterview);
  return makeMutation(({ data }: { data: { applicationId: number; scheduledAt: string; duration?: number; type?: string; location?: string; panelMembers?: string[] } }) => {
    const interview = { applicationId: data.applicationId, scheduledAt: data.scheduledAt, duration: data.duration ?? 60, type: data.type ?? "behavioral", location: data.location ?? "Conference Room", status: "scheduled" };
    addInterview(interview);
    return interview;
  });
}

export function useUpdateInterview() {
  const completeInterview = useMockStore((s) => s.completeInterview);
  return makeMutation(({ id, data }: { id: number; data: { status?: string } }) => {
    if (data.status === "completed") completeInterview(id);
    return { id };
  });
}

export function useSubmitInterviewFeedback() {
  const submitFeedback = useMockStore((s) => s.submitFeedback);
  return makeMutation(({ id, data }: { id: number; data: { feedback: string; overallScore: number; interviewerName?: string; technicalScore?: number; behavioralScore?: number; recommendation?: string; comments?: string } }) => {
    submitFeedback(id, data.feedback, data.overallScore);
    return { id };
  });
}

// Offers
export function useListOffers(_params?: object) {
  const offers = useMockStore((s) => s.offers);
  return makeQuery(offers);
}

export function useCreateOffer() {
  const addOffer = useMockStore((s) => s.addOffer);
  return makeMutation(({ data }: { data: { applicationId: number; baseSalary: number; allowances?: number; bonus?: number; currency?: string; joiningDate?: string; expiryDate?: string } }) => {
    const offer = { applicationId: data.applicationId, baseSalary: data.baseSalary, allowances: data.allowances ?? 0, bonus: data.bonus ?? 0, currency: data.currency ?? "NGN", joiningDate: data.joiningDate ?? null, expiryDate: data.expiryDate ?? null };
    addOffer(offer);
    return offer;
  });
}

export function useApproveOffer() {
  const approveOffer = useMockStore((s) => s.approveOffer);
  return makeMutation(({ id, data }: { id: number; data: { action: "approve" | "reject"; comments?: string } }) => {
    approveOffer(id, data.action);
    return { id };
  });
}

// Onboarding
export function useListOnboardingRecords(_params?: object) {
  const records = useMockStore((s) => s.onboardingRecords);
  return makeQuery(records);
}

export function useCreateOnboardingRecord() {
  const addOnboardingRecord = useMockStore((s) => s.addOnboardingRecord);
  return makeMutation(({ data }: { data: { candidateId: number; startDate: string; department: string; manager?: string } }) => {
    addOnboardingRecord({ ...data, manager: data.manager ?? null });
    return data;
  });
}

export function useListOnboardingTasks(recordId: number) {
  const tasks = useMockStore((s) => s.onboardingTasks.filter((t) => t.recordId === recordId));
  return makeQuery(tasks);
}

export function useUpdateOnboardingTask() {
  const completeOnboardingTask = useMockStore((s) => s.completeOnboardingTask);
  return makeMutation(({ taskId, data }: { taskId: number; data: { status: string; completedAt?: string } }) => {
    if (data.status === "completed") completeOnboardingTask(taskId);
    return { taskId };
  });
}

// Notifications
export function useListNotifications(_params?: object, _options?: object) {
  const notifications = useMockStore((s) => s.notifications);
  return makeQuery(notifications);
}

export function useMarkNotificationRead() {
  const markNotificationRead = useMockStore((s) => s.markNotificationRead);
  return makeMutation(({ id }: { id: number }) => {
    markNotificationRead(id);
    return { id };
  });
}

export function getListNotificationsQueryKey(_params?: unknown) {
  return ["notifications"];
}

// Reports
export function useGetHiringTrends(params?: { months?: number }) {
  const months = params?.months ?? 6;
  const now = new Date();
  const trends = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const month = d.toLocaleString("default", { month: "short" });
    return { month, applications: Math.floor(Math.random() * 25) + 10, hires: Math.floor(Math.random() * 4) + 1 };
  });
  return makeQuery(trends);
}

export function useGetSourceEffectiveness() {
  return makeQuery([
    { source: "LinkedIn", conversionRate: 26.7 },
    { source: "Referral", conversionRate: 40.0 },
    { source: "Direct", conversionRate: 20.0 },
    { source: "Agency", conversionRate: 17.5 },
    { source: "Portal", conversionRate: 12.5 },
  ]);
}

export function useGetRecruiterPerformance() {
  return makeQuery([
    { recruiterName: "Fatima Bello", openPositions: 4, candidatesManaged: 22, avgTimeToClose: 18, offersExtended: 5 },
    { recruiterName: "Amaka Okonkwo", openPositions: 3, candidatesManaged: 18, avgTimeToClose: 21, offersExtended: 4 },
    { recruiterName: "Emeka Eze", openPositions: 2, candidatesManaged: 11, avgTimeToClose: 27, offersExtended: 2 },
  ]);
}

export function useGetOfferAcceptance() {
  return makeQuery([
    { department: "Technology", offered: 5, accepted: 4, declined: 1, acceptanceRate: 80 },
    { department: "Risk & Compliance", offered: 4, accepted: 4, declined: 0, acceptanceRate: 100 },
    { department: "Finance", offered: 3, accepted: 2, declined: 1, acceptanceRate: 66.7 },
    { department: "Operations", offered: 2, accepted: 2, declined: 0, acceptanceRate: 100 },
    { department: "Human Resources", offered: 2, accepted: 1, declined: 1, acceptanceRate: 50 },
  ]);
}

// Compliance
export function useGetComplianceDashboard() {
  return makeQuery({
    slaBreaches: 2,
    overdueApprovals: 3,
    workflowBottlenecks: 1,
    recentAuditEvents: [1, 2, 3, 4, 5],
  });
}

export function useListAuditLogs(_params?: object) {
  const logs = useMockStore((s) => s.auditLogs);
  return makeQuery({ data: logs, total: logs.length });
}
