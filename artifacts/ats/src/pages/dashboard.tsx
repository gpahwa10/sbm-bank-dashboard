import { useGetHrDashboard, useGetPipelineStats, useGetRecentActivity } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { useAuthStore } from "@/lib/auth";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Briefcase, Users, FileText, CheckCircle, TrendingUp, Clock } from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, accent }: { label: string; value: string | number; sub?: string; icon: React.ElementType; accent?: string }) {
  return (
    <div className="bg-card border border-border p-4 rounded-sm">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon className={`h-4 w-4 ${accent ?? "text-muted-foreground"}`} />
      </div>
      <div className="text-2xl font-bold text-card-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: summary } = useGetHrDashboard();
  const { data: pipeline } = useGetPipelineStats();
  const { data: activity } = useGetRecentActivity();

  const COLORS = ["#1e3a5f", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff", "#1e40af", "#1d4ed8"];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">HR Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user?.name}. Here's what's happening today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Open Positions" value={summary?.openPositions ?? "—"} icon={Briefcase} accent="text-primary" />
          <StatCard label="Active Requisitions" value={summary?.activeRequisitions ?? "—"} icon={FileText} />
          <StatCard label="In Pipeline" value={summary?.candidatesInPipeline ?? "—"} icon={Users} />
          <StatCard label="Offers Pending" value={summary?.offersPending ?? "—"} icon={CheckCircle} accent="text-amber-500" />
          <StatCard label="Hires This Month" value={summary?.hiresThisMonth ?? "—"} icon={TrendingUp} accent="text-green-600" />
          <StatCard label="Avg. Hire Days" value={summary?.avgHiringDays ?? "—"} sub="days to hire" icon={Clock} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Chart */}
          <div className="bg-card border border-border rounded-sm p-4">
            <h2 className="text-sm font-semibold text-card-foreground mb-4">Candidate Pipeline</h2>
            {pipeline && pipeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pipeline} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} tickFormatter={(v) => v.replace("_", " ")} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [v, "Count"]} labelFormatter={(l) => l.replace(/_/g, " ")} />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {pipeline.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No pipeline data yet</div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-sm p-4">
            <h2 className="text-sm font-semibold text-card-foreground mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {activity?.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-1.5 border-b border-border last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-card-foreground truncate">{a.action.replace(/_/g, " ")} — {a.entityLabel}</p>
                    <p className="text-[10px] text-muted-foreground">{a.userName} · {new Date(a.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              )) ?? (
                <div className="text-sm text-muted-foreground py-4 text-center">No recent activity</div>
              )}
            </div>
          </div>
        </div>

        {/* Recruiter Workload */}
        {summary?.recruiterWorkload && (
          <div className="bg-card border border-border rounded-sm p-4">
            <h2 className="text-sm font-semibold text-card-foreground mb-3">Recruiter Workload</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground">Recruiter</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Open Positions</th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground">Active Candidates</th>
                </tr>
              </thead>
              <tbody>
                {summary.recruiterWorkload.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2 text-card-foreground font-medium text-xs">{r.recruiterName}</td>
                    <td className="py-2 text-right text-xs text-muted-foreground">{r.openPositions}</td>
                    <td className="py-2 text-right text-xs text-muted-foreground">{r.activeCandidates}</td>
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
