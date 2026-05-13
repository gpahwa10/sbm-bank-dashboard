import { db } from "@workspace/db";
import {
  usersTable,
  departmentsTable,
  jobGradesTable,
  jobsTable,
  candidatesTable,
  applicationsTable,
  auditLogsTable,
  notificationsTable,
  requisitionsTable,
} from "@workspace/db";

async function seed() {
  console.log("Seeding database…");

  // Users
  const users = await db.insert(usersTable).values([
    { name: "Sarah Okafor", email: "hr.admin@firstbankng.com", passwordHash: "admin123", role: "hr_admin", department: "HR", isActive: true },
    { name: "James Whitfield", email: "recruiter@firstbankng.com", passwordHash: "admin123", role: "recruiter", department: "HR", isActive: true },
    { name: "David Chen", email: "hm.ops@firstbankng.com", passwordHash: "admin123", role: "hiring_manager", department: "Operations", isActive: true },
    { name: "Priya Nair", email: "hm.risk@firstbankng.com", passwordHash: "admin123", role: "hiring_manager", department: "Risk & Compliance", isActive: true },
    { name: "Michael Adeyemi", email: "ceo@firstbankng.com", passwordHash: "admin123", role: "executive", department: "Executive", isActive: true },
    { name: "Amaka Eze", email: "compliance@firstbankng.com", passwordHash: "admin123", role: "compliance", department: "Risk & Compliance", isActive: true },
    { name: "Tobi Adewale", email: "recruiter2@firstbankng.com", passwordHash: "admin123", role: "recruiter", department: "HR", isActive: true },
  ]).returning().onConflictDoNothing();

  console.log(`Inserted ${users.length} users`);

  // Departments
  const depts = await db.insert(departmentsTable).values([
    { name: "HR", headCount: 12, headOfDepartment: "Sarah Okafor" },
    { name: "Risk & Compliance", headCount: 34, headOfDepartment: "Priya Nair" },
    { name: "Treasury", headCount: 28, headOfDepartment: "Emmanuel Okonkwo" },
    { name: "Retail Banking", headCount: 87, headOfDepartment: "Fatima Aliyu" },
    { name: "Operations", headCount: 62, headOfDepartment: "David Chen" },
    { name: "IT", headCount: 41, headOfDepartment: "Victor Chukwu" },
    { name: "Finance", headCount: 19, headOfDepartment: "Ngozi Obi" },
    { name: "Legal", headCount: 8, headOfDepartment: "Adaeze Okafor" },
    { name: "Executive", headCount: 5, headOfDepartment: "Michael Adeyemi" },
  ]).returning().onConflictDoNothing();

  console.log(`Inserted ${depts.length} departments`);

  // Job Grades
  const grades = await db.insert(jobGradesTable).values([
    { grade: "G3", band: "Junior Associate", minSalary: "1800000", maxSalary: "2400000" },
    { grade: "G4", band: "Associate", minSalary: "2400000", maxSalary: "3600000" },
    { grade: "G5", band: "Senior Associate", minSalary: "3600000", maxSalary: "5400000" },
    { grade: "G6", band: "Principal Associate", minSalary: "5400000", maxSalary: "7800000" },
    { grade: "G7", band: "Assistant Manager", minSalary: "7800000", maxSalary: "11400000" },
    { grade: "G8", band: "Deputy Manager", minSalary: "11400000", maxSalary: "15600000" },
    { grade: "G9", band: "Manager", minSalary: "15600000", maxSalary: "21000000" },
    { grade: "M1", band: "Senior Manager", minSalary: "21000000", maxSalary: "30000000" },
    { grade: "M2", band: "Deputy General Manager", minSalary: "30000000", maxSalary: "45000000" },
    { grade: "M3", band: "General Manager", minSalary: "45000000", maxSalary: "72000000" },
  ]).returning().onConflictDoNothing();

  console.log(`Inserted ${grades.length} job grades`);

  // Jobs
  const jobs = await db.insert(jobsTable).values([
    { title: "Senior Risk Analyst", department: "Risk & Compliance", type: "external", status: "active", source: "LinkedIn", description: "Analyse credit and market risk exposure...", competencies: ["Risk Management", "Basel III", "Financial Modelling", "Regulatory Compliance"], applicationCount: 24 },
    { title: "Treasury Manager", department: "Treasury", type: "external", status: "active", source: "Recruitment Agency", description: "Manage liquidity and funding strategies...", competencies: ["Treasury Management", "ALM", "FX Trading", "Financial Markets"], applicationCount: 17 },
    { title: "Retail Banking Officer", department: "Retail Banking", type: "both", status: "active", source: "Company Portal", description: "Grow retail deposits and manage client relationships...", competencies: ["Sales", "Customer Service", "Banking Products", "KYC/AML"], applicationCount: 43 },
    { title: "IT Security Analyst", department: "IT", type: "external", status: "active", source: "LinkedIn", description: "Protect bank infrastructure from cyber threats...", competencies: ["Cybersecurity", "SIEM", "Penetration Testing", "Incident Response"], applicationCount: 31 },
    { title: "Compliance Officer", department: "Risk & Compliance", type: "internal", status: "active", source: "Employee Referral", description: "Ensure adherence to regulatory frameworks...", competencies: ["Regulatory Compliance", "AML", "KYC", "CBN Regulations"], applicationCount: 12 },
    { title: "Operations Analyst", department: "Operations", type: "external", status: "active", source: "Job Boards", description: "Streamline back-office processes...", competencies: ["Process Analysis", "ERP Systems", "Data Analysis", "Banking Operations"], applicationCount: 19 },
    { title: "Financial Controller", department: "Finance", type: "external", status: "draft", source: "LinkedIn", description: "Oversee financial reporting and controls...", competencies: ["IFRS", "Financial Reporting", "Internal Controls", "Tax"], applicationCount: 0 },
    { title: "Legal Counsel", department: "Legal", type: "external", status: "active", source: "Recruitment Agency", description: "Provide legal advisory for banking transactions...", competencies: ["Contract Law", "Banking Regulations", "Litigation", "Corporate Law"], applicationCount: 8 },
  ]).returning().onConflictDoNothing();

  console.log(`Inserted ${jobs.length} jobs`);

  // Candidates
  const candidates = await db.insert(candidatesTable).values([
    { firstName: "Chukwuemeka", lastName: "Obi", email: "c.obi@email.com", phone: "+234-801-234-5678", currentRole: "Risk Analyst", currentCompany: "GTBank", yearsOfExperience: "6", skills: ["Risk Management", "Financial Modelling", "Excel", "Basel III"], source: "linkedin", aiMatchScore: "87" },
    { firstName: "Aishat", lastName: "Bello", email: "a.bello@email.com", phone: "+234-802-345-6789", currentRole: "Treasury Analyst", currentCompany: "Access Bank", yearsOfExperience: "4", skills: ["Treasury", "FX Trading", "Bloomberg", "ALM"], source: "referral", aiMatchScore: "79" },
    { firstName: "Segun", lastName: "Adeyemi", email: "s.adeyemi@email.com", phone: "+234-803-456-7890", currentRole: "Relationship Manager", currentCompany: "UBA", yearsOfExperience: "7", skills: ["Sales", "Customer Relationship", "Retail Banking", "KYC"], source: "direct", aiMatchScore: "82" },
    { firstName: "Kemi", lastName: "Oladele", email: "k.oladele@email.com", phone: "+234-804-567-8901", currentRole: "IT Security Lead", currentCompany: "Zenith Bank", yearsOfExperience: "9", skills: ["Cybersecurity", "SIEM", "ISO27001", "Network Security"], source: "linkedin", aiMatchScore: "91" },
    { firstName: "Tunde", lastName: "Fashola", email: "t.fashola@email.com", phone: "+234-805-678-9012", currentRole: "Compliance Analyst", currentCompany: "First Bank", yearsOfExperience: "5", skills: ["AML", "KYC", "CBN Regulations", "FATF"], source: "portal", aiMatchScore: "76" },
    { firstName: "Ngozi", lastName: "Eze", email: "n.eze@email.com", phone: "+234-806-789-0123", currentRole: "Operations Manager", currentCompany: "Polaris Bank", yearsOfExperience: "11", skills: ["Operations Management", "ERP", "Process Improvement", "Team Leadership"], source: "agency", aiMatchScore: "88" },
    { firstName: "Bayo", lastName: "Olawale", email: "b.olawale@email.com", phone: "+234-807-890-1234", currentRole: "Financial Analyst", currentCompany: "Stanbic IBTC", yearsOfExperience: "3", skills: ["IFRS", "Financial Analysis", "Excel", "Power BI"], source: "linkedin", aiMatchScore: null },
    { firstName: "Funmi", lastName: "Adesanya", email: "f.adesanya@email.com", phone: "+234-808-901-2345", currentRole: "Legal Associate", currentCompany: "KPMG Nigeria", yearsOfExperience: "6", skills: ["Contract Law", "Banking Law", "Corporate Finance", "Litigation"], source: "referral", aiMatchScore: "84" },
    { firstName: "Rotimi", lastName: "Adebayo", email: "r.adebayo@email.com", phone: "+234-809-012-3456", currentRole: "Risk Manager", currentCompany: "Ecobank", yearsOfExperience: "12", skills: ["Credit Risk", "Market Risk", "Basel III", "ICAAP"], source: "agency", aiMatchScore: "93" },
    { firstName: "Yetunde", lastName: "Olumide", email: "y.olumide@email.com", phone: "+234-810-123-4567", currentRole: "Branch Manager", currentCompany: "Keystone Bank", yearsOfExperience: "8", skills: ["Branch Management", "Sales Leadership", "P&L Management", "Retail Banking"], source: "direct", aiMatchScore: null },
  ]).returning().onConflictDoNothing();

  console.log(`Inserted ${candidates.length} candidates`);

  // Applications
  if (jobs.length > 0 && candidates.length > 0) {
    const appData = [
      { candidateId: candidates[0]?.id ?? 1, jobId: jobs[0]?.id ?? 1, stage: "shortlisted" },
      { candidateId: candidates[1]?.id ?? 2, jobId: jobs[1]?.id ?? 2, stage: "interview_scheduled" },
      { candidateId: candidates[2]?.id ?? 3, jobId: jobs[2]?.id ?? 3, stage: "applied" },
      { candidateId: candidates[3]?.id ?? 4, jobId: jobs[3]?.id ?? 4, stage: "interviewed" },
      { candidateId: candidates[4]?.id ?? 5, jobId: jobs[4]?.id ?? 5, stage: "under_review" },
      { candidateId: candidates[5]?.id ?? 6, jobId: jobs[5]?.id ?? 6, stage: "longlisted" },
      { candidateId: candidates[6]?.id ?? 7, jobId: jobs[0]?.id ?? 1, stage: "applied" },
      { candidateId: candidates[7]?.id ?? 8, jobId: jobs[7]?.id ?? 8, stage: "offer_pending" },
      { candidateId: candidates[8]?.id ?? 9, jobId: jobs[0]?.id ?? 1, stage: "shortlisted" },
      { candidateId: candidates[9]?.id ?? 10, jobId: jobs[2]?.id ?? 3, stage: "under_review" },
    ];

    const apps = await db.insert(applicationsTable).values(appData).returning().onConflictDoNothing();
    console.log(`Inserted ${apps.length} applications`);
  }

  // Requisitions
  const reqs = await db.insert(requisitionsTable).values([
    { department: "Risk & Compliance", jobTitle: "Senior Credit Risk Analyst", grade: "G7", headcount: 2, justification: "Expansion of credit portfolio requires additional risk oversight capacity.", employmentType: "permanent", location: "Lagos", status: "submitted", workflowStage: "pending_dept_approval", createdById: 1, budget: "25000000" },
    { department: "IT", jobTitle: "Cloud Infrastructure Engineer", grade: "G6", headcount: 1, justification: "Digital transformation initiative requires cloud expertise.", employmentType: "permanent", location: "Lagos", status: "approved", workflowStage: "approved_by_hr", createdById: 1 },
    { department: "Treasury", jobTitle: "Fixed Income Trader", grade: "G8", headcount: 1, justification: "Expansion of bond trading desk.", employmentType: "permanent", location: "Abuja", status: "submitted", workflowStage: "pending_cfo_approval", createdById: 1, budget: "32000000" },
    { department: "Retail Banking", jobTitle: "Regional Sales Manager", grade: "G9", headcount: 3, justification: "New branch openings in South-East region.", employmentType: "permanent", location: "Enugu", status: "draft", workflowStage: "pending_dept_approval", createdById: 1 },
  ]).returning().onConflictDoNothing();

  console.log(`Inserted ${reqs.length} requisitions`);

  // Audit Logs
  const auditData = [
    { action: "user_login", entityType: "user", entityId: 1, userId: 1, userName: "Sarah Okafor", details: "Successful login from web browser", ipAddress: "41.190.28.154" },
    { action: "create_requisition", entityType: "requisition", entityId: 1, userId: 1, userName: "Sarah Okafor", details: "Created requisition for Senior Credit Risk Analyst", ipAddress: "41.190.28.154" },
    { action: "approve_requisition", entityType: "requisition", entityId: 2, userId: 3, userName: "David Chen", details: "Approved IT Cloud Engineer requisition — meets headcount plan", ipAddress: "197.210.84.23" },
    { action: "create_candidate", entityType: "candidate", entityId: 1, userId: 2, userName: "James Whitfield", details: "Added candidate Chukwuemeka Obi from LinkedIn", ipAddress: "41.190.28.155" },
    { action: "move_application_stage", entityType: "application", entityId: 1, userId: 2, userName: "James Whitfield", details: "Moved application to Shortlisted stage", ipAddress: "41.190.28.155" },
    { action: "schedule_interview", entityType: "interview", entityId: 1, userId: 2, userName: "James Whitfield", details: "Scheduled behavioral interview for Kemi Oladele", ipAddress: "41.190.28.155" },
    { action: "create_offer", entityType: "offer", entityId: 1, userId: 1, userName: "Sarah Okafor", details: "Created offer for Funmi Adesanya — NGN 18,000,000 total package", ipAddress: "41.190.28.154" },
    { action: "user_login", entityType: "user", entityId: 5, userId: 5, userName: "Michael Adeyemi", details: "Successful login from mobile browser", ipAddress: "102.88.34.76" },
    { action: "update_job", entityType: "job", entityId: 3, userId: 2, userName: "James Whitfield", details: "Updated Retail Banking Officer posting — added competencies", ipAddress: "41.190.28.155" },
    { action: "generate_ai_analysis", entityType: "candidate", entityId: 4, userId: 2, userName: "James Whitfield", details: "Generated AI analysis for Kemi Oladele — Score: 91%", ipAddress: "41.190.28.155" },
  ];

  const audits = await db.insert(auditLogsTable).values(auditData).returning();
  console.log(`Inserted ${audits.length} audit logs`);

  // Notifications
  const notifData = [
    { userId: 1, type: "approval", message: "Requisition #1 for Senior Credit Risk Analyst is pending your approval", entityType: "requisition", entityId: 1, read: "false" },
    { userId: 1, type: "requisition", message: "Requisition #3 for Fixed Income Trader requires CFO sign-off", entityType: "requisition", entityId: 3, read: "false" },
    { userId: 1, type: "interview", message: "Interview scheduled for Aishat Bello on 20 May 2026 at 10:00 AM", entityType: "interview", entityId: 1, read: "false" },
    { userId: 1, type: "offer", message: "Offer for Funmi Adesanya is awaiting Finance approval", entityType: "offer", entityId: 1, read: "true" },
    { userId: 1, type: "system", message: "SLA breach alert: Requisition #1 has been pending approval for 7 days", entityType: "requisition", entityId: 1, read: "false" },
    { userId: 2, type: "requisition", message: "New requisition submitted by Risk & Compliance — Senior Credit Risk Analyst", entityType: "requisition", entityId: 1, read: "false" },
    { userId: 2, type: "approval", message: "Your requisition for Cloud Infrastructure Engineer has been approved", entityType: "requisition", entityId: 2, read: "true" },
  ];

  const notifs = await db.insert(notificationsTable).values(notifData).returning();
  console.log(`Inserted ${notifs.length} notifications`);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
