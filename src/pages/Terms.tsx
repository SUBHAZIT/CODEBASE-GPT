import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { FileText, Scale, Gavel, AlertCircle, Shield } from "lucide-react";

export default function Terms() {
  return (
    <PageLayout 
      category="Agreement"
      title="Terms of Interaction" 
      subtitle="Operational guidelines for the use of the CodebaseGPT Intelligence Network."
    >
      <div className="max-w-4xl mx-auto">
        <div className="p-12 md:p-20 rounded-[3rem] border border-white/5 bg-white/[0.01] relative overflow-hidden group">
          <div className="absolute inset-0 blueprint-grid opacity-5" />
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-8 mb-16 pb-8 border-b border-white/5 relative">
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/40">Document Type</p>
                <p className="text-xs font-mono text-white/60">Service Level Agreement</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/40">Version</p>
                <p className="text-xs font-mono text-white/60">V.2.4.0 (Unified)</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/40">Authority</p>
                <p className="text-xs font-mono text-teal-400/60 uppercase">Verified Origin</p>
             </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-16 relative">
            <section className="space-y-8">
              <h2 className="text-3xl font-serif italic text-white m-0">1. Usage Licensing</h2>
              <p className="text-lg text-muted-foreground/60 leading-relaxed italic font-medium">
                CodebaseGPT grants you a non-exclusive, non-transferable license to utilize our neural indexing nodes for the purpose of source code analysis and knowledge retrieval.
              </p>
            </section>

            <section className="space-y-8">
              <h2 className="text-3xl font-serif italic text-white m-0">2. Operational Boundaries</h2>
              <p className="text-lg text-muted-foreground/60 leading-relaxed italic font-medium">
                You agree not to use the platform for the analysis of encrypted malware or illegal cryptographic protocols. Violation of these boundaries results in immediate node termination.
              </p>
            </section>

            <section className="space-y-8">
              <h2 className="text-3xl font-serif italic text-white m-0">3. System Uptime Index</h2>
              <p className="text-lg text-muted-foreground/60 leading-relaxed italic font-medium">
                We strive for 99.9% uptime on our indexing cores. Maintenance windows for neural model upgrades will be broadcast via the control terminal 24 hours in advance.
              </p>
            </section>
          </div>

          {/* Verification Stamp */}
          <div className="mt-24 pt-12 border-t border-white/5 flex items-center justify-between opacity-40">
             <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">CodebaseGPT Legal Auth</span>
             </div>
             <div className="text-[10px] font-mono">VERIFIED: SLA-APPROVED</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
