import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft, Code2, Shield, ShieldAlert, ShieldCheck,
  AlertTriangle, Info, Loader2, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRepoStore } from "@/lib/store";
import { generateSecurityScan, type SecurityFinding } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const severityConfig = {
  critical: { color: "text-destructive", bg: "bg-destructive/5 border-destructive/20", icon: ShieldAlert, label: "Critical" },
  high: { color: "text-warning", bg: "bg-warning/5 border-warning/20", icon: ShieldAlert, label: "High" },
  medium: { color: "text-warning", bg: "bg-muted border-border", icon: AlertTriangle, label: "Medium" },
  low: { color: "text-info", bg: "bg-muted border-border", icon: Shield, label: "Low" },
  info: { color: "text-muted-foreground", bg: "bg-muted border-border", icon: Info, label: "Info" },
};

const SecurityScan = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const { meta, repoContext } = useRepoStore();
  const { toast } = useToast();
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const runScan = async () => {
    if (!repoContext) {
      toast({ title: "No repo data", description: "Please index a repository first.", variant: "destructive" });
      return;
    }
    setIsScanning(true);
    try {
      const results = await generateSecurityScan(repoContext);
      setFindings(results);
      setHasScanned(true);
    } catch (e: any) {
      toast({ title: "Scan failed", description: e.message, variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const counts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-11 px-6">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/repo/${repoId}`)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <Code2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] text-muted-foreground">
              {meta?.owner}/<span className="text-foreground font-medium">{meta?.name}</span>
              <span className="text-muted-foreground"> / security</span>
            </span>
          </div>
          <Button onClick={runScan} disabled={isScanning} size="sm" variant="outline" className="h-7 text-[11px]">
            {isScanning ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            {isScanning ? "Scanning..." : hasScanned ? "Re-scan" : "Run Scan"}
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {!hasScanned && !isScanning && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Run an AI security audit on this codebase.</p>
              <Button onClick={runScan} size="sm" className="text-xs">
                <Shield className="h-3 w-3 mr-1.5" /> Start Scan
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Analyzing codebase...</p>
            </div>
          )}

          {hasScanned && !isScanning && (
            <>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {(["critical", "high", "medium", "low", "info"] as const).map((sev) => {
                  const cfg = severityConfig[sev];
                  return (
                    <div key={sev} className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] ${cfg.bg}`}>
                      <cfg.icon className={`h-3 w-3 ${cfg.color}`} />
                      <span className={cfg.color}>{counts[sev]}</span>
                      <span className="text-muted-foreground">{cfg.label}</span>
                    </div>
                  );
                })}
              </div>

              {findings.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <ShieldCheck className="h-8 w-8 text-success mb-2" />
                  <p className="text-sm text-foreground">No issues found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {findings.map((finding) => {
                    const cfg = severityConfig[finding.severity] || severityConfig.info;
                    return (
                      <div key={finding.id} className={`p-3 rounded border ${cfg.bg}`}>
                        <div className="flex items-start gap-2.5">
                          <cfg.icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${cfg.color}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[10px] font-mono ${cfg.color}`}>{finding.id}</span>
                              <span className="text-xs font-medium text-foreground">{finding.title}</span>
                            </div>
                            <p className="text-[11px] text-secondary-foreground mb-1.5">{finding.description}</p>
                            {finding.file && finding.file !== "General" && (
                              <p className="text-[10px] font-mono text-muted-foreground mb-1.5">
                                {finding.file}{finding.line ? `:${finding.line}` : ""}
                              </p>
                            )}
                            <div className="px-2.5 py-1.5 rounded bg-background/50 border border-border/50">
                              <p className="text-[10px] text-muted-foreground">{finding.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SecurityScan;
