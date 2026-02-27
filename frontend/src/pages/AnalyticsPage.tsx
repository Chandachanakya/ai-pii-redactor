import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, CartesianGrid
} from "recharts";
import { Download, TrendingUp, TrendingDown, FileText, Shield } from "lucide-react";

const monthlyData = [
  { month: "Aug", scans: 280, pii: 1240, risk_avg: 51, tokens_saved: 8400 },
  { month: "Sep", scans: 320, pii: 1580, risk_avg: 48, tokens_saved: 9800 },
  { month: "Oct", scans: 390, pii: 1820, risk_avg: 55, tokens_saved: 11200 },
  { month: "Nov", scans: 410, pii: 1950, risk_avg: 47, tokens_saved: 12100 },
  { month: "Dec", scans: 470, pii: 2240, risk_avg: 53, tokens_saved: 14000 },
  { month: "Jan", scans: 510, pii: 2450, risk_avg: 44, tokens_saved: 15600 },
  { month: "Feb", scans: 589, pii: 2810, risk_avg: 42, tokens_saved: 17800 },
];

const piiBreakdown = [
  { name: "Email", value: 2842, fill: "#0ea5e9" },
  { name: "Phone", value: 1834, fill: "#8b5cf6" },
  { name: "Person", value: 1240, fill: "#22d3ee" },
  { name: "Aadhaar", value: 812, fill: "#f59e0b" },
  { name: "PAN", value: 645, fill: "#ef4444" },
  { name: "Credit Card", value: 389, fill: "#ec4899" },
  { name: "SSN", value: 241, fill: "#a78bfa" },
  { name: "IP", value: 189, fill: "#34d399" },
];

const riskDist = [
  { range: "0-20", count: 124, fill: "#22d3ee" },
  { range: "21-40", count: 289, fill: "#0ea5e9" },
  { range: "41-60", count: 341, fill: "#f59e0b" },
  { range: "61-80", count: 218, fill: "#f97316" },
  { range: "81-100", count: 117, fill: "#ef4444" },
];

const userActivity = [
  { user: "alice", scans: 142, pii: 620 },
  { user: "bob", scans: 98, pii: 445 },
  { user: "charlie", scans: 187, pii: 890 },
  { user: "diana", scans: 76, pii: 310 },
  { user: "evan", scans: 201, pii: 960 },
];

const TOOLTIP_STYLE = {
  contentStyle: { background: "hsl(220 14% 11%)", border: "1px solid hsl(220 13% 18%)", borderRadius: "8px", fontSize: 12 },
  labelStyle: { color: "#94a3b8" },
  itemStyle: { color: "#e2e8f0" },
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Scans (Feb)", value: "589", delta: "+15.5%", up: true },
          { label: "PII Entities Found", value: "2,810", delta: "+14.7%", up: true },
          { label: "Avg Risk Score", value: "42.1", delta: "-4.3%", up: false },
          { label: "Tokens Saved", value: "17,800", delta: "+13.9%", up: true },
        ].map(k => (
          <div key={k.label} className="metric-card">
            <div className="text-2xl font-bold text-foreground">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{k.label}</div>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${k.up ? "text-success" : "text-destructive"}`}>
              {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {k.delta} vs last month
            </div>
          </div>
        ))}
      </div>

      {/* Scan activity trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Scan Volume & PII Detection</h3>
              <p className="text-xs text-muted-foreground">7-month trend</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 hover:border-border/80 transition-colors">
              <Download size={12} /> Export CSV
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Area yAxisId="left" type="monotone" dataKey="scans" stroke="#0ea5e9" strokeWidth={2} fill="url(#ag1)" name="Scans" />
              <Area yAxisId="right" type="monotone" dataKey="pii" stroke="#8b5cf6" strokeWidth={2} fill="url(#ag2)" name="PII Detected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* PII Pie */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">PII Entity Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-3">By type</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={piiBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                {piiBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {piiBreakdown.slice(0, 6).map(p => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Distribution */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Risk Score Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Files by risk range</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskDist} barSize={32}>
              <XAxis dataKey="range" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Files">
                {riskDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Token Reduction */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Token Reduction Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Tokens saved via redaction</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="tokens_saved" stroke="#22d3ee" strokeWidth={2.5} dot={{ fill: "#22d3ee", r: 4 }} name="Tokens Saved" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Activity */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">User Activity</h3>
        <p className="text-xs text-muted-foreground mb-4">Scans and PII per user</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={userActivity} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
            <XAxis dataKey="user" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            <Bar dataKey="scans" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Scans" barSize={20} />
            <Bar dataKey="pii" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="PII Entities" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Compliance Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "GDPR Compliance", body: "All PII data is processed in-memory and never stored in raw form. Redacted outputs are encrypted using AES-256. Full audit trail maintained without PII exposure. Reports contain no raw sensitive values.", color: "border-success/30 bg-success/5" },
          { label: "DPDP Act (India) 2023", body: "Aadhaar and PAN detection aligned with Indian Digital Personal Data Protection Act. Purpose limitation and data minimization principles enforced. Consent-based access with role-level controls.", color: "border-primary/30 bg-primary/5" },
        ].map(c => (
          <div key={c.label} className={`rounded-xl p-5 border ${c.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={15} className="text-success" />
              <h4 className="text-sm font-semibold text-foreground">{c.label}</h4>
              <span className="ml-auto status-badge bg-success/15 text-success border-success/30 border">Compliant</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
