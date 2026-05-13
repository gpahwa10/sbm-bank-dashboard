import { useGetHiringTrends, useGetSourceEffectiveness, useGetRecruiterPerformance, useGetOfferAcceptance } from "@/lib/mock-hooks";
import { Layout } from "@/components/layout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#1e3a5f", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

export default function ReportsPage() {
  const { data: trends = [] } = useGetHiringTrends({ months: 6 });
  const { data: sources = [] } = useGetSourceEffectiveness();
  const { data: recruiterPerf = [] } = useGetRecruiterPerformance();
  const { data: offerAcceptance = [] } = useGetOfferAcceptance();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Analytics & Reports</h1>
          <p className="text-sm text-muted-foreground">Recruitment metrics and performance insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hiring Trends */}
          <div className="bg-card border border-border rounded-sm p-4">
            <h2 className="text-sm font-semibold text-card-foreground mb-4">Hiring Trends (6 months)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trends} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={2} dot={false} name="Applications" />
                <Line type="monotone" dataKey="hires" stroke="#16a34a" strokeWidth={2} dot={false} name="Hires" />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Source Effectiveness */}
          <div className="bg-card border border-border rounded-sm p-4">
            <h2 className="text-sm font-semibold text-card-foreground mb-4">Source Effectiveness</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sources} layout="vertical" margin={{ top: 0, right: 30, left: 50, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Conversion"]} />
                <Bar dataKey="conversionRate" fill="#2563eb" radius={[0, 2, 2, 0]} name="Conversion %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Offer Acceptance by Department */}
        <div className="bg-card border border-border rounded-sm p-4">
          <h2 className="text-sm font-semibold text-card-foreground mb-4">Offer Acceptance by Department</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Department", "Offered", "Accepted", "Declined", "Acceptance Rate"].map((h) => (
                  <th key={h} className="text-left py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {offerAcceptance.map((o) => (
                <tr key={o.department} className="border-b border-border last:border-0">
                  <td className="py-2.5 text-xs font-medium text-card-foreground">{o.department}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{o.offered}</td>
                  <td className="py-2.5 text-xs text-green-700">{o.accepted}</td>
                  <td className="py-2.5 text-xs text-red-600">{o.declined}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${o.acceptanceRate}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-card-foreground">{o.acceptanceRate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recruiter Performance */}
        <div className="bg-card border border-border rounded-sm p-4">
          <h2 className="text-sm font-semibold text-card-foreground mb-4">Recruiter Performance</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Recruiter", "Open Positions", "Candidates Managed", "Avg Days to Close", "Offers Extended"].map((h) => (
                  <th key={h} className="text-left py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recruiterPerf.map((r) => (
                <tr key={r.recruiterName} className="border-b border-border last:border-0">
                  <td className="py-2.5 text-xs font-medium text-card-foreground">{r.recruiterName}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{r.openPositions}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{r.candidatesManaged}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{r.avgTimeToClose} days</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{r.offersExtended}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
