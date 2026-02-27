import { useState } from "react";
import {
  Search, Filter, Download, Eye, Trash2, FileText,
  AlertTriangle, CheckCircle, Calendar, ChevronDown
} from "lucide-react";

const records = Array.from({ length: 20 }, (_, i) => ({
  id: `REC-${5000 - i}`,
  filename: ["employee_data.csv", "invoice_q4.pdf", "customer_list.txt", "passport_scan.png",
    "contracts.pdf", "feedback.json", "users_export.csv", "policy_doc.pdf"][i % 8],
  type: ["CSV", "PDF", "TXT", "IMG", "PDF", "JSON", "CSV", "PDF"][i % 8],
  detectedPII: [["Email", "Phone", "Aadhaar"], ["Name", "PAN"], ["Email", "Phone"], ["Name", "DOB"],
    ["Email", "SSN"], ["Phone", "Credit Card"], ["Email", "Aadhaar", "PAN"], ["Name", "Org"]][i % 8],
  riskScore: [87, 52, 34, 95, 71, 88, 76, 43, 62, 29, 91, 55, 38, 84, 67, 44, 73, 58, 33, 79][i],
  status: i % 5 === 0 ? "failed" : "completed",
  mode: ["full", "mask", "synthetic"][i % 3],
  tokens: { before: 1800 + i * 50, after: 1400 + i * 30 },
  user: ["alice@corp.com", "bob@corp.com", "charlie@corp.com"][i % 3],
  date: new Date(Date.now() - i * 3600000 * 6).toLocaleDateString(),
  size: `${(Math.random() * 4 + 0.1).toFixed(1)} MB`,
}));

function RiskBadge({ score }: { score: number }) {
  if (score >= 80) return <span className="status-badge bg-destructive/15 text-destructive border border-destructive/30">Critical</span>;
  if (score >= 60) return <span className="status-badge bg-warning/15 text-warning border border-warning/30">High</span>;
  if (score >= 40) return <span className="status-badge bg-primary/15 text-primary border border-primary/30">Medium</span>;
  return <span className="status-badge bg-success/15 text-success border border-success/30">Low</span>;
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const filtered = records.filter(r => {
    const matchSearch = r.filename.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchRisk = riskFilter === "all" ||
      (riskFilter === "critical" && r.riskScore >= 80) ||
      (riskFilter === "high" && r.riskScore >= 60 && r.riskScore < 80) ||
      (riskFilter === "low" && r.riskScore < 60);
    return matchSearch && matchStatus && matchRisk;
  });

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-2">
          <Search size={15} className="text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by filename or record ID..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
            className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40">
            <option value="all">All Risk</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
          <button className="flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary rounded-lg px-3 py-2 text-sm hover:bg-primary/15 transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Records", value: records.length, color: "text-foreground" },
          { label: "Completed", value: records.filter(r => r.status === "completed").length, color: "text-success" },
          { label: "High Risk", value: records.filter(r => r.riskScore >= 80).length, color: "text-destructive" },
          { label: "Avg Risk", value: Math.round(records.reduce((s, r) => s + r.riskScore, 0) / records.length), color: "text-warning" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-xl p-4 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{filtered.length} records found</span>
          <span className="text-xs text-muted-foreground">Sorted by most recent</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30">
              <tr>
                {["Record ID", "File", "Detected PII", "Risk", "Score", "Mode", "User", "Date", "Size", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{row.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={13} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{row.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.detectedPII.slice(0, 2).map(p => (
                        <span key={p} className="status-badge bg-primary/10 text-primary border-primary/20 border text-[10px]">{p}</span>
                      ))}
                      {row.detectedPII.length > 2 && <span className="status-badge bg-secondary text-muted-foreground border-border border text-[10px]">+{row.detectedPII.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><RiskBadge score={row.riskScore} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${row.riskScore}%`,
                          background: row.riskScore >= 80 ? "hsl(0 72% 51%)" : row.riskScore >= 60 ? "hsl(38 92% 50%)" : "hsl(199 89% 48%)"
                        }} />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{row.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="status-badge bg-accent/10 text-accent border-accent/20 border text-[10px] capitalize">{row.mode}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.user.split("@")[0]}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{row.size}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                        <Eye size={13} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                        <Download size={13} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
