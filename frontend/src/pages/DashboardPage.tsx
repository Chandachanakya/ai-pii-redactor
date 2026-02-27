import { useNavigate } from "react-router-dom";
import {
  FileText, ShieldCheck, AlertTriangle, TrendingUp,
  Upload, Clock, Cpu, Lock, CheckCircle, ArrowUpRight,
  Activity, Users, Database
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

const areaData = [
  { date: "Jan", scans: 120, redacted: 95 },
  { date: "Feb", scans: 185, redacted: 160 },
  { date: "Mar", scans: 240, redacted: 210 },
  { date: "Apr", scans: 310, redacted: 280 },
  { date: "May", scans: 295, redacted: 260 },
  { date: "Jun", scans: 420, redacted: 390 },
  { date: "Jul", scans: 510, redacted: 470 },
];

const piiTypeData = [
  { type: "Email", count: 1842, color: "#0ea5e9" },
  { type: "Phone", count: 1234, color: "#8b5cf6" },
  { type: "Name", count: 980, color: "#22d3ee" },
  { type: "Aadhaar", count: 612, color: "#f59e0b" },
  { type: "PAN", count: 445, color: "#ef4444" },
  { type: "Credit Card", count: 289, color: "#ec4899" },
];

const recentActivity = [
  { id: "REC-4821", file: "employee_data.csv", type: "CSV", risk: 87, status: "completed", time: "2m ago", pii: ["Email", "Phone", "Aadhaar"] },
  { id: "REC-4820", file: "invoice_q4.pdf", type: "PDF", risk: 52, status: "completed", time: "15m ago", pii: ["Name", "PAN"] },
  { id: "REC-4819", file: "customer_feedback.txt", type: "TXT", risk: 34, status: "completed", time: "1h ago", pii: ["Email", "Phone"] },
  { id: "REC-4818", file: "passport_scan.png", type: "IMG", risk: 95, status: "completed", time: "2h ago", pii: ["Name", "DOB", "ID"] },
  { id: "REC-4817", file: "contracts_batch.zip", type: "ZIP", risk: 61, status: "processing", time: "2h ago", pii: [] },
];

const metrics = [
  { label: "Total Scans", value: "14,892", change: "+12.4%", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
  { label: "PII Detected", value: "5,431", change: "+8.7%", icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
  { label: "High Risk Files", value: "234", change: "-3.2%", icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  { label: "Avg Risk Score", value: "47.2", change: "+2.1", icon: Activity, color: "text-accent", bg: "bg-accent/10" },
];

function RiskBadge({ score }: { score: number }) {
  if (score >= 80) return <span className="status-badge bg-destructive/15 text-destructive border border-destructive/30">Critical {score}</span>;
  if (score >= 60) return <span className="status-badge bg-warning/15 text-warning border border-warning/30">High {score}</span>;
  if (score >= 40) return <span className="status-badge bg-primary/15 text-primary border border-primary/30">Medium {score}</span>;
  return <span className="status-badge bg-success/15 text-success border border-success/30">Low {score}</span>;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="metric-card">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${m.bg}`}>
                <m.icon size={18} className={m.color} />
              </div>
              <span className="text-xs font-medium text-success flex items-center gap-0.5">
                <TrendingUp size={11} /> {m.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">{m.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Scan Activity</h3>
              <p className="text-xs text-muted-foreground">Monthly scans vs redacted files</p>
            </div>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="scansGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="redactedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(220 14% 11%)", border: "1px solid hsl(220 13% 18%)", borderRadius: "8px", fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }} itemStyle={{ color: "#e2e8f0" }}
              />
              <Area type="monotone" dataKey="scans" stroke="#0ea5e9" strokeWidth={2} fill="url(#scansGrad)" name="Total Scans" />
              <Area type="monotone" dataKey="redacted" stroke="#8b5cf6" strokeWidth={2} fill="url(#redactedGrad)" name="Redacted" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* PII Types */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">PII Type Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Detected entity types</p>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={piiTypeData} layout="vertical" barSize={10}>
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="type" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                contentStyle={{ background: "hsl(220 14% 11%)", border: "1px solid hsl(220 13% 18%)", borderRadius: "8px", fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {piiTypeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Upload, label: "New Redaction", desc: "Upload & redact a document", path: "/upload", primary: true },
          { icon: Database, label: "View History", desc: "Browse all processed files", path: "/history", primary: false },
          { icon: Users, label: "Admin Panel", desc: "Manage users & patterns", path: "/admin", primary: false },
        ].map(a => (
          <button key={a.label} onClick={() => navigate(a.path)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:scale-[1.01] text-left ${a.primary
              ? "gradient-bg border-transparent shadow-glow text-primary-foreground"
              : "glass-card border-border hover:border-primary/30 hover:bg-primary/5"}`}>
            <div className={`p-2 rounded-lg ${a.primary ? "bg-white/15" : "bg-primary/10"}`}>
              <a.icon size={16} className={a.primary ? "text-primary-foreground" : "text-primary"} />
            </div>
            <div>
              <div className={`text-sm font-semibold ${a.primary ? "text-primary-foreground" : "text-foreground"}`}>{a.label}</div>
              <div className={`text-xs mt-0.5 ${a.primary ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{a.desc}</div>
            </div>
            <ArrowUpRight size={14} className="ml-auto opacity-60" />
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Redactions</h3>
          <button onClick={() => navigate("/history")} className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Record ID", "File", "Type", "PII Types", "Risk Score", "Status", "Time"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {recentActivity.map(row => (
                <tr key={row.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-primary">{row.id}</td>
                  <td className="py-3 pr-4 font-medium text-foreground text-xs">{row.file}</td>
                  <td className="py-3 pr-4">
                    <span className="status-badge bg-secondary text-muted-foreground border-border border">{row.type}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {row.pii.slice(0, 2).map(p => (
                        <span key={p} className="status-badge bg-primary/10 text-primary border-primary/20 border">{p}</span>
                      ))}
                      {row.pii.length > 2 && <span className="status-badge bg-secondary text-muted-foreground border-border border">+{row.pii.length - 2}</span>}
                    </div>
                  </td>
                  <td className="py-3 pr-4"><RiskBadge score={row.risk} /></td>
                  <td className="py-3 pr-4">
                    {row.status === "completed"
                      ? <span className="flex items-center gap-1 text-success text-xs"><CheckCircle size={12} /> Done</span>
                      : <span className="flex items-center gap-1 text-warning text-xs"><Clock size={12} /> Processing</span>}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Cpu, label: "AI Engine", status: "Operational", ok: true },
          { icon: Lock, label: "Encryption", status: "AES-256 Active", ok: true },
          { icon: Database, label: "Database", status: "Connected", ok: true },
          { icon: ShieldCheck, label: "Audit Logging", status: "Active", ok: true },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg"><s.icon size={15} className="text-success" /></div>
            <div>
              <div className="text-xs font-medium text-foreground">{s.label}</div>
              <div className="text-[11px] text-success">{s.status}</div>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
