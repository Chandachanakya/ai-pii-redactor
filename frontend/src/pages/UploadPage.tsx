import { useState, useRef, useCallback } from "react";
import {
  Upload, FileText, X, CheckCircle, AlertTriangle, Loader2,
  Eye, Download, ToggleLeft, ToggleRight, ChevronRight, Info,
  Shield, Cpu, Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import RiskGauge from "@/components/ui-custom/RiskGauge";
import RedactionResults from "@/components/ui-custom/RedactionResults";

const PII_TYPES = [
  { id: "email", label: "Email Address", desc: "user@domain.com", weight: 2 },
  { id: "phone", label: "Phone Number", desc: "International formats", weight: 3 },
  { id: "aadhaar", label: "Aadhaar Number", desc: "12-digit Indian ID", weight: 5 },
  { id: "pan", label: "PAN Card", desc: "Indian tax identifier", weight: 4 },
  { id: "credit_card", label: "Credit Card", desc: "Luhn validated", weight: 5 },
  { id: "ssn", label: "SSN (US)", desc: "Social Security Number", weight: 5 },
  { id: "ip", label: "IP Address", desc: "IPv4 and IPv6", weight: 2 },
  { id: "person", label: "Person Names", desc: "NLP (spaCy)", weight: 1 },
  { id: "org", label: "Organizations", desc: "NLP entity detection", weight: 1 },
  { id: "date", label: "Dates", desc: "All date formats", weight: 1 },
];

const REDACTION_MODES = [
  { id: "full", label: "Full Redaction", desc: "[REDACTED_TYPE]", icon: Shield },
  { id: "mask", label: "Masking", desc: "Par****al hide", icon: Eye },
  { id: "synthetic", label: "Synthetic Replace", desc: "Fake data generation", icon: Zap },
];

type ProcessingState = "idle" | "uploading" | "analyzing" | "redacting" | "done";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(
    new Set(PII_TYPES.map(p => p.id))
  );
  const [redactionMode, setRedactionMode] = useState("full");
  const [state, setState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    const allowed = ["text/plain", "text/csv", "application/pdf", "image/png", "image/jpeg", "application/json"];
    if (!allowed.includes(f.type) && !f.name.endsWith(".csv")) {
      toast.error("Unsupported file type");
      return;
    }
    setFile(f);
    setResults(null);
    setState("idle");
  };

  const toggleType = (id: string) => {
    setEnabledTypes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const runRedaction = async () => {
    if (!file) return;
    const startTime = performance.now();
    setState("uploading");
    setProgress(10);

    try {
      // Build FormData with the file and filters
      const formData = new FormData();
      formData.append("file", file);

      // Map UI toggle IDs to backend entity types
      const MAPPING: Record<string, string> = {
        email: "EMAIL", phone: "PHONE", aadhaar: "AADHAAR", pan: "PAN",
        credit_card: "CREDIT_CARD", ssn: "SSN", ip: "IP",
        person: "NAME", org: "ORG", date: "DATE",
      };

      const enabledBackendTypes = Array.from(enabledTypes)
        .map(id => MAPPING[id])
        .filter(Boolean);

      if (enabledBackendTypes.length > 0) {
        formData.append("enabled_types", enabledBackendTypes.join(","));
      }

      setState("analyzing");
      setProgress(40);

      // Real API call to backend
      const response = await fetch("/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Server error" }));
        throw new Error(err.detail || `HTTP ${response.status}`);
      }

      setState("redacting");
      setProgress(80);

      const data = await response.json();
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

      // Map API response → UI format
      const TYPE_LABELS: Record<string, string> = {
        EMAIL: "Email", PHONE: "Phone", AADHAAR: "Aadhaar", PAN: "PAN",
        CREDIT_CARD: "Credit Card", SSN: "SSN", NAME: "Person",
        ORG: "Organization", LOCATION: "Location", IP: "IP Address",
        DATE: "Date",
      };

      const detectedPII = data.detected_entities.map((e: any, i: number) => ({
        type: TYPE_LABELS[e.type] || e.type,
        value: e.value,
        masked: `[REDACTED_${e.type}]`,
        line: i + 1,
        confidence: 0.95,
      }));

      setProgress(100);

      setResults({
        filename: data.file_name,
        filesize: file.size,
        detectedPII,
        riskScore: data.risk_score,
        riskLevel: data.risk_level,
        piiSummary: data.pii_summary,
        redactedText: data.redacted_text,
        tokensOriginal: data.redacted_text.length + detectedPII.length * 10,
        tokensRedacted: data.redacted_text.length,
        processingTime: `${elapsed}s`,
        mode: redactionMode,
      });

      setState("done");
      toast.success(`Redaction complete — ${detectedPII.length} PII entities found`);
    } catch (error: any) {
      setState("idle");
      setProgress(0);
      toast.error(error.message || "Failed to analyze file");
    }
  };

  const resetAll = () => {
    setFile(null); setResults(null); setState("idle"); setProgress(0);
  };

  const stateLabel: Record<ProcessingState, string> = {
    idle: "", uploading: "Uploading securely...", analyzing: "AI analysis in progress...",
    redacting: "Applying redactions...", done: "Processing complete",
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upload Zone */}
        <div className="lg:col-span-2 space-y-4">
          {!file ? (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200",
                isDragging
                  ? "border-primary bg-primary/8 shadow-glow"
                  : "border-border hover:border-primary/50 hover:bg-primary/4"
              )}
            >
              <input ref={inputRef} type="file" className="hidden"
                accept=".txt,.csv,.pdf,.png,.jpg,.jpeg,.json"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload size={24} className="text-primary" />
              </div>
              <p className="text-base font-semibold text-foreground">Drop your file here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              <div className="flex items-center justify-center gap-3 mt-4 text-xs text-muted-foreground">
                {["TXT", "CSV", "PDF", "PNG", "JPG", "JSON"].map(ext => (
                  <span key={ext} className="status-badge bg-secondary border-border border">{ext}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Max 5MB · AES-256 encrypted · Auto-deleted after processing</p>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · {file.type || "Unknown type"}</p>
                </div>
                <button onClick={resetAll} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <X size={16} />
                </button>
              </div>

              {state !== "idle" && state !== "done" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" /> {stateLabel[state]}
                    </span>
                    <span className="text-primary font-mono">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full gradient-bg rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {state === "done" && (
                <div className="mt-3 flex items-center gap-2 text-success text-xs">
                  <CheckCircle size={13} /> Processing complete in {results?.processingTime}
                </div>
              )}
            </div>
          )}

          {/* Redaction Mode */}
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield size={15} className="text-primary" /> Redaction Mode
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {REDACTION_MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setRedactionMode(m.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    redactionMode === m.id
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border bg-secondary/30 hover:border-primary/30"
                  )}
                >
                  <m.icon size={16} className={cn("mb-1.5", redactionMode === m.id ? "text-primary" : "text-muted-foreground")} />
                  <div className={cn("text-xs font-semibold", redactionMode === m.id ? "text-primary" : "text-foreground")}>{m.label}</div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Run Button */}
          {file && state === "idle" && (
            <button onClick={runRedaction}
              className="w-full py-3.5 gradient-bg text-primary-foreground font-semibold rounded-xl hover:opacity-90 hover:shadow-glow transition-all flex items-center justify-center gap-2">
              <Cpu size={18} /> Run AI Redaction
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* PII Toggles */}
        <div className="glass-card rounded-xl p-5 h-fit">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Cpu size={15} className="text-primary" /> Detection Targets
          </h3>
          <div className="space-y-1">
            {PII_TYPES.map(type => {
              const enabled = enabledTypes.has(type.id);
              return (
                <div key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all",
                    enabled ? "bg-primary/8 hover:bg-primary/12" : "hover:bg-secondary"
                  )}>
                  <div className={cn(
                    "w-8 h-4 rounded-full transition-all relative flex-shrink-0",
                    enabled ? "bg-primary" : "bg-secondary"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all",
                      enabled ? "left-[18px]" : "left-0.5"
                    )} />
                  </div>
                  <div className="min-w-0">
                    <div className={cn("text-xs font-medium", enabled ? "text-foreground" : "text-muted-foreground")}>{type.label}</div>
                    <div className="text-[10px] text-muted-foreground">{type.desc}</div>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono",
                      type.weight >= 4 ? "bg-destructive/15 text-destructive" :
                        type.weight >= 3 ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
                    )}>W:{type.weight}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {results && <RedactionResults results={results} />}
    </div>
  );
}
