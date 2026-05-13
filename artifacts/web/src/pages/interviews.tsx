import { useState } from "react";
import { useListInterviews, useCreateInterview, useUpdateInterview, useSubmitInterviewFeedback } from "@/lib/mock-hooks";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, CheckCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rescheduled: "bg-amber-100 text-amber-700",
};

export default function InterviewsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  const [newInterview, setNewInterview] = useState({ applicationId: 1, scheduledAt: "", duration: 60, type: "behavioral", location: "Conference Room A" });
  const [feedback, setFeedback] = useState({ interviewerName: "", overallScore: 7, technicalScore: "", behavioralScore: "", recommendation: "hire", comments: "" });
  const { toast } = useToast();
  const { data: interviews = [], refetch } = useListInterviews({});
  const createMutation = useCreateInterview();
  const updateMutation = useUpdateInterview();
  const feedbackMutation = useSubmitInterviewFeedback();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ data: { ...newInterview, panelMembers: [] } });
      toast({ title: "Interview scheduled" });
      setShowForm(false);
      refetch();
    } catch {
      toast({ title: "Failed to schedule interview", variant: "destructive" });
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status: "completed" } });
      refetch();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFeedback) return;
    try {
      await feedbackMutation.mutateAsync({
        id: showFeedback,
        data: {
          ...feedback,
          overallScore: Number(feedback.overallScore),
          technicalScore: feedback.technicalScore ? Number(feedback.technicalScore) : undefined,
          behavioralScore: feedback.behavioralScore ? Number(feedback.behavioralScore) : undefined,
        },
      });
      toast({ title: "Feedback submitted" });
      setShowFeedback(null);
      refetch();
    } catch {
      toast({ title: "Failed to submit feedback", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Interviews</h1>
            <p className="text-sm text-muted-foreground">{interviews.length} scheduled interview{interviews.length !== 1 ? "s" : ""}</p>
          </div>
          <Button size="sm" className="h-8" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> Schedule Interview
          </Button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-sm p-6">
            <h2 className="text-sm font-semibold mb-4">Schedule Interview</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Application ID</Label>
                <Input type="number" value={newInterview.applicationId} onChange={(e) => setNewInterview({ ...newInterview, applicationId: parseInt(e.target.value) })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Date & Time</Label>
                <Input type="datetime-local" value={newInterview.scheduledAt} onChange={(e) => setNewInterview({ ...newInterview, scheduledAt: e.target.value })} className="h-8 text-sm" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Duration (mins)</Label>
                <Input type="number" value={newInterview.duration} onChange={(e) => setNewInterview({ ...newInterview, duration: parseInt(e.target.value) })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Interview Type</Label>
                <select value={newInterview.type} onChange={(e) => setNewInterview({ ...newInterview, type: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  {["behavioral", "technical", "case_study", "panel", "hr_screening"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Location</Label>
                <Input value={newInterview.location} onChange={(e) => setNewInterview({ ...newInterview, location: e.target.value })} className="h-8 text-sm" />
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="h-8" disabled={createMutation.isPending}>Schedule</Button>
              </div>
            </form>
          </div>
        )}

        {showFeedback && (
          <div className="bg-card border border-border rounded-sm p-6">
            <h2 className="text-sm font-semibold mb-4">Submit Interview Feedback — Interview #{showFeedback}</h2>
            <form onSubmit={handleFeedback} className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Interviewer Name</Label>
                <Input value={feedback.interviewerName} onChange={(e) => setFeedback({ ...feedback, interviewerName: e.target.value })} className="h-8 text-sm" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Overall Score (1-10)</Label>
                <Input type="number" min={1} max={10} value={feedback.overallScore} onChange={(e) => setFeedback({ ...feedback, overallScore: parseInt(e.target.value) })} className="h-8 text-sm" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Technical Score (optional)</Label>
                <Input type="number" min={1} max={10} value={feedback.technicalScore} onChange={(e) => setFeedback({ ...feedback, technicalScore: e.target.value })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Behavioral Score (optional)</Label>
                <Input type="number" min={1} max={10} value={feedback.behavioralScore} onChange={(e) => setFeedback({ ...feedback, behavioralScore: e.target.value })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Recommendation</Label>
                <select value={feedback.recommendation} onChange={(e) => setFeedback({ ...feedback, recommendation: e.target.value })} className="w-full h-8 text-sm border border-input rounded-sm bg-background px-2">
                  {["strong_hire", "hire", "maybe", "no_hire"].map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Comments</Label>
                <Input value={feedback.comments} onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })} className="h-8 text-sm" />
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => setShowFeedback(null)}>Cancel</Button>
                <Button type="submit" size="sm" className="h-8" disabled={feedbackMutation.isPending}>Submit Feedback</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Candidate", "Job", "Date & Time", "Type", "Duration", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {interviews.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No interviews scheduled</td></tr>
              ) : interviews.map((i) => {
                const app = i.application;
                const candidate = app?.candidate;
                const job = app?.job;
                const candidateName =
                  candidate != null
                    ? `${candidate.firstName} ${candidate.lastName}`
                    : "Unknown";
                return (
                <tr key={i.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="text-xs font-medium text-card-foreground">
                      {app != null ? candidateName : `Application #${i.applicationId}`}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">
                    {job?.title ?? "—"}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{new Date(i.scheduledAt).toLocaleString()}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground capitalize">{i.type.replace("_", " ")}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{i.duration}m</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide ${STATUS_COLORS[i.status] ?? "bg-slate-100"}`}>{i.status}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      {i.status === "scheduled" && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => handleComplete(i.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" /> Complete
                        </Button>
                      )}
                      {i.status === "completed" && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setShowFeedback(showFeedback === i.id ? null : i.id)}>
                          Feedback
                        </Button>
                      )}
                    </div>
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
