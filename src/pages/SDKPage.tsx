import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Boxes, Download, Brain, Shield, BarChart3, Bug, FileCode, Cpu, MessageSquare, Package, Copy, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SDKPage() {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText("npm install @codebasegpt/sdk");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const methods = [
    { method: "indexRepository()", desc: "Index any GitHub repo for AI analysis", icon: Download },
    { method: "generateOverview()", desc: "AI-powered architecture overview", icon: Brain },
    { method: "generateSecurityScan()", desc: "Deep security vulnerability analysis", icon: Shield },
    { method: "generateSystemDesign()", desc: "Auto system design documentation", icon: BarChart3 },
    { method: "fetchIssues()", desc: "Pull GitHub issues with full metadata", icon: Bug },
    { method: "fetchFileContent()", desc: "Retrieve any file from indexed repo", icon: FileCode },
    { method: "generateOnboardingDoc()", desc: "Auto-generate developer onboarding", icon: Cpu },
    { method: "streamChat()", desc: "Real-time AI chat with SSE streaming", icon: MessageSquare },
  ];

  return (
    <PageLayout
      category="Developer Tools"
      title="TypeScript SDK"
      subtitle="Integrate AI-powered code intelligence into your own tools, dashboards, and workflows with our fully typed SDK."
    >
      <div className="max-w-5xl mx-auto space-y-24">
        {/* Install Banner */}
        <div className="relative">
          <div className="absolute -inset-1 bg-teal-500/20 rounded-2xl blur opacity-20" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-8 py-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Install</span>
              <code className="text-lg font-mono font-bold text-foreground">npm install @codebasegpt/sdk</code>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Type Safety</span>
                <span className="text-xs font-bold text-foreground">100% TYPED</span>
              </div>
              <button
                onClick={copyInstall}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 transition-all text-teal-500"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400/60 whitespace-nowrap">Quick Start</h2>
            <div className="h-px w-full bg-white/5" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">example.ts</span>
            </div>
            <div className="p-6 font-mono text-xs leading-[1.9]">
              <pre className="text-foreground/90">
{`import { CodebaseGPTClient } from '@codebasegpt/sdk'

const client = new CodebaseGPTClient({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
})

// Index a repository
const repo = await client.indexRepository(
  'https://github.com/vercel/next.js'
)

// Get AI overview
const overview = await client.generateOverview(
  repo.repoContext
)
console.log(overview.narrative)
console.log(overview.framework)

// Run security scan
const findings = await client.generateSecurityScan(
  repo.repoContext
)

// Stream AI responses
await client.streamChat({
  messages: [{ role: 'user', content: 'How does auth work?' }],
  repoContext: repo.repoContext,
  onDelta: (text) => process.stdout.write(text),
  onDone: () => console.log('\\nDone!'),
})`}
              </pre>
            </div>
          </div>
        </div>

        {/* Methods Grid */}
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400/60 whitespace-nowrap">API Reference</h2>
            <div className="h-px w-full bg-white/5" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {methods.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-teal-500/20 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/60 group-hover:text-teal-500 group-hover:border-teal-500/20 transition-all">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <code className="text-[11px] font-mono font-bold text-teal-500/80 group-hover:text-teal-400 transition-colors">{item.method}</code>
                    <p className="text-[10px] text-muted-foreground/60 italic font-medium mt-1">{item.desc}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-px w-0 bg-teal-500/40 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interfaces */}
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400/60 whitespace-nowrap">Key Types</h2>
            <div className="h-px w-full bg-white/5" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "IndexedRepo", fields: "repoId, meta, fileTree, fileContents, repoContext" },
              { name: "OverviewData", fields: "narrative, framework, complexity, suggestedQs, keyFiles" },
              { name: "SecurityFinding", fields: "id, severity, title, description, file, recommendation" },
            ].map((type, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3">
                <code className="text-xs font-mono font-bold text-teal-400">{type.name}</code>
                <p className="text-[10px] text-muted-foreground/50 font-mono italic">{type.fields}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-12 rounded-[2.5rem] border border-white/5 bg-white/[0.01] text-center space-y-6 relative overflow-hidden group">
          <div className="absolute inset-0 blueprint-grid opacity-10" />
          <div className="teal-glow w-[400px] h-[400px] -bottom-24 left-1/2 -translate-x-1/2 opacity-5" />
          <h3 className="text-3xl font-serif italic text-white relative">Build something amazing.</h3>
          <p className="text-base text-muted-foreground/60 max-w-md mx-auto italic relative">
            Integrate CodebaseGPT into your CI pipelines, internal tools, or developer dashboards.
          </p>
          <div className="pt-2 relative">
            <button
              onClick={copyInstall}
              className="px-10 py-4 rounded-2xl bg-teal-500 text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-teal-400 transition-all shadow-[0_0_50px_rgba(20,184,166,0.15)] inline-flex items-center gap-2"
            >
              Install SDK <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
