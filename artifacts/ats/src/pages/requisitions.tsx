import { useState } from "react";
import { useListRequisitions, useCreateRequisition, useApproveRequisition } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

function ReqRow({ req, onApprove }: { req: Record<string, unknown>; onApprove: (id: number, action: string) => void }) {
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-3">
        <div className="font-medium text-xs text-card-foreground">{req.jobTitle as string}</div>
        <div className="text-[10px] text-muted-foreground">{req.department as string}</div>
      </td>
      <td className="py-3 px-3 text-xs text-muted-foreground">{req.grade as string}</td>
      <td className="py-3 px-3 text-xs text-muted-foreground">{req.headcount as number}</td>
      <td className="py-3 px-3 text-xs text-muted-foreground capitalize">{(req.employmentType as string).replace("_", " ")}</td>
      <td className="py-3 px-3">
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide ${STATUS_COLORS[req.status as string] ?? "bg-slate-100 text-slate-600"}`}>
          {req.status as string}
        </span>
      </td>
      <td className="py-3 px-3 text-xs text-muted-foreground">{new Date(req.createdAt as string).toLocaleDateString()}</td>
      <td className="py-3 px-3">
        {req.status === "submitted" && (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-green-700 border-green-200 hover:bg-green-50" onClick={() => onApprove(req.id as number, "approve")}>
              <CheckCircle className="h-3 w-3 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-red-700 border-red-200 hover:bg-red-50" onClick={() => onApprove(req.id as number, "reject")}>
              <XCircle className="h-3 w-3 mr-1" /> Reject
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function RequisitionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ jobTitle: "", department: "Risk & Compliance", grade: "G5", headcount: 1, justification: "", employmentType: "permanent", location: "Lagos" });
  const { toast } = useToast();
  const { data, refetch } = useListRequisitions({ params: {} });
  const createMutation = useCreateRequisition();
  const approveMutation = useApproveRequisition();

  const reqs = data?.data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ data: form });
      toast({ title: "Requisition submitted successfully" });
      setShowForm(false);
      refetch();
    } catch {
      toast({ title: "Failed to submit requisition", variant: "destructive" });
    }
  };

  const handleApprove = async (id: number, action: string) => {
    try {
      await approveMutation.mutateAsync({ params: { id }, data: { action: action as "approve" | "reject", comments: "" } });
      toast({ title: `Requisition ${action === "approve" ? "approved" : "rejected"}` });
      refetch();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Requisitions</h1>
            <p className="text-sm text-muted-foreground">{reqs.length} total requisition{reqs.length !== 1 ? "s" : ""}</p>
          </div>
          <Button size="sm" className="h-8" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> New Requisition
          </Button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-sm p-6">
            <h2 className="text-sm font-semibold mb-4 text-card-foreground">New Hiring Requisition</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Job Title</Label>
                <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} className="h-8 text-sm" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Department</Label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  {["Risk & Compliance", "Treasury", "Retail Banking", "Operations", "IT", "Finance", "Legal", "HR"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Grade</Label>
                <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  {["G3", "G4", "G5", "G6", "G7", "G8", "G9", "M1", "M2", "M3"].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Headcount</Label>
                <Input type="number" min={1} value={form.headcount} onChange={(e) => setForm({ ...form, headcount: parseInt(e.target.value) })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Employment Type</Label>
                <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  {["permanent", "contract", "internship"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-8 text-sm" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Business Justification</Label>
                <textarea value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} className="w-full text-sm border border-input rounded-sm bg-background p-2 h-20 resize-none" required />
              </div>
              <div className="col-span-2 flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="h-8" disabled={createMutation.isPending}>Submit Requisition</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Position</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Grade</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">HC</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reqs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No requisitions found</td></tr>
              ) : (
                reqs.map((r) => <ReqRow key={r.id} req={r as unknown as Record<string, unknown>} onApprove={handleApprove} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
