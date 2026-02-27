import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, Cpu, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@secureai.com");
  const [password, setPassword] = useState("password123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      toast.success("Welcome back! Secure session started.");
      navigate("/");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-bg shadow-glow mb-4">
            <ShieldCheck className="text-primary-foreground" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SecureAI PII Redactor</h1>
          <p className="text-sm text-muted-foreground mt-1">Enterprise Edition · Secure Access</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-border/60">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground mt-1">Use enterprise SSO or email credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 gradient-bg text-primary-foreground font-semibold rounded-lg transition-all hover:opacity-90 hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : "Sign In Securely"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Cpu size={12} className="text-primary" />
              <span>Try: <span className="font-mono text-foreground">admin@secureai.com</span> / any 6+ char password</span>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-success" /> AES-256</span>
          <span>·</span>
          <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-success" /> JWT Auth</span>
          <span>·</span>
          <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-success" /> GDPR</span>
          <span>·</span>
          <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-success" /> DPDP</span>
        </div>
      </div>
    </div>
  );
}
