import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Shield, ShieldCheck } from "lucide-react";

export default function Privacy() {
  return (
    <PageLayout 
      category="Governance"
      title="Data & Privacy Framework" 
      subtitle="Professional standards for cryptographic security and repository isolation."
    >
      <div className="max-w-4xl mx-auto">
        <div className="p-12 md:p-20 rounded-[3rem] border border-white/5 bg-white/[0.01] relative overflow-hidden group">
          <div className="absolute inset-0 blueprint-grid opacity-5" />
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-8 mb-16 pb-8 border-b border-white/5 relative">
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/40">Document ID</p>
                <p className="text-xs font-mono text-white/60">P-2024-SEC-001</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/40">Effective Date</p>
                <p className="text-xs font-mono text-white/60">March 20, 2024</p>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/40">Status</p>
                <p className="text-xs font-mono text-teal-400/60 uppercase">Active / Verified</p>
             </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-16 relative">
            <section className="space-y-8">
              <h2 className="text-3xl font-serif italic text-white m-0">1. Data Ingestion Protocols</h2>
              <p className="text-lg text-muted-foreground/60 leading-relaxed italic font-medium">
                Our indexing engine processes source code through an ephemeral ingestion pipeline. 
                We do not maintain permanent copies of your raw source files unless explicitly configured for offline auditing.
              </p>
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 italic text-sm text-muted-foreground/40 leading-relaxed">
                Note: All ingestion is performed over TLS 1.3 encrypted channels.
              </div>
            </section>

            <section className="space-y-8">
              <h2 className="text-3xl font-serif italic text-white m-0">2. Vector Privacy Limits</h2>
              <p className="text-lg text-muted-foreground/60 leading-relaxed italic font-medium">
                Embeddings generated from your code are locked to your organization's unique tenant ID. 
                These vectors are never shared with other users or used to train public LLM weights.
              </p>
            </section>

            <section className="space-y-8">
              <h2 className="text-3xl font-serif italic text-white m-0">3. Third-Party Neural Nodes</h2>
              <p className="text-lg text-muted-foreground/60 leading-relaxed italic font-medium">
                We utilize enterprise-grade LLM endpoints (Google Gemini) via private API tunnels. 
                Data passed to these nodes is governed by zero-retention policies.
              </p>
            </section>
          </div>

          {/* Verification Stamp */}
          <div className="mt-24 pt-12 border-t border-white/5 flex items-center justify-between opacity-40">
             <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">CodebaseGPT Legal Auth</span>
             </div>
             <div className="text-[10px] font-mono">HASH: 7F...3B</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
