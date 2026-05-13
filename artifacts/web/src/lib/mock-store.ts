import { create } from "zustand";

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  department: string | null;
  jobGrade?: string | null;
  isActive: boolean;
}

export interface Department {
  id: number;
  name: string;
  headCount: number;
  headOfDepartment?: string | null;
}

export interface JobGrade {
  id: number;
  grade: string;
  band: string;
  minSalary: number;
  maxSalary: number;
}

export interface Job {
  id: number;
  title: string;
  department: string;
  type: string;
  status: string;
  source: string;
  description?: string;
  competencies: string[];
  applicationCount: number;
  createdAt: string;
}

export interface Requisition {
  id: number;
  jobTitle: string;
  department: string;
  grade: string;
  headcount: number;
  employmentType: string;
  location: string;
  justification: string;
  status: string;
  requestedBy: string;
  createdAt: string;
}

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentRole?: string;
  currentCompany?: string;
  source: string;
  yearsOfExperience?: number;
  skills: string[];
  aiMatchScore?: number | null;
  aiSummary?: string | null;
  createdAt: string;
}

export interface Application {
  id: number;
  stage: string;
  status: string;
  appliedAt: string;
  candidate: { firstName: string; lastName: string; email: string; aiMatchScore?: number | null };
  job: { title: string; department: string };
}

export interface Interview {
  id: number;
  applicationId: number;
  scheduledAt: string;
  duration: number;
  type: string;
  location: string;
  status: string;
  feedback?: string | null;
  overallScore?: number | null;
  application?: {
    candidate?: { firstName: string; lastName: string };
    job?: { title: string };
  };
}

export interface Offer {
  id: number;
  applicationId: number;
  baseSalary: number;
  allowances: number;
  bonus: number;
  totalPackage: number;
  currency: string;
  status: string;
  joiningDate?: string | null;
  expiryDate?: string | null;
  application?: {
    candidate?: { firstName: string; lastName: string };
    job?: { title: string };
  };
}

export interface OnboardingRecord {
  id: number;
  candidateId: number;
  startDate: string;
  status: string;
  department: string;
  manager?: string | null;
  totalTasks: number;
  completedTasks: number;
  candidate?: { firstName: string; lastName: string };
}

export interface OnboardingTask {
  id: number;
  recordId: number;
  title: string;
  category: string;
  status: string;
  dueDate: string;
  completedAt?: string | null;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: number;
  ipAddress?: string | null;
  details?: string | null;
}

interface MockStore {
  users: User[];
  departments: Department[];
  jobGrades: JobGrade[];
  jobs: Job[];
  requisitions: Requisition[];
  candidates: Candidate[];
  applications: Application[];
  interviews: Interview[];
  offers: Offer[];
  onboardingRecords: OnboardingRecord[];
  onboardingTasks: OnboardingTask[];
  notifications: Notification[];
  auditLogs: AuditLog[];

  // User actions
  addUser: (u: Omit<User, "id">) => void;
  addDepartment: (d: Omit<Department, "id">) => void;

  // Job actions
  addJob: (j: Omit<Job, "id" | "createdAt" | "applicationCount">) => void;
  updateJobStatus: (id: number, status: string) => void;

  // Requisition actions
  addRequisition: (r: Omit<Requisition, "id" | "createdAt" | "status" | "requestedBy">) => void;
  approveRequisition: (id: number, action: "approve" | "reject") => void;

  // Candidate actions
  addCandidate: (c: Omit<Candidate, "id" | "createdAt" | "aiMatchScore" | "aiSummary">) => void;
  generateAiAnalysis: (id: number) => void;

  // Application actions
  moveApplicationStage: (id: number, stage: string) => void;

  // Interview actions
  addInterview: (i: Omit<Interview, "id">) => void;
  completeInterview: (id: number) => void;
  submitFeedback: (id: number, feedback: string, score: number) => void;

  // Offer actions
  addOffer: (o: Omit<Offer, "id" | "totalPackage" | "status">) => void;
  approveOffer: (id: number, action: "approve" | "reject") => void;

  // Onboarding actions
  addOnboardingRecord: (r: Omit<OnboardingRecord, "id" | "status" | "totalTasks" | "completedTasks">) => void;
  completeOnboardingTask: (taskId: number) => void;

  // Notification actions
  markNotificationRead: (id: number) => void;
}

const DEMO_USERS: User[] = [
  { id: 1, email: "hr.admin@firstbankng.com", name: "HR Admin", role: "admin", department: "Human Resources", jobGrade: "GL10", isActive: true },
  { id: 2, email: "amaka.okonkwo@firstbankng.com", name: "Amaka Okonkwo", role: "recruiter", department: "Human Resources", jobGrade: "GL7", isActive: true },
  { id: 3, email: "chidi.nwosu@firstbankng.com", name: "Chidi Nwosu", role: "hiring_manager", department: "Technology", jobGrade: "GL9", isActive: true },
  { id: 4, email: "fatima.bello@firstbankng.com", name: "Fatima Bello", role: "recruiter", department: "Human Resources", jobGrade: "GL7", isActive: true },
  { id: 5, email: "emeka.eze@firstbankng.com", name: "Emeka Eze", role: "hr_admin", department: "Human Resources", jobGrade: "GL8", isActive: true },
  { id: 6, email: "ceo@firstbankng.com", name: "Adaugo Williams", role: "executive", department: "Executive", jobGrade: "GL14", isActive: true },
];

const DEMO_DEPARTMENTS: Department[] = [
  { id: 1, name: "Human Resources", headCount: 12, headOfDepartment: "Emeka Eze" },
  { id: 2, name: "Technology", headCount: 45, headOfDepartment: "Chidi Nwosu" },
  { id: 3, name: "Risk & Compliance", headCount: 20, headOfDepartment: "Ngozi Adeyemi" },
  { id: 4, name: "Finance", headCount: 30, headOfDepartment: "Tunde Bakare" },
  { id: 5, name: "Operations", headCount: 25, headOfDepartment: "Bola Adesanya" },
  { id: 6, name: "Treasury", headCount: 15, headOfDepartment: "Seun Olawale" },
  { id: 7, name: "Retail Banking", headCount: 60, headOfDepartment: "Ada Okafor" },
  { id: 8, name: "Legal", headCount: 8, headOfDepartment: "Kunle Afolabi" },
];

const DEMO_JOB_GRADES: JobGrade[] = [
  { id: 1, grade: "G3", band: "Entry Level", minSalary: 1200000, maxSalary: 1800000 },
  { id: 2, grade: "G4", band: "Junior", minSalary: 1800000, maxSalary: 2800000 },
  { id: 3, grade: "G5", band: "Mid-Level", minSalary: 2800000, maxSalary: 4200000 },
  { id: 4, grade: "G6", band: "Senior", minSalary: 4200000, maxSalary: 6500000 },
  { id: 5, grade: "G7", band: "Lead", minSalary: 6500000, maxSalary: 9000000 },
  { id: 6, grade: "G8", band: "Assistant Manager", minSalary: 9000000, maxSalary: 13000000 },
  { id: 7, grade: "G9", band: "Manager", minSalary: 13000000, maxSalary: 18000000 },
  { id: 8, grade: "M1", band: "Senior Manager", minSalary: 18000000, maxSalary: 25000000 },
  { id: 9, grade: "M2", band: "General Manager", minSalary: 25000000, maxSalary: 36000000 },
  { id: 10, grade: "M3", band: "Executive Director", minSalary: 36000000, maxSalary: 55000000 },
];

const DEMO_JOBS: Job[] = [
  { id: 1, title: "Senior Risk Analyst", department: "Risk & Compliance", type: "internal", status: "active", source: "LinkedIn", description: "Analyze and manage financial risk exposure", competencies: ["Risk Management", "Basel III", "Excel", "Communication"], applicationCount: 14, createdAt: "2026-04-10T09:00:00Z" },
  { id: 2, title: "Full Stack Developer", department: "Technology", type: "external", status: "active", source: "LinkedIn", description: "Build and maintain enterprise banking applications", competencies: ["React", "Node.js", "PostgreSQL", "AWS"], applicationCount: 32, createdAt: "2026-04-12T10:00:00Z" },
  { id: 3, title: "HR Business Partner", department: "Human Resources", type: "internal", status: "active", source: "Employee Referral", description: "Partner with business units on all HR matters", competencies: ["HRBP", "Employee Relations", "Coaching"], applicationCount: 7, createdAt: "2026-04-18T08:00:00Z" },
  { id: 4, title: "Finance Analyst", department: "Finance", type: "external", status: "draft", source: "Job Boards", description: "Financial planning, analysis, and reporting", competencies: ["Financial Modeling", "Excel", "IFRS", "PowerBI"], applicationCount: 0, createdAt: "2026-04-25T14:00:00Z" },
  { id: 5, title: "Compliance Officer", department: "Risk & Compliance", type: "external", status: "active", source: "Recruitment Agency", description: "Ensure regulatory compliance across business lines", competencies: ["Regulatory Compliance", "AML", "KYC", "Report Writing"], applicationCount: 9, createdAt: "2026-05-01T09:30:00Z" },
  { id: 6, title: "Treasury Analyst", department: "Treasury", type: "internal", status: "on_hold", source: "Employee Referral", description: "Manage liquidity, funding and interest rate risk", competencies: ["Bloomberg", "Fixed Income", "Excel", "Risk Analysis"], applicationCount: 3, createdAt: "2026-05-03T11:00:00Z" },
];

const DEMO_REQUISITIONS: Requisition[] = [
  { id: 1, jobTitle: "Senior Risk Analyst", department: "Risk & Compliance", grade: "G7", headcount: 2, employmentType: "permanent", location: "Lagos", justification: "Team expansion to support Q3 regulatory compliance requirements", status: "approved", requestedBy: "Ngozi Adeyemi", createdAt: "2026-04-08T09:00:00Z" },
  { id: 2, jobTitle: "Full Stack Developer", department: "Technology", grade: "G6", headcount: 3, employmentType: "permanent", location: "Lagos", justification: "New digital banking platform development team", status: "approved", requestedBy: "Chidi Nwosu", createdAt: "2026-04-10T10:00:00Z" },
  { id: 3, jobTitle: "Finance Analyst", department: "Finance", grade: "G5", headcount: 1, employmentType: "permanent", location: "Abuja", justification: "Replacement hire for outgoing manager", status: "submitted", requestedBy: "Tunde Bakare", createdAt: "2026-04-22T14:00:00Z" },
  { id: 4, jobTitle: "Compliance Officer", department: "Risk & Compliance", grade: "G6", headcount: 2, employmentType: "contract", location: "Lagos", justification: "Increased regulatory requirements under CBN circular", status: "submitted", requestedBy: "Ngozi Adeyemi", createdAt: "2026-04-29T08:00:00Z" },
  { id: 5, jobTitle: "Branch Manager", department: "Retail Banking", grade: "G9", headcount: 1, employmentType: "permanent", location: "Port Harcourt", justification: "New branch opening - Port Harcourt expansion", status: "draft", requestedBy: "Ada Okafor", createdAt: "2026-05-02T11:00:00Z" },
];

const DEMO_CANDIDATES: Candidate[] = [
  { id: 1, firstName: "Chioma", lastName: "Obi", email: "chioma.obi@email.com", phone: "+234-801-234-5678", currentRole: "Risk Analyst", currentCompany: "GTBank", source: "linkedin", yearsOfExperience: 5, skills: ["Risk Management", "Excel", "Basel III"], aiMatchScore: 87, aiSummary: "Strong risk management background with excellent analytical skills. Basel III certified with cross-bank experience.", createdAt: "2026-04-15T10:00:00Z" },
  { id: 2, firstName: "Emeka", lastName: "Nwosu", email: "emeka.nwosu@email.com", phone: "+234-802-345-6789", currentRole: "Software Engineer", currentCompany: "Flutterwave", source: "referral", yearsOfExperience: 4, skills: ["React", "Node.js", "Python", "PostgreSQL"], aiMatchScore: 92, aiSummary: "Exceptional technical skills with proven fintech experience. Strong React and backend expertise ideal for the role.", createdAt: "2026-04-16T09:00:00Z" },
  { id: 3, firstName: "Adaeze", lastName: "Okoro", email: "adaeze.okoro@email.com", phone: "+234-803-456-7890", currentRole: "HR Generalist", currentCompany: "Zenith Bank", source: "direct", yearsOfExperience: 6, skills: ["HRBP", "Recruitment", "Employee Relations", "HRMS"], aiMatchScore: 79, aiSummary: "Solid HR generalist background. Strong employee relations experience, would benefit from senior HRBP exposure.", createdAt: "2026-04-17T14:00:00Z" },
  { id: 4, firstName: "Tunde", lastName: "Bakare", email: "tunde.bakare@gmail.com", phone: "+234-804-567-8901", currentRole: "Financial Analyst", currentCompany: "PwC Nigeria", source: "agency", yearsOfExperience: 3, skills: ["Financial Modeling", "Excel", "IFRS", "PowerBI"], aiMatchScore: 78, aiSummary: "Good financial acumen, IFRS proficient. Recommend further technical assessment for senior analyst role.", createdAt: "2026-04-20T11:00:00Z" },
  { id: 5, firstName: "Ngozi", lastName: "Eze", email: "ngozi.eze@email.com", phone: "+234-805-678-9012", currentRole: "Compliance Officer", currentCompany: "Access Bank", source: "linkedin", yearsOfExperience: 7, skills: ["AML", "KYC", "Regulatory Compliance", "CBN Guidelines"], aiMatchScore: 91, aiSummary: "Excellent compliance profile. Deep CBN regulatory knowledge and AML/CFT expertise make this a strong hire.", createdAt: "2026-04-22T09:00:00Z" },
  { id: 6, firstName: "Kola", lastName: "Adeyemi", email: "kola.adeyemi@email.com", phone: "+234-806-789-0123", currentRole: "Treasury Analyst", currentCompany: "Stanbic IBTC", source: "portal", yearsOfExperience: 5, skills: ["Bloomberg", "Fixed Income", "Liquidity Management", "FX Trading"], aiMatchScore: null, aiSummary: null, createdAt: "2026-04-24T16:00:00Z" },
  { id: 7, firstName: "Amara", lastName: "Uchenna", email: "amara.uchenna@email.com", phone: "+234-807-890-1234", currentRole: "Software Developer", currentCompany: "Interswitch", source: "referral", yearsOfExperience: 3, skills: ["Java", "Spring Boot", "React", "MySQL"], aiMatchScore: 74, aiSummary: "Solid full-stack profile. Java background is a plus for legacy systems, React skills align with frontend needs.", createdAt: "2026-05-01T08:00:00Z" },
];

const DEMO_APPLICATIONS: Application[] = [
  { id: 1, stage: "shortlisted", status: "active", appliedAt: "2026-04-16T10:00:00Z", candidate: { firstName: "Chioma", lastName: "Obi", email: "chioma.obi@email.com", aiMatchScore: 87 }, job: { title: "Senior Risk Analyst", department: "Risk & Compliance" } },
  { id: 2, stage: "interview_scheduled", status: "active", appliedAt: "2026-04-17T09:00:00Z", candidate: { firstName: "Emeka", lastName: "Nwosu", email: "emeka.nwosu@email.com", aiMatchScore: 92 }, job: { title: "Full Stack Developer", department: "Technology" } },
  { id: 3, stage: "under_review", status: "active", appliedAt: "2026-04-18T14:00:00Z", candidate: { firstName: "Adaeze", lastName: "Okoro", email: "adaeze.okoro@email.com", aiMatchScore: 79 }, job: { title: "HR Business Partner", department: "Human Resources" } },
  { id: 4, stage: "longlisted", status: "active", appliedAt: "2026-04-21T11:00:00Z", candidate: { firstName: "Tunde", lastName: "Bakare", email: "tunde.bakare@gmail.com", aiMatchScore: 78 }, job: { title: "Finance Analyst", department: "Finance" } },
  { id: 5, stage: "offer_pending", status: "active", appliedAt: "2026-04-23T09:00:00Z", candidate: { firstName: "Ngozi", lastName: "Eze", email: "ngozi.eze@email.com", aiMatchScore: 91 }, job: { title: "Compliance Officer", department: "Risk & Compliance" } },
  { id: 6, stage: "applied", status: "active", appliedAt: "2026-05-02T08:00:00Z", candidate: { firstName: "Amara", lastName: "Uchenna", email: "amara.uchenna@email.com", aiMatchScore: 74 }, job: { title: "Full Stack Developer", department: "Technology" } },
  { id: 7, stage: "interviewed", status: "active", appliedAt: "2026-04-19T15:00:00Z", candidate: { firstName: "Kola", lastName: "Adeyemi", email: "kola.adeyemi@email.com", aiMatchScore: null }, job: { title: "Treasury Analyst", department: "Treasury" } },
];

const DEMO_INTERVIEWS: Interview[] = [
  { id: 1, applicationId: 2, scheduledAt: "2026-05-14T10:00:00Z", duration: 60, type: "technical", location: "Conference Room A", status: "scheduled", application: { candidate: { firstName: "Emeka", lastName: "Nwosu" }, job: { title: "Full Stack Developer" } } },
  { id: 2, applicationId: 1, scheduledAt: "2026-05-13T14:00:00Z", duration: 45, type: "behavioral", location: "HR Office", status: "completed", feedback: "Strong analytical skills demonstrated. Recommended for next round.", overallScore: 8, application: { candidate: { firstName: "Chioma", lastName: "Obi" }, job: { title: "Senior Risk Analyst" } } },
  { id: 3, applicationId: 5, scheduledAt: "2026-05-15T11:00:00Z", duration: 90, type: "panel", location: "Boardroom 2", status: "scheduled", application: { candidate: { firstName: "Ngozi", lastName: "Eze" }, job: { title: "Compliance Officer" } } },
  { id: 4, applicationId: 7, scheduledAt: "2026-05-10T09:00:00Z", duration: 60, type: "hr_screening", location: "Video Call", status: "completed", feedback: "Good communication. Technical assessment pending.", overallScore: 7, application: { candidate: { firstName: "Kola", lastName: "Adeyemi" }, job: { title: "Treasury Analyst" } } },
];

const DEMO_OFFERS: Offer[] = [
  { id: 1, applicationId: 5, baseSalary: 8400000, allowances: 1200000, bonus: 840000, totalPackage: 10440000, currency: "NGN", status: "pending_approval", joiningDate: "2026-06-01", application: { candidate: { firstName: "Ngozi", lastName: "Eze" }, job: { title: "Compliance Officer" } } },
  { id: 2, applicationId: 2, baseSalary: 6500000, allowances: 900000, bonus: 650000, totalPackage: 8050000, currency: "NGN", status: "accepted", joiningDate: "2026-05-20", application: { candidate: { firstName: "Emeka", lastName: "Nwosu" }, job: { title: "Full Stack Developer" } } },
];

const DEMO_ONBOARDING_RECORDS: OnboardingRecord[] = [
  { id: 1, candidateId: 2, startDate: "2026-05-20", status: "in_progress", department: "Technology", manager: "Chidi Nwosu", totalTasks: 10, completedTasks: 4, candidate: { firstName: "Emeka", lastName: "Nwosu" } },
];

const DEMO_ONBOARDING_TASKS: OnboardingTask[] = [
  { id: 1, recordId: 1, title: "Complete onboarding form", category: "documentation", status: "completed", dueDate: "2026-05-20", completedAt: "2026-05-18" },
  { id: 2, recordId: 1, title: "Submit bank account details", category: "documentation", status: "completed", dueDate: "2026-05-20", completedAt: "2026-05-18" },
  { id: 3, recordId: 1, title: "Laptop & equipment setup", category: "it_setup", status: "completed", dueDate: "2026-05-20", completedAt: "2026-05-19" },
  { id: 4, recordId: 1, title: "VPN & system access provisioned", category: "it_setup", status: "completed", dueDate: "2026-05-20", completedAt: "2026-05-19" },
  { id: 5, recordId: 1, title: "HR orientation session", category: "orientation", status: "pending", dueDate: "2026-05-21" },
  { id: 6, recordId: 1, title: "Meet your team", category: "orientation", status: "pending", dueDate: "2026-05-21" },
  { id: 7, recordId: 1, title: "Review company policies & code of conduct", category: "documentation", status: "pending", dueDate: "2026-05-22" },
  { id: 8, recordId: 1, title: "IT security training", category: "training", status: "pending", dueDate: "2026-05-23" },
  { id: 9, recordId: 1, title: "Anti-money laundering (AML) training", category: "training", status: "pending", dueDate: "2026-05-24" },
  { id: 10, recordId: 1, title: "First 30-day check-in with manager", category: "orientation", status: "pending", dueDate: "2026-06-20" },
];

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 1, type: "requisition", message: "Finance Analyst requisition from Tunde Bakare is awaiting your approval", read: false, createdAt: "2026-05-13T08:30:00Z" },
  { id: 2, type: "interview", message: "Interview with Emeka Nwosu scheduled for tomorrow at 10:00 AM", read: false, createdAt: "2026-05-13T07:00:00Z" },
  { id: 3, type: "offer", message: "Offer for Ngozi Eze (Compliance Officer) is pending approval", read: false, createdAt: "2026-05-12T15:00:00Z" },
  { id: 4, type: "approval", message: "Compliance Officer requisition approved by HR Admin", read: true, createdAt: "2026-05-11T11:00:00Z" },
  { id: 5, type: "system", message: "Emeka Nwosu accepted the Full Stack Developer offer", read: true, createdAt: "2026-05-10T14:00:00Z" },
  { id: 6, type: "interview", message: "Panel interview for Ngozi Eze confirmed — Boardroom 2, May 15", read: false, createdAt: "2026-05-09T09:00:00Z" },
];

const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: 1, timestamp: "2026-05-13T08:31:00Z", userName: "HR Admin", action: "create_requisition", entityType: "requisition", entityId: 4, ipAddress: "10.0.1.5", details: "Created Finance Analyst requisition for Abuja office" },
  { id: 2, timestamp: "2026-05-12T15:02:00Z", userName: "HR Admin", action: "create_offer", entityType: "offer", entityId: 1, ipAddress: "10.0.1.5", details: "Offer created for Ngozi Eze — Compliance Officer, NGN 8.4M base" },
  { id: 3, timestamp: "2026-05-11T11:05:00Z", userName: "Emeka Eze", action: "approve_requisition", entityType: "requisition", entityId: 4, ipAddress: "10.0.1.8", details: "Approved Compliance Officer requisition x2 headcount" },
  { id: 4, timestamp: "2026-05-10T14:10:00Z", userName: "HR Admin", action: "update_offer", entityType: "offer", entityId: 2, ipAddress: "10.0.1.5", details: "Offer status changed to accepted — Emeka Nwosu" },
  { id: 5, timestamp: "2026-05-09T09:30:00Z", userName: "Amaka Okonkwo", action: "create_interview", entityType: "interview", entityId: 3, ipAddress: "10.0.1.12", details: "Panel interview scheduled for Ngozi Eze on May 15" },
  { id: 6, timestamp: "2026-05-08T16:00:00Z", userName: "Fatima Bello", action: "update_application", entityType: "application", entityId: 5, ipAddress: "10.0.1.9", details: "Application moved to offer_pending stage" },
  { id: 7, timestamp: "2026-05-07T10:45:00Z", userName: "HR Admin", action: "create_candidate", entityType: "candidate", entityId: 7, ipAddress: "10.0.1.5", details: "New candidate Amara Uchenna added from referral source" },
  { id: 8, timestamp: "2026-05-06T13:20:00Z", userName: "Amaka Okonkwo", action: "login", entityType: "user", entityId: 2, ipAddress: "10.0.1.12", details: "User login from corporate network" },
];

let nextId = 1000;
const genId = () => ++nextId;

export const useMockStore = create<MockStore>((set) => ({
  users: DEMO_USERS,
  departments: DEMO_DEPARTMENTS,
  jobGrades: DEMO_JOB_GRADES,
  jobs: DEMO_JOBS,
  requisitions: DEMO_REQUISITIONS,
  candidates: DEMO_CANDIDATES,
  applications: DEMO_APPLICATIONS,
  interviews: DEMO_INTERVIEWS,
  offers: DEMO_OFFERS,
  onboardingRecords: DEMO_ONBOARDING_RECORDS,
  onboardingTasks: DEMO_ONBOARDING_TASKS,
  notifications: DEMO_NOTIFICATIONS,
  auditLogs: DEMO_AUDIT_LOGS,

  addUser: (u) => set((s) => ({ users: [...s.users, { ...u, id: genId() }] })),
  addDepartment: (d) => set((s) => ({ departments: [...s.departments, { ...d, id: genId() }] })),

  addJob: (j) => set((s) => ({ jobs: [...s.jobs, { ...j, id: genId(), applicationCount: 0, createdAt: new Date().toISOString() }] })),
  updateJobStatus: (id, status) => set((s) => ({ jobs: s.jobs.map((j) => j.id === id ? { ...j, status } : j) })),

  addRequisition: (r) => set((s) => ({ requisitions: [...s.requisitions, { ...r, id: genId(), status: "submitted", requestedBy: "HR Admin", createdAt: new Date().toISOString() }] })),
  approveRequisition: (id, action) => set((s) => ({ requisitions: s.requisitions.map((r) => r.id === id ? { ...r, status: action === "approve" ? "approved" : "rejected" } : r) })),

  addCandidate: (c) => set((s) => ({ candidates: [...s.candidates, { ...c, id: genId(), aiMatchScore: null, aiSummary: null, createdAt: new Date().toISOString() }] })),
  generateAiAnalysis: (id) => set((s) => ({
    candidates: s.candidates.map((c) => c.id === id ? {
      ...c,
      aiMatchScore: Math.floor(Math.random() * 35) + 60,
      aiSummary: ["Strong communication and analytical skills.", "Solid background, good cultural fit.", "Meets core requirements, further assessment recommended.", "Excellent profile — highly recommend for next round."][Math.floor(Math.random() * 4)],
    } : c),
  })),

  moveApplicationStage: (id, stage) => set((s) => ({ applications: s.applications.map((a) => a.id === id ? { ...a, stage } : a) })),

  addInterview: (i) => set((s) => ({ interviews: [...s.interviews, { ...i, id: genId() }] })),
  completeInterview: (id) => set((s) => ({ interviews: s.interviews.map((i) => i.id === id ? { ...i, status: "completed" } : i) })),
  submitFeedback: (id, feedback, score) => set((s) => ({ interviews: s.interviews.map((i) => i.id === id ? { ...i, feedback, overallScore: score, status: "completed" } : i) })),

  addOffer: (o) => set((s) => ({ offers: [...s.offers, { ...o, id: genId(), status: "pending_approval", totalPackage: o.baseSalary + o.allowances + o.bonus }] })),
  approveOffer: (id, action) => set((s) => ({ offers: s.offers.map((o) => o.id === id ? { ...o, status: action === "approve" ? "approved" : "rejected" } : o) })),

  addOnboardingRecord: (r) => {
    const id = genId();
    const defaultTasks: OnboardingTask[] = [
      { id: genId(), recordId: id, title: "Complete onboarding form", category: "documentation", status: "pending", dueDate: r.startDate },
      { id: genId(), recordId: id, title: "IT equipment setup", category: "it_setup", status: "pending", dueDate: r.startDate },
      { id: genId(), recordId: id, title: "HR orientation session", category: "orientation", status: "pending", dueDate: r.startDate },
      { id: genId(), recordId: id, title: "Meet your team", category: "orientation", status: "pending", dueDate: r.startDate },
      { id: genId(), recordId: id, title: "Review company policies", category: "documentation", status: "pending", dueDate: r.startDate },
    ];
    set((s) => ({
      onboardingRecords: [...s.onboardingRecords, { ...r, id, status: "pending", totalTasks: 5, completedTasks: 0 }],
      onboardingTasks: [...s.onboardingTasks, ...defaultTasks],
    }));
  },
  completeOnboardingTask: (taskId) => set((s) => {
    const tasks = s.onboardingTasks.map((t) => t.id === taskId ? { ...t, status: "completed", completedAt: new Date().toISOString().split("T")[0] } : t);
    const recordId = s.onboardingTasks.find((t) => t.id === taskId)?.recordId;
    const records = s.onboardingRecords.map((r) => {
      if (r.id !== recordId) return r;
      const completed = tasks.filter((t) => t.recordId === recordId && t.status === "completed").length;
      const total = tasks.filter((t) => t.recordId === recordId).length;
      return { ...r, completedTasks: completed, status: completed === total ? "completed" : "in_progress" };
    });
    return { onboardingTasks: tasks, onboardingRecords: records };
  }),

  markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
}));
