import { useGetComplianceDashboard, useListAuditLogs } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ShieldCheck, AlertTriangle, Clock, Activity } from "lucide-react";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border border-border rounded-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-card-foreground">{value}</div>
    </div>
  );
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-600",
  approve: "bg-purple-100 text-purple-700",
  login: "bg-slate-100 text-slate-600",
};

export default function CompliancePage() {
  const { data: summary } = useGetComplianceDashboard();
  const { data: logsData } = useListAuditLogs({ params: {} });
  const logs = logsData?.data ?? [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Compliance & Audit</h1>
          <p className="text-sm text-muted-foreground">Regulatory compliance monitoring and audit trail</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="SLA Breaches" value={summary?.slaBreaches ?? 0} icon={AlertTriangle} color="text-red-500" />
          <StatCard label="Overdue Approvals" value={summary?.overdueApprovals ?? 0} icon={Clock} color="text-amber-500" />
          <StatCard label="Workflow Bottlenecks" value={summary?.workflowBottlenecks ?? 0} icon={Activity} color="text-orange-500" />
          <StatCard label="Audit Events (Recent)" value={summary?.recentAuditEvents?.length ?? 0} icon={ShieldCheck} color="text-primary" />
        </div>

        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-card-foreground">Audit Log</h2>
            <p className="text-xs text-muted-foreground">{logsData?.total ?? 0} total audit events</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Timestamp", "User", "Action", "Entity", "IP Address", "Details"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-muted-foreground">No audit events recorded</td></tr>
              ) : logs.map((l) => {
                const actionKey = l.action.split("_")[0].toLowerCase();
                return (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 text-[10px] text-muted-foreground whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-xs text-card-foreground">{l.userName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wide ${ACTION_COLORS[actionKey] ?? "bg-slate-100 text-slate-600"}`}>
                        {l.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground capitalize">{l.entityType} #{l.entityId}</td>
                    <td className="py-2.5 px-3 text-[10px] font-mono text-muted-foreground">{l.ipAddress ?? "—"}</td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground truncate max-w-xs">{l.details ?? "—"}</td>
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
