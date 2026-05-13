import { useState } from "react";
import { useListUsers, useListDepartments, useListJobGrades, useCreateUser, useCreateDepartment } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const TABS = ["Users", "Departments", "Job Grades"] as const;
type Tab = typeof TABS[number];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Users");
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "recruiter", department: "", password: "admin123" });
  const [deptForm, setDeptForm] = useState({ name: "", headOfDepartment: "" });
  const { toast } = useToast();

  const { data: users = [], refetch: refetchUsers } = useListUsers();
  const { data: departments = [], refetch: refetchDepts } = useListDepartments();
  const { data: grades = [] } = useListJobGrades();
  const createUserMutation = useCreateUser();
  const createDeptMutation = useCreateDepartment();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserMutation.mutateAsync({ data: userForm });
      toast({ title: "User created" });
      setShowUserForm(false);
      refetchUsers();
    } catch {
      toast({ title: "Failed to create user", variant: "destructive" });
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeptMutation.mutateAsync({ data: deptForm });
      toast({ title: "Department created" });
      setShowDeptForm(false);
      refetchDepts();
    } catch {
      toast({ title: "Failed to create department", variant: "destructive" });
    }
  };

  const ROLE_COLORS: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    hr_admin: "bg-purple-100 text-purple-700",
    recruiter: "bg-blue-100 text-blue-700",
    hiring_manager: "bg-amber-100 text-amber-700",
    executive: "bg-green-100 text-green-700",
    compliance: "bg-slate-100 text-slate-600",
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">System Administration</h1>
          <p className="text-sm text-muted-foreground">Manage users, departments, and system configuration</p>
        </div>

        <div className="flex border-b border-border">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Users" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" className="h-8" onClick={() => setShowUserForm(!showUserForm)}>
                <Plus className="h-4 w-4 mr-1" /> Add User
              </Button>
            </div>
            {showUserForm && (
              <div className="bg-card border border-border rounded-sm p-6">
                <h2 className="text-sm font-semibold mb-4">Create User</h2>
                <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Full Name</Label>
                    <Input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="h-8 text-sm" required />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</Label>
                    <Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="h-8 text-sm" required />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Role</Label>
                    <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                      {["admin", "hr_admin", "recruiter", "hiring_manager", "executive", "compliance"].map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Department</Label>
                    <Input value={userForm.department} onChange={(e) => setUserForm({ ...userForm, department: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Initial Password</Label>
                    <Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="h-8 text-sm" required />
                  </div>
                  <div className="flex items-end">
                    <div className="flex gap-2 w-full">
                      <Button type="button" variant="outline" size="sm" className="h-8 flex-1" onClick={() => setShowUserForm(false)}>Cancel</Button>
                      <Button type="submit" size="sm" className="h-8 flex-1" disabled={createUserMutation.isPending}>Create</Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            <div className="bg-card border border-border rounded-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Name", "Email", "Role", "Department", "Status"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-3 text-xs font-medium text-card-foreground">{u.name}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide ${ROLE_COLORS[u.role] ?? "bg-slate-100"}`}>{u.role.replace("_", " ")}</span></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">{u.department ?? "—"}</td>
                      <td className="py-3 px-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Departments" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" className="h-8" onClick={() => setShowDeptForm(!showDeptForm)}>
                <Plus className="h-4 w-4 mr-1" /> Add Department
              </Button>
            </div>
            {showDeptForm && (
              <div className="bg-card border border-border rounded-sm p-6">
                <h2 className="text-sm font-semibold mb-4">Create Department</h2>
                <form onSubmit={handleCreateDept} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Department Name</Label>
                    <Input value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="h-8 text-sm" required />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Head of Department</Label>
                    <Input value={deptForm.headOfDepartment ?? ""} onChange={(e) => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div className="col-span-2 flex gap-2 justify-end">
                    <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setShowDeptForm(false)}>Cancel</Button>
                    <Button type="submit" size="sm" className="h-8" disabled={createDeptMutation.isPending}>Create</Button>
                  </div>
                </form>
              </div>
            )}
            <div className="bg-card border border-border rounded-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Department", "Head Count", "Head of Department"].map((h) => (
                      <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-sm text-muted-foreground">No departments yet</td></tr>
                  ) : departments.map((d) => (
                    <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-3 text-xs font-medium text-card-foreground">{d.name}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">{d.headCount}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">{d.headOfDepartment ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Job Grades" && (
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Grade", "Band", "Min Salary (NGN)", "Max Salary (NGN)"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grades.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-sm text-muted-foreground">No job grades configured</td></tr>
                ) : grades.map((g) => (
                  <tr key={g.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-3 text-xs font-bold text-primary">{g.grade}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{g.band}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{new Intl.NumberFormat("en-NG").format(g.minSalary as number)}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{new Intl.NumberFormat("en-NG").format(g.maxSalary as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
