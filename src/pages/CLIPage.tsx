import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Terminal, Package, Download, Brain, Shield, Play, Layers, Copy, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function CLI() {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText("npm install -g @codebasegpt/cli");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commands = [
    { cmd: "init", desc: "Scaffold .env config for your project", icon: Package },
    { cmd: "index <url>", desc: "Index any GitHub repository instantly", icon: Download },
    { cmd: "overview", desc: "Generate AI-powered architecture overview", icon: Brain },
    { cmd: "scan", desc: "Run deep security vulnerability scan", icon: Shield },
    { cmd: "open", desc: "Launch the dashboard in your browser", icon: Play },
    { cmd: "version", desc: "Check current CLI version info", icon: Layers },
  ];

  return (
    <PageLayout
      category="Developer Tools"
      title="Command Line Interface"
      subtitle="Index repos, run security scans, generate architecture overviews — all without leaving your terminal."
    >
      <div className="max-w-5xl mx-auto space-y-24">
        {/* Install Banner */}
        <div className="relative">
          <div className="absolute -inset-1 bg-teal-500/20 rounded-2xl blur opacity-20" />
          <div className="relative flex items-center justify-between gap-4 px-8 py-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Install globally</span>
              <code className="text-lg font-mono font-bold text-foreground">npm install -g @codebasegpt/cli</code>
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

        {/* Commands Grid */}
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400/60 whitespace-nowrap">Available Commands</h2>
            <div className="h-px w-full bg-white/5" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {commands.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-teal-500/20 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/60 group-hover:text-teal-500 group-hover:border-teal-500/20 transition-all">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <code className="text-xs font-mono font-bold text-teal-500/80 group-hover:text-teal-400 transition-colors">codebasegpt {item.cmd}</code>
                    <p className="text-[11px] text-muted-foreground/60 italic font-medium mt-1.5">{item.desc}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-px w-0 bg-teal-500/40 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Terminal Demo */}
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400/60 whitespace-nowrap">Usage Example</h2>
            <div className="h-px w-full bg-white/5" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">terminal</span>
            </div>
            <div className="p-6 font-mono text-xs leading-[1.8] space-y-1">
              <div className="flex gap-2">
                <span className="text-teal-500 select-none">$</span>
                <span className="text-foreground">codebasegpt index https://github.com/vercel/next.js</span>
              </div>
              <div className="text-muted-foreground/60">
                <span className="text-amber-400">⠋</span> [Stage 1] Fetching repository metadata...
              </div>
              <div className="text-muted-foreground/60">
                <span className="text-amber-400">⠙</span> [Stage 2] Building file tree...
              </div>
              <div className="text-muted-foreground/60">
                <span className="text-amber-400">⠸</span> [Stage 3] Indexing 2,847 files...
              </div>
              <div className="text-emerald-400">✔ Successfully indexed vercel/next.js</div>
              <div className="text-blue-400">Repo ID: gh-vercel-next-js</div>
              <div className="text-blue-400">Total Files: 2,847</div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex gap-2">
                  <span className="text-teal-500 select-none">$</span>
                  <span className="text-foreground">codebasegpt scan gh-vercel-next-js</span>
                </div>
              </div>
              <div className="text-muted-foreground/60">
                <span className="text-amber-400">⠋</span> Running security scan...
              </div>
              <div className="text-emerald-400">✔ Scan complete! Found 3 findings.</div>
              <div className="mt-2">
                <span className="text-foreground">1. </span>
                <span className="font-bold text-foreground">Hardcoded API Key</span>
                <span className="text-amber-400"> [HIGH]</span>
              </div>
              <div className="text-muted-foreground/40 pl-3">File: src/config/auth.ts:42</div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="p-12 rounded-[2.5rem] border border-white/5 bg-white/[0.01] text-center space-y-6 relative overflow-hidden group">
          <div className="absolute inset-0 blueprint-grid opacity-10" />
          <div className="teal-glow w-[400px] h-[400px] -bottom-24 left-1/2 -translate-x-1/2 opacity-5" />
          <h3 className="text-3xl font-serif italic text-white relative">Ready to ship faster?</h3>
          <p className="text-base text-muted-foreground/60 max-w-md mx-auto italic relative">
            Install the CLI and start analyzing codebases in under 30 seconds.
          </p>
          <div className="pt-2 relative">
            <button
              onClick={copyInstall}
              className="px-10 py-4 rounded-2xl bg-teal-500 text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-teal-400 transition-all shadow-[0_0_50px_rgba(20,184,166,0.15)] inline-flex items-center gap-2"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
