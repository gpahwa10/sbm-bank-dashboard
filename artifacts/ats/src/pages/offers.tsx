import { useState } from "react";
import { useListOffers, useCreateOffer, useApproveOffer } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, XCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-500",
  pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  sent: "bg-purple-100 text-purple-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  withdrawn: "bg-slate-100 text-slate-500",
};

export default function OffersPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ applicationId: 1, baseSalary: 0, allowances: 0, bonus: 0, currency: "NGN", joiningDate: "", expiryDate: "" });
  const { toast } = useToast();
  const { data: offers = [], refetch } = useListOffers({ params: {} });
  const createMutation = useCreateOffer();
  const approveMutation = useApproveOffer();

  const fmt = (v: number | null | undefined, currency = "NGN") => {
    if (v == null) return "—";
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ data: form });
      toast({ title: "Offer created" });
      setShowForm(false);
      refetch();
    } catch {
      toast({ title: "Failed to create offer", variant: "destructive" });
    }
  };

  const handleApprove = async (id: number, action: string) => {
    try {
      await approveMutation.mutateAsync({ params: { id }, data: { action: action as "approve" | "reject", comments: "" } });
      toast({ title: `Offer ${action === "approve" ? "approved" : "rejected"}` });
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
            <h1 className="text-xl font-semibold text-foreground">Offers</h1>
            <p className="text-sm text-muted-foreground">{offers.length} offer{offers.length !== 1 ? "s" : ""}</p>
          </div>
          <Button size="sm" className="h-8" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> Create Offer
          </Button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-sm p-6">
            <h2 className="text-sm font-semibold mb-4">Create Offer Letter</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Application ID</Label>
                <Input type="number" value={form.applicationId} onChange={(e) => setForm({ ...form, applicationId: parseInt(e.target.value) })} className="h-8 text-sm" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Currency</Label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  {["NGN", "USD", "GBP", "EUR"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Base Salary</Label>
                <Input type="number" min={0} value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: parseFloat(e.target.value) })} className="h-8 text-sm" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Allowances</Label>
                <Input type="number" min={0} value={form.allowances} onChange={(e) => setForm({ ...form, allowances: parseFloat(e.target.value) })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Bonus</Label>
                <Input type="number" min={0} value={form.bonus} onChange={(e) => setForm({ ...form, bonus: parseFloat(e.target.value) })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Joining Date</Label>
                <Input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Offer Expiry</Label>
                <Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="h-8 text-sm" />
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="h-8" disabled={createMutation.isPending}>Create Offer</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Candidate", "Job", "Base Salary", "Total Package", "Status", "Joining Date", "Actions"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {offers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No offers yet</td></tr>
              ) : offers.map((o) => {
                const app = (o as Record<string, unknown>).application as Record<string, unknown> | undefined;
                const candidate = app?.candidate as Record<string, unknown> | undefined;
                const job = app?.job as Record<string, unknown> | undefined;
                return (
                  <tr key={o.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="text-xs font-medium text-card-foreground">{candidate ? `${candidate.firstName} ${candidate.lastName}` : `App #${o.applicationId}`}</div>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{(job?.title as string) ?? "—"}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{fmt(o.baseSalary as number, o.currency)}</td>
                    <td className="py-3 px-3 text-xs font-semibold text-card-foreground">{fmt(o.totalPackage as number, o.currency)}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide ${STATUS_COLORS[o.status] ?? "bg-slate-100"}`}>{o.status.replace("_", " ")}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{o.joiningDate ?? "—"}</td>
                    <td className="py-3 px-3">
                      {o.status === "pending_approval" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-green-700 border-green-200 hover:bg-green-50" onClick={() => handleApprove(o.id, "approve")}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-red-700 border-red-200 hover:bg-red-50" onClick={() => handleApprove(o.id, "reject")}>
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
