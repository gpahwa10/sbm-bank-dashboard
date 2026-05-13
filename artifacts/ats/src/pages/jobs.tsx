import { useState } from "react";
import { useListJobs, useCreateJob, useUpdateJob } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, ExternalLink } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-500",
  active: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-500",
  on_hold: "bg-amber-100 text-amber-700",
};

export default function JobsPage() {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({ title: "", department: "Risk & Compliance", type: "external", description: "", source: "LinkedIn" });
  const { toast } = useToast();
  const { data: jobs = [], refetch } = useListJobs({ params: filterStatus ? { status: filterStatus } : {} });
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ data: { ...form, competencies: [] } });
      toast({ title: "Job posting created" });
      setShowForm(false);
      refetch();
    } catch {
      toast({ title: "Failed to create job", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (id: number, status: string) => {
    const newStatus = status === "active" ? "closed" : "active";
    try {
      await updateMutation.mutateAsync({ params: { id }, data: { status: newStatus } });
      refetch();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Job Postings</h1>
            <p className="text-sm text-muted-foreground">{jobs.length} posting{jobs.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-8 text-xs border border-input rounded-sm bg-background px-2">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="on_hold">On Hold</option>
            </select>
            <Button size="sm" className="h-8" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-1" /> Post Job
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-sm p-6">
            <h2 className="text-sm font-semibold mb-4 text-card-foreground">Create Job Posting</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Job Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-8 text-sm" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Department</Label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  {["Risk & Compliance", "Treasury", "Retail Banking", "Operations", "IT", "Finance", "Legal", "HR"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Posting Type</Label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  <option value="external">External</option>
                  <option value="internal">Internal</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Primary Source</Label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  {["LinkedIn", "Job Boards", "Employee Referral", "Company Portal", "Recruitment Agency"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Description</Label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full text-sm border border-input rounded-sm bg-background p-2 h-20 resize-none" />
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="h-8" disabled={createMutation.isPending}>Create Posting</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Apps</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No jobs found</td></tr>
              ) : jobs.map((j) => (
                <tr key={j.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 text-xs font-medium text-card-foreground">{j.title}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{j.department}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground capitalize">{j.type}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{j.source ?? "—"}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{j.applicationCount}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide ${STATUS_COLORS[j.status] ?? "bg-slate-100"}`}>{j.status}</span>
                  </td>
                  <td className="py-3 px-3">
                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => handleToggleStatus(j.id, j.status)}>
                      {j.status === "active" ? "Close" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
