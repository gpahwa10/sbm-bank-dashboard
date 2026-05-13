import { useState } from "react";
import { useListApplications, useMoveApplicationStage } from "@/lib/mock-hooks";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft } from "lucide-react";

const STAGES = [
  { id: "applied", label: "Applied" },
  { id: "under_review", label: "Under Review" },
  { id: "longlisted", label: "Longlisted" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interview_scheduled", label: "Interview" },
  { id: "interviewed", label: "Interviewed" },
  { id: "offer_pending", label: "Offer Pending" },
  { id: "hired", label: "Hired" },
  { id: "rejected", label: "Rejected" },
];

export default function ApplicationsPage() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const { toast } = useToast();
  const { data, refetch } = useListApplications({});
  const moveMutation = useMoveApplicationStage();
  const apps = data?.data ?? [];

  const handleMove = async (id: number, newStage: string) => {
    try {
      await moveMutation.mutateAsync({ id, data: { stage: newStage } });
      refetch();
    } catch {
      toast({ title: "Failed to move stage", variant: "destructive" });
    }
  };

  const byStage = STAGES.reduce<Record<string, typeof apps>>((acc, s) => {
    acc[s.id] = apps.filter((a) => a.stage === s.id);
    return acc;
  }, {});

  const getStageIndex = (stage: string) => STAGES.findIndex((s) => s.id === stage);

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Applications Pipeline</h1>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} total application{(data?.total ?? 0) !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-1 border border-border rounded-sm overflow-hidden">
            <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>List</button>
            <button onClick={() => setView("kanban")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Kanban</button>
          </div>
        </div>

        {view === "list" ? (
          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Candidate", "Job", "Stage", "Applied", "Move"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-sm text-muted-foreground">No applications yet</td></tr>
                ) : apps.map((a) => {
                  const stageIdx = getStageIndex(a.stage);
                  const prevStage = stageIdx > 0 ? STAGES[stageIdx - 1].id : null;
                  const nextStage = stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1].id : null;
                  return (
                    <tr key={a.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="text-xs font-medium text-card-foreground">{a.candidate?.firstName} {a.candidate?.lastName}</div>
                        <div className="text-[10px] text-muted-foreground">{a.candidate?.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-xs text-card-foreground">{a.job?.title ?? "—"}</div>
                        <div className="text-[10px] text-muted-foreground">{a.job?.department}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide bg-primary/10 text-primary">
                          {STAGES.find((s) => s.id === a.stage)?.label ?? a.stage}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">{new Date(a.appliedAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1">
                          {prevStage && (
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => handleMove(a.id, prevStage)} title="Move back">
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                          )}
                          {nextStage && nextStage !== "rejected" && (
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => handleMove(a.id, nextStage)} title="Move forward">
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          )}
                          {a.stage !== "rejected" && (
                            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleMove(a.id, "rejected")}>Reject</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {STAGES.slice(0, 7).map((stage) => (
              <div key={stage.id} className="min-w-[200px] flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stage.label}</span>
                  <span className="text-[10px] font-bold bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">{byStage[stage.id]?.length ?? 0}</span>
                </div>
                <div className="space-y-2">
                  {(byStage[stage.id] ?? []).map((a) => {
                    const stageIdx = getStageIndex(a.stage);
                    const nextStage = stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1].id : null;
                    return (
                      <div key={a.id} className="bg-card border border-border rounded-sm p-3">
                        <p className="text-xs font-medium text-card-foreground">{a.candidate?.firstName} {a.candidate?.lastName}</p>
                        <p className="text-[10px] text-muted-foreground mb-2">{a.job?.title ?? "—"}</p>
                        {a.candidate?.aiMatchScore != null && (
                          <p className="text-[10px] text-primary font-semibold mb-2">AI: {a.candidate.aiMatchScore}%</p>
                        )}
                        {nextStage && nextStage !== "rejected" && (
                          <Button size="sm" variant="outline" className="h-5 text-[10px] px-1.5 w-full" onClick={() => handleMove(a.id, nextStage)}>
                            → {STAGES.find((s) => s.id === nextStage)?.label}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {(byStage[stage.id] ?? []).length === 0 && (
                    <div className="bg-muted/30 border border-dashed border-border rounded-sm p-4 text-center text-[10px] text-muted-foreground">Empty</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
