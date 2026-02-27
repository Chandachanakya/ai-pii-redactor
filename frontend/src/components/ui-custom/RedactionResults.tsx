import { Download, FileText, Shield, Zap, Eye, CheckCircle, ArrowRight } from "lucide-react";
import RiskGauge from "./RiskGauge";
import { toast } from "sonner";

interface PIIEntity {
  type: string;
  value: string;
  masked: string;
  line: number;
  confidence: number;
}

interface RedactionResultsProps {
  results: {
    filename: string;
    filesize: number;
    detectedPII: PIIEntity[];
    riskScore: number;
    riskLevel?: string;
    piiSummary?: Record<string, number>;
    redactedText?: string;
    tokensOriginal: number;
    tokensRedacted: number;
    processingTime: string;
    mode: string;
  };
}

const typeColors: Record<string, string> = {
  Email: "text-primary bg-primary/10 border-primary/20",
  Phone: "text-accent bg-accent/10 border-accent/20",
  Aadhaar: "text-warning bg-warning/10 border-warning/20",
  PAN: "text-destructive bg-destructive/10 border-destructive/20",
  "Credit Card": "text-destructive bg-destructive/10 border-destructive/20",
  SSN: "text-destructive bg-destructive/10 border-destructive/20",
  Person: "text-success bg-success/10 border-success/20",
  Organization: "text-success bg-success/10 border-success/20",
  Location: "text-primary bg-primary/10 border-primary/20",
  IP: "text-muted-foreground bg-secondary border-border",
};

// ---------- Export helpers ----------

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportJSON(results: RedactionResultsProps["results"]) {
  const report = {
    file_name: results.filename,
    risk_score: results.riskScore,
    risk_level: results.riskLevel || (results.riskScore >= 25 ? "High" : results.riskScore >= 11 ? "Medium" : "Low"),
    pii_summary: results.piiSummary || {},
    detected_entities: results.detectedPII.map(e => ({
      type: e.type,
      original_value: e.value,
      redacted: e.masked,
      confidence: e.confidence,
    })),
    redacted_text: results.redactedText || "",
    processing_time: results.processingTime,
    mode: results.mode,
    exported_at: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${results.filename}_pii_report.json`);
  toast.success("JSON report downloaded");
}

function exportCSV(results: RedactionResultsProps["results"]) {
  const header = "Type,Original Value,Redacted Output,Confidence\n";
  const rows = results.detectedPII
    .map(e => `"${e.type}","${e.value.replace(/"/g, '""')}","${e.masked}",${(e.confidence * 100).toFixed(0)}%`)
    .join("\n");
  const summary = `\n\nSummary\nFile,${results.filename}\nRisk Score,${results.riskScore}\nRisk Level,${results.riskLevel || ""}\nTotal Entities,${results.detectedPII.length}\nProcessing Time,${results.processingTime}\nExported At,${new Date().toISOString()}\n`;
  const blob = new Blob([header + rows + summary], { type: "text/csv" });
  downloadBlob(blob, `${results.filename}_pii_report.csv`);
  toast.success("CSV report downloaded");
}

function exportPDF(results: RedactionResultsProps["results"]) {
  // Build a clean HTML report and use system print-to-PDF
  const riskLevel = results.riskLevel || (results.riskScore >= 25 ? "High" : results.riskScore >= 11 ? "Medium" : "Low");
  const riskColor = riskLevel === "High" ? "#ef4444" : riskLevel === "Medium" ? "#f59e0b" : "#22c55e";

  const entityRows = results.detectedPII
    .map(e => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${e.type}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#ef4444;text-decoration:line-through;font-family:monospace;">${e.value}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#22c55e;font-family:monospace;">${e.masked}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${(e.confidence * 100).toFixed(0)}%</td></tr>`)
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PII Redaction Report — ${results.filename}</title>
<style>
  body{font-family:Inter,Segoe UI,sans-serif;margin:40px;color:#1e293b;line-height:1.6;}
  h1{font-size:22px;margin-bottom:4px;} h2{font-size:16px;margin-top:32px;border-bottom:2px solid #e2e8f0;padding-bottom:6px;}
  .meta{color:#64748b;font-size:13px;} .badge{display:inline-block;padding:4px 14px;border-radius:20px;font-weight:600;font-size:13px;color:#fff;}
  table{width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;}
  th{text-align:left;padding:10px 12px;background:#f8fafc;border-bottom:2px solid #e2e8f0;font-weight:600;font-size:12px;text-transform:uppercase;color:#64748b;}
  .summary-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:12px;}
  .summary-card{border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center;}
  .summary-card .num{font-size:28px;font-weight:700;} .summary-card .label{font-size:12px;color:#64748b;margin-top:4px;}
  .redacted-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;font-family:JetBrains Mono,monospace;font-size:12px;white-space:pre-wrap;margin-top:12px;line-height:1.8;}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;}
  @media print{body{margin:20px;}}
</style></head><body>
<h1>🛡️ PII Redaction Report</h1>
<p class="meta">File: <strong>${results.filename}</strong> · Size: ${(results.filesize / 1024).toFixed(1)} KB · Mode: ${results.mode} · Generated: ${new Date().toLocaleString()}</p>

<div class="summary-grid">
  <div class="summary-card"><div class="num" style="color:${riskColor}">${results.riskScore}</div><div class="label">Risk Score (${riskLevel})</div></div>
  <div class="summary-card"><div class="num" style="color:#0ea5e9">${results.detectedPII.length}</div><div class="label">PII Entities Detected</div></div>
  <div class="summary-card"><div class="num" style="color:#22c55e">${results.processingTime}</div><div class="label">Processing Time</div></div>
</div>

<h2>Detected PII Entities</h2>
<table><thead><tr><th>Type</th><th>Original Value</th><th>Redacted Output</th><th style="text-align:center;">Confidence</th></tr></thead><tbody>${entityRows}</tbody></table>

${results.redactedText ? `<h2>Redacted Text</h2><div class="redacted-box">${results.redactedText.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\[REDACTED_(\w+)\]/g, '<span style="background:#fee2e2;color:#dc2626;padding:2px 6px;border-radius:4px;font-size:11px;">[$1]</span>')}</div>` : ""}

<div class="footer">AI PII Redactor · Compliance Report · GDPR / DPDP Act Ready</div>
</body></html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // small delay so styles render
    setTimeout(() => {
      printWindow.print();
    }, 400);
    toast.success("PDF report ready — use Print → Save as PDF");
  } else {
    toast.error("Pop-up blocked. Please allow pop-ups for this site.");
  }
}

function exportRedactedFile(results: RedactionResultsProps["results"]) {
  if (!results.redactedText) {
    toast.error("No redacted text available");
    return;
  }
  const blob = new Blob([results.redactedText], { type: "text/plain" });
  downloadBlob(blob, `${results.filename}_redacted.txt`);
  toast.success("Redacted file downloaded");
}

// ---------- Component ----------

export default function RedactionResults({ results }: RedactionResultsProps) {
  const tokenReduction = Math.round(((results.tokensOriginal - results.tokensRedacted) / results.tokensOriginal) * 100);

  const exportActions = [
    { format: "CSV Report", desc: "PII summary with metadata", icon: FileText, action: () => exportCSV(results) },
    { format: "JSON Export", desc: "Machine-readable format", icon: Zap, action: () => exportJSON(results) },
    { format: "PDF Summary", desc: "Compliance report (GDPR/DPDP)", icon: Shield, action: () => exportPDF(results) },
    { format: "Redacted File", desc: "Download processed file", icon: Eye, action: () => exportRedactedFile(results) },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <CheckCircle size={16} className="text-success" />
        Redaction Complete — <span className="text-primary">{results.detectedPII.length}</span> PII entities processed
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Gauge */}
        <div className="glass-card rounded-xl p-5 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-foreground mb-4">Risk Score</h3>
          <RiskGauge score={results.riskScore} />
          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Processing time</span>
              <span className="text-foreground font-mono">{results.processingTime}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Mode</span>
              <span className="text-accent capitalize">{results.mode}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Entities found</span>
              <span className="text-foreground">{results.detectedPII.length}</span>
            </div>
          </div>
        </div>

        {/* Token reduction */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Token Reduction</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Original tokens</span>
                <span className="text-foreground font-mono">{results.tokensOriginal.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full">
                <div className="h-full bg-destructive/60 rounded-full w-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Redacted tokens</span>
                <span className="text-foreground font-mono">{results.tokensRedacted.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full">
                <div className="h-full bg-success rounded-full" style={{ width: `${(results.tokensRedacted / results.tokensOriginal) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-center p-3 bg-success/8 rounded-lg border border-success/20">
              <span className="text-2xl font-bold text-success">{tokenReduction}%</span>
              <span className="text-xs text-muted-foreground ml-2">tokens reduced</span>
            </div>
          </div>
        </div>

        {/* Download */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Download size={14} className="text-primary" /> Export Reports
          </h3>
          <div className="space-y-2">
            {exportActions.map(d => (
              <button key={d.format} onClick={d.action}
                className="w-full flex items-center gap-3 p-3 bg-secondary/30 hover:bg-secondary/60 border border-border rounded-lg transition-all text-left group">
                <div className="p-1.5 bg-primary/10 rounded">
                  <d.icon size={13} className="text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground">{d.format}</div>
                  <div className="text-[10px] text-muted-foreground">{d.desc}</div>
                </div>
                <ArrowRight size={12} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detected PII Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Detected PII Entities</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Raw values are never stored — shown here temporarily in-session only</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary/30">
            <tr>
              {["Type", "Original Value", "Redacted Output", "Line", "Confidence"].map(h => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {results.detectedPII.map((entity, i) => (
              <tr key={i} className="hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <span className={`status-badge border text-xs ${typeColors[entity.type] || "text-muted-foreground bg-secondary border-border"}`}>
                    {entity.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-destructive/70 line-through">{entity.value}</td>
                <td className="px-4 py-3 font-mono text-xs text-success">{entity.masked}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">:{entity.line}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${entity.confidence * 100}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{(entity.confidence * 100).toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
