import { useState } from "react";
import { useListOnboardingRecords, useCreateOnboardingRecord, useListOnboardingTasks, useUpdateOnboardingTask } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-500",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

function TaskList({ recordId }: { recordId: number }) {
  const { data: tasks = [], refetch } = useListOnboardingTasks({ params: { id: recordId } });
  const updateMutation = useUpdateOnboardingTask();
  const { toast } = useToast();

  const handleComplete = async (taskId: number) => {
    try {
      await updateMutation.mutateAsync({ params: { taskId }, data: { status: "completed", completedAt: new Date().toISOString().split("T")[0] } });
      refetch();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const categories = [...new Set(tasks.map((t) => t.category))];

  return (
    <div className="p-4 bg-muted/20 border-t border-border">
      {categories.map((cat) => (
        <div key={cat} className="mb-3">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{cat.replace("_", " ")}</h4>
          <div className="space-y-1">
            {tasks.filter((t) => t.category === cat).map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <button
                  onClick={() => task.status !== "completed" && handleComplete(task.id)}
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${task.status === "completed" ? "bg-green-500 border-green-500" : "border-border hover:border-primary"}`}
                >
                  {task.status === "completed" && <CheckCircle className="w-3 h-3 text-white" />}
                </button>
                <span className={`text-xs ${task.status === "completed" ? "line-through text-muted-foreground" : "text-card-foreground"}`}>{task.title}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">Due: {task.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [form, setForm] = useState({ candidateId: 1, startDate: "", department: "Risk & Compliance", manager: "" });
  const { toast } = useToast();
  const { data: records = [], refetch } = useListOnboardingRecords({ params: {} });
  const createMutation = useCreateOnboardingRecord();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ data: form });
      toast({ title: "Onboarding record created" });
      setShowForm(false);
      refetch();
    } catch {
      toast({ title: "Failed to create onboarding record", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Onboarding</h1>
            <p className="text-sm text-muted-foreground">{records.length} onboarding record{records.length !== 1 ? "s" : ""}</p>
          </div>
          <Button size="sm" className="h-8" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> New Onboarding
          </Button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-sm p-6">
            <h2 className="text-sm font-semibold mb-4">Initiate Onboarding</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Candidate ID</Label>
                <Input type="number" value={form.candidateId} onChange={(e) => setForm({ ...form, candidateId: parseInt(e.target.value) })} className="h-8 text-sm" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="h-8 text-sm" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Department</Label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  {["Risk & Compliance", "Treasury", "Retail Banking", "Operations", "IT", "Finance", "Legal", "HR"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Reporting Manager</Label>
                <Input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} className="h-8 text-sm" />
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="h-8" disabled={createMutation.isPending}>Start Onboarding</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-border rounded-sm overflow-hidden">
          {records.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No onboarding records found</div>
          ) : records.map((r) => {
            const rec = r as Record<string, unknown>;
            const candidate = rec.candidate as Record<string, unknown> | undefined;
            const pct = rec.totalTasks ? Math.round((rec.completedTasks as number / rec.totalTasks as number) * 100) : 0;
            const isExpanded = expanded === r.id;
            return (
              <div key={r.id} className="border-b border-border last:border-0">
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : r.id)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-card-foreground">
                      {candidate ? `${candidate.firstName} ${candidate.lastName}` : `Candidate #${r.candidateId}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{r.department} · Manager: {r.manager ?? "TBD"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-medium text-card-foreground">{r.completedTasks}/{r.totalTasks} tasks</p>
                      <div className="w-32 h-1.5 bg-muted rounded-full mt-1">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide ${STATUS_COLORS[r.status] ?? "bg-slate-100"}`}>{r.status.replace("_", " ")}</span>
                    <p className="text-xs text-muted-foreground">Start: {r.startDate}</p>
                  </div>
                </div>
                {isExpanded && <TaskList recordId={r.id} />}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
