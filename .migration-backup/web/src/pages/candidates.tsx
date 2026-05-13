import { useState } from "react";
import { useListCandidates, useCreateCandidate, useGenerateCandidateAiAnalysis } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Sparkles } from "lucide-react";

const SOURCE_COLORS: Record<string, string> = {
  linkedin: "bg-blue-100 text-blue-700",
  referral: "bg-purple-100 text-purple-700",
  direct: "bg-slate-100 text-slate-600",
  agency: "bg-amber-100 text-amber-700",
  portal: "bg-green-100 text-green-700",
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground">—</span>;
  const color = score >= 80 ? "text-green-700 bg-green-100" : score >= 65 ? "text-amber-700 bg-amber-100" : "text-red-700 bg-red-100";
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${color}`}>{score}%</span>;
}

export default function CandidatesPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [analysingId, setAnalysingId] = useState<number | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", currentRole: "", currentCompany: "", source: "direct", yearsOfExperience: 5 });
  const { toast } = useToast();
  const { data, refetch } = useListCandidates(search ? { search } : {});
  const createMutation = useCreateCandidate();
  const analysisMutation = useGenerateCandidateAiAnalysis();
  const candidates = data?.data ?? [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ data: { ...form, skills: [] } });
      toast({ title: "Candidate added" });
      setShowForm(false);
      refetch();
    } catch {
      toast({ title: "Failed to add candidate", variant: "destructive" });
    }
  };

  const handleAnalyse = async (id: number) => {
    setAnalysingId(id);
    try {
      await analysisMutation.mutateAsync({ id });
      toast({ title: "AI analysis complete" });
      refetch();
    } catch {
      toast({ title: "Analysis failed", variant: "destructive" });
    } finally {
      setAnalysingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Candidate Pool</h1>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} candidate{(data?.total ?? 0) !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates…" className="h-8 text-sm w-52" />
            <Button size="sm" className="h-8" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-1" /> Add Candidate
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-sm p-6">
            <h2 className="text-sm font-semibold mb-4">Add Candidate</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              {[
                { field: "firstName", label: "First Name" },
                { field: "lastName", label: "Last Name" },
                { field: "email", label: "Email", type: "email" },
                { field: "phone", label: "Phone" },
                { field: "currentRole", label: "Current Role" },
                { field: "currentCompany", label: "Current Company" },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">{label}</Label>
                  <Input type={type ?? "text"} value={form[field as keyof typeof form] as string} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="h-8 text-sm" />
                </div>
              ))}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Source</Label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  {["direct", "linkedin", "referral", "agency", "portal"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Years of Experience</Label>
                <Input type="number" min={0} value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: parseInt(e.target.value) })} className="h-8 text-sm" />
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="h-8" disabled={createMutation.isPending}>Add Candidate</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Name", "Current Role", "Experience", "Source", "AI Score", "Actions"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">No candidates found</td></tr>
              ) : candidates.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="text-xs font-medium text-card-foreground">{c.firstName} {c.lastName}</div>
                    <div className="text-[10px] text-muted-foreground">{c.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-xs text-card-foreground">{c.currentRole ?? "—"}</div>
                    <div className="text-[10px] text-muted-foreground">{c.currentCompany ?? ""}</div>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{c.yearsOfExperience != null ? `${c.yearsOfExperience} yrs` : "—"}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide ${SOURCE_COLORS[c.source] ?? "bg-slate-100 text-slate-600"}`}>{c.source}</span>
                  </td>
                  <td className="py-3 px-3"><ScoreBadge score={c.aiMatchScore ?? null} /></td>
                  <td className="py-3 px-3">
                    <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => handleAnalyse(c.id)} disabled={analysingId === c.id}>
                      <Sparkles className="h-3 w-3 mr-1" />
                      {analysingId === c.id ? "Analysing…" : "AI Analysis"}
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
