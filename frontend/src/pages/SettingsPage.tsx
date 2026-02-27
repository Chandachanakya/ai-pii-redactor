import { useState } from "react";
import { Save, User, Lock, Bell, Shield, Key, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "api">("profile");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "", org: "Acme Corp", timezone: "UTC+5:30" });
  const [notifs, setNotifs] = useState({ high_risk: true, scan_complete: true, weekly_report: false, security_alerts: true });

  const save = () => toast.success("Settings saved successfully");

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/40 p-1 rounded-xl w-fit">
        {(["profile", "security", "notifications", "api"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "api" ? "API Keys" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="glass-card rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-4">
            <img src={user?.avatar} alt={user?.name} className="w-16 h-16 rounded-full ring-2 ring-primary/30" />
            <div>
              <h3 className="text-base font-semibold text-foreground">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.role} · {user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Full Name", key: "name", value: profile.name },
              { label: "Email Address", key: "email", value: profile.email, type: "email" },
              { label: "Organization", key: "org", value: profile.org },
              { label: "Timezone", key: "timezone", value: profile.timezone },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={f.value}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                />
              </div>
            ))}
          </div>
          <button onClick={save} className="flex items-center gap-2 gradient-bg text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
            <Save size={14} /> Save Profile
          </button>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Lock size={15} className="text-primary" /> Change Password</h3>
            {[
              { label: "Current Password", show: showCurrentPass, toggle: () => setShowCurrentPass(!showCurrentPass) },
              { label: "New Password", show: showNewPass, toggle: () => setShowNewPass(!showNewPass) },
              { label: "Confirm New Password", show: showNewPass, toggle: () => setShowNewPass(!showNewPass) },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{f.label}</label>
                <div className="relative">
                  <input type={f.show ? "text" : "password"}
                    className="w-full px-3 pr-10 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60" />
                  <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {f.show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => toast.success("Password updated")} className="flex items-center gap-2 bg-destructive/15 text-destructive border border-destructive/30 rounded-lg px-4 py-2 text-sm hover:bg-destructive/20 transition-colors">
              <Key size={14} /> Update Password
            </button>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4"><Shield size={15} className="text-primary" /> Security Status</h3>
            <div className="space-y-3">
              {[
                { label: "Two-Factor Authentication", status: "Enabled", ok: true },
                { label: "Session Timeout", status: "30 minutes", ok: true },
                { label: "Audit Logging", status: "Active", ok: true },
                { label: "Encryption at Rest", status: "AES-256", ok: true },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                  <span className="text-sm text-foreground">{s.label}</span>
                  <span className={`flex items-center gap-1.5 text-xs ${s.ok ? "text-success" : "text-muted-foreground"}`}>
                    {s.ok && <CheckCircle size={12} />} {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2"><Bell size={15} className="text-primary" /> Notification Preferences</h3>
          {[
            { key: "high_risk" as const, label: "High Risk File Alerts", desc: "Notify when risk score exceeds 80" },
            { key: "scan_complete" as const, label: "Scan Completion", desc: "Notify when redaction is done" },
            { key: "weekly_report" as const, label: "Weekly Analytics Report", desc: "Summary email every Monday" },
            { key: "security_alerts" as const, label: "Security Alerts", desc: "Failed logins, suspicious activity" },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <div
                onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                className={`w-10 h-5 rounded-full cursor-pointer transition-all relative ${notifs[n.key] ? "bg-primary" : "bg-secondary"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-all ${notifs[n.key] ? "left-[22px]" : "left-0.5"}`} />
              </div>
            </div>
          ))}
          <button onClick={save} className="flex items-center gap-2 gradient-bg text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity mt-2">
            <Save size={14} /> Save Preferences
          </button>
        </div>
      )}

      {activeTab === "api" && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Key size={15} className="text-primary" /> API Keys</h3>
          <p className="text-xs text-muted-foreground">Use API keys to authenticate requests from your backend services.</p>
          {[
            { name: "Production Key", key: "sk_prod_••••••••••••••••••••••••3f8a", created: "2025-12-01", scopes: "read, write" },
            { name: "Staging Key", key: "sk_stg_••••••••••••••••••••••••7b2c", created: "2026-01-15", scopes: "read" },
          ].map(k => (
            <div key={k.name} className="p-4 bg-secondary/30 rounded-xl border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{k.name}</span>
                <button onClick={() => toast.success("Key revoked")} className="text-xs text-destructive hover:underline">Revoke</button>
              </div>
              <code className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded block">{k.key}</code>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Created: {k.created}</span>
                <span>Scopes: {k.scopes}</span>
              </div>
            </div>
          ))}
          <button onClick={() => toast.success("New API key generated")}
            className="flex items-center gap-2 gradient-bg text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90">
            <Key size={14} /> Generate New Key
          </button>
        </div>
      )}
    </div>
  );
}
