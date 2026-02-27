import { useState } from "react";
import {
  Users, Shield, Plus, Edit2, Trash2, CheckCircle, AlertTriangle,
  Search, Code2, Save, XCircle, Key, Activity
} from "lucide-react";
import { toast } from "sonner";

const usersData = [
  { id: "u1", name: "Alice Johnson", email: "alice@corp.com", role: "admin", status: "active", scans: 142, lastActive: "Just now" },
  { id: "u2", name: "Bob Smith", email: "bob@corp.com", role: "user", status: "active", scans: 98, lastActive: "2h ago" },
  { id: "u3", name: "Charlie Brown", email: "charlie@corp.com", role: "user", status: "active", scans: 187, lastActive: "1d ago" },
  { id: "u4", name: "Diana Prince", email: "diana@corp.com", role: "user", status: "inactive", scans: 76, lastActive: "5d ago" },
  { id: "u5", name: "Evan Williams", email: "evan@corp.com", role: "user", status: "active", scans: 201, lastActive: "3h ago" },
];

const defaultPatterns = [
  { id: "p1", name: "Aadhaar Number", pattern: "\\b[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}\\b", created_by: "system", active: true },
  { id: "p2", name: "PAN Card", pattern: "[A-Z]{5}[0-9]{4}[A-Z]{1}", created_by: "system", active: true },
  { id: "p3", name: "Indian Phone", pattern: "(\\+91[\\-\\s]?)?[6-9]\\d{9}", created_by: "system", active: true },
  { id: "p4", name: "Credit Card (Luhn)", pattern: "\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\\b", created_by: "system", active: true },
  { id: "p5", name: "Custom Employee ID", pattern: "EMP[0-9]{5}", created_by: "alice@corp.com", active: true },
];

const auditLogs = [
  { id: "al1", user: "alice@corp.com", action: "FILE_UPLOADED", resource: "employee_data.csv", timestamp: "2026-02-27 14:32:10", risk: "high" },
  { id: "al2", user: "bob@corp.com", action: "REDACTION_COMPLETED", resource: "REC-4820", timestamp: "2026-02-27 14:15:44", risk: "low" },
  { id: "al3", user: "charlie@corp.com", action: "REPORT_EXPORTED", resource: "CSV report", timestamp: "2026-02-27 13:58:02", risk: "low" },
  { id: "al4", user: "alice@corp.com", action: "PATTERN_CREATED", resource: "Custom Employee ID", timestamp: "2026-02-27 13:22:17", risk: "medium" },
  { id: "al5", user: "diana@corp.com", action: "LOGIN_FAILED", resource: "Authentication", timestamp: "2026-02-27 12:45:39", risk: "high" },
  { id: "al6", user: "evan@corp.com", action: "FILE_DELETED", resource: "passport_scan.png", timestamp: "2026-02-27 12:10:52", risk: "medium" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "patterns" | "audit">("users");
  const [patterns, setPatterns] = useState(defaultPatterns);
  const [showNewPattern, setShowNewPattern] = useState(false);
  const [newPattern, setNewPattern] = useState({ name: "", pattern: "" });
  const [search, setSearch] = useState("");

  const addPattern = () => {
    if (!newPattern.name || !newPattern.pattern) return;
    setPatterns(prev => [...prev, {
      id: `p${Date.now()}`, name: newPattern.name, pattern: newPattern.pattern,
      created_by: "admin@secureai.com", active: true
    }]);
    setNewPattern({ name: "", pattern: "" });
    setShowNewPattern(false);
    toast.success("Custom detection pattern added");
  };

  const deletePattern = (id: string) => {
    setPatterns(prev => prev.filter(p => p.id !== id));
    toast.success("Pattern removed");
  };

  const filteredUsers = usersData.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: usersData.length, icon: Users, color: "text-primary bg-primary/10" },
          { label: "Active Sessions", value: 3, icon: Activity, color: "text-success bg-success/10" },
          { label: "Custom Patterns", value: patterns.filter(p => p.created_by !== "system").length, icon: Code2, color: "text-accent bg-accent/10" },
          { label: "Audit Events (24h)", value: auditLogs.length, icon: Shield, color: "text-warning bg-warning/10" },
        ].map(s => (
          <div key={s.label} className="metric-card">
            <div className={`w-9 h-9 rounded-lg ${s.color.split(" ")[1]} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color.split(" ")[0]} />
            </div>
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/40 p-1 rounded-xl w-fit">
        {(["users", "patterns", "audit"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "patterns" ? "Detection Patterns" : t === "audit" ? "Audit Logs" : "Users"}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-2">
              <Search size={14} className="text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
            </div>
            <button onClick={() => toast.info("Invite sent!")}
              className="flex items-center gap-2 gradient-bg text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus size={14} /> Invite User
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/30">
              <tr>
                {["User", "Email", "Role", "Status", "Scans", "Last Active", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-secondary/20 group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={`https://ui-avatars.com/api/?name=${u.name}&size=32&background=0ea5e9&color=fff&bold=true`}
                        alt={u.name} className="w-7 h-7 rounded-full" />
                      <span className="text-xs font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge border text-xs ${u.role === "admin"
                      ? "bg-accent/15 text-accent border-accent/30"
                      : "bg-secondary text-muted-foreground border-border"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs ${u.status === "active" ? "text-success" : "text-muted-foreground"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.scans}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastActive}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "patterns" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowNewPattern(true)}
              className="flex items-center gap-2 gradient-bg text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90">
              <Plus size={14} /> New Pattern
            </button>
          </div>

          {showNewPattern && (
            <div className="glass-card rounded-xl p-5 border border-primary/30">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Code2 size={15} className="text-primary" /> New Detection Pattern
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pattern Name</label>
                  <input value={newPattern.name} onChange={e => setNewPattern(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Employee ID"
                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Regex Pattern</label>
                  <input value={newPattern.pattern} onChange={e => setNewPattern(p => ({ ...p, pattern: e.target.value }))}
                    placeholder="e.g., EMP[0-9]{5}"
                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addPattern} className="flex items-center gap-1.5 bg-success/15 text-success border border-success/30 rounded-lg px-3 py-2 text-sm hover:bg-success/20 transition-colors">
                  <Save size={13} /> Save Pattern
                </button>
                <button onClick={() => setShowNewPattern(false)} className="flex items-center gap-1.5 bg-secondary text-muted-foreground rounded-lg px-3 py-2 text-sm hover:text-foreground transition-colors">
                  <XCircle size={13} /> Cancel
                </button>
              </div>
            </div>
          )}

          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30">
                <tr>
                  {["Pattern Name", "Regex", "Created By", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {patterns.map(p => (
                  <tr key={p.id} className="hover:bg-secondary/20 group">
                    <td className="px-4 py-3 text-xs font-semibold text-foreground">{p.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">{p.pattern}</code>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.created_by}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-success">
                        <CheckCircle size={11} /> Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.created_by !== "system" && (
                        <button onClick={() => deletePattern(p.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">Audit Log — No raw PII stored</h3>
            <p className="text-xs text-muted-foreground mt-0.5">All actions recorded without sensitive data values</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/30">
              <tr>
                {["User", "Action", "Resource", "Timestamp", "Risk"].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-secondary/20">
                  <td className="px-4 py-3 text-xs text-muted-foreground">{log.user}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{log.action}</code>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">{log.resource}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{log.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge border text-xs ${log.risk === "high" ? "bg-destructive/15 text-destructive border-destructive/30" :
                      log.risk === "medium" ? "bg-warning/15 text-warning border-warning/30" : "bg-success/15 text-success border-success/30"}`}>
                      {log.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
