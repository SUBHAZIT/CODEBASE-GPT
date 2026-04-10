import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { 
  Zap, Shield, Search, Cpu, Globe, Code2, 
  Layers, Terminal, Share2, Sparkles, BarChart3, Lock 
} from "lucide-react";
import { motion } from "framer-motion";

export default function Features() {
  const coreFeatures = [
    {
      icon: <Cpu className="h-6 w-6 text-blue-500" />,
      title: "Neural Code Reasoning",
      description: "Harness Gemini 1.5 Pro's 1M+ token context window to reason about your entire codebase simultaneously.",
      details: ["Cross-file dependency mapping", "Complex architectural reasoning", "Logic flow visualization"]
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Hyper-Speed Indexing",
      description: "Our proprietary vector engine processes 10,000+ lines per second without sacrificing precision.",
      details: ["Incremental background sync", "Deltas-only processing", "Low-latency retrieval"]
    },
    {
      icon: <Shield className="h-6 w-6 text-emerald-500" />,
      title: "Autonomous Security",
      description: "Security scanning that actually understands the context, reducing false positives by 85%.",
      details: ["Zero-day vulnerability detection", "Secret leak prevention", "Compliance-ready auditing"]
    }
  ];

  const advancedTools = [
    {
      icon: <Share2 className="h-5 w-5" />,
      title: "Collaborative Intelligence",
      description: "Share live AI-indexed sessions with team members for instant onboarding and peer review."
    },
    {
      icon: <Terminal className="h-5 w-5" />,
      title: "Interactive System Design",
      description: "Generate live Mermaid.js architecture diagrams directly from your current file structure."
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Code Health Metrics",
      description: "Track complexity, technical debt, and test coverage trends with AI-calculated scores."
    }
  ];

  return (
    <PageLayout 
      category="Capabilities"
      title="The Future of Codebase Intelligence" 
      subtitle="CodebaseGPT combines massive context windows with high-precision vector search to give you a god-mode view of your software."
    >
      {/* Core Features Grid */}
      <section className="space-y-12">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          Core Intelligence
        </h2>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {coreFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="group relative p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-default overflow-hidden"
            >
              {/* Corner Frame Accents */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="teal-glow w-32 h-32 -top-16 -right-16 opacity-0 group-hover:opacity-10 transition-opacity" />
              
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <div className="text-teal-400/80">{f.icon}</div>
                </div>
                <h3 className="text-2xl font-serif italic mb-4 text-white group-hover:text-teal-400 transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground/60 leading-relaxed mb-8 italic">{f.description}</p>
                <div className="space-y-3">
                  {f.details.map((d, di) => (
                    <div key={di} className="flex items-center gap-3">
                      <div className="h-px w-3 bg-teal-500/30" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* High-Resolution Diagram Placeholder (Visual Mockup) */}
      <section className="my-40 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10 rounded-[3rem]" />
        <div className="relative p-12 lg:p-20 rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl overflow-hidden group">
          {/* Corner Frames */}
          <div className="corner-frame corner-frame-tl w-16 h-16 opacity-30" />
          <div className="corner-frame corner-frame-br w-16 h-16 opacity-30" />
          
          <div className="relative flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-grow space-y-8">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-teal-400">Semantic Stack Analysis</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif italic tracking-tight text-white leading-tight">Global Semantic Understanding</h2>
              <p className="text-lg text-muted-foreground/60 leading-relaxed max-w-xl italic font-medium">
                Our engine treats your repository as a single multidimensional entity. 
                Instead of searching for keywords, we map concepts across the entire stack.
              </p>
              <div className="flex flex-wrap gap-3 pt-4">
                {['TypeScript', 'Go', 'Rust', 'Java', 'Python', 'C++'].map(lang => (
                   <span key={lang} className="px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] uppercase font-bold text-muted-foreground/40 hover:text-teal-400 hover:border-teal-500/20 transition-all cursor-default tracking-widest">{lang}</span>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 relative">
               <div className="teal-glow w-[300px] h-[300px] opacity-20" />
                <div className="relative w-72 h-72 border border-white/10 rounded-full flex items-center justify-center p-8 bg-[#030608]">
                  <div className="absolute inset-0 blueprint-grid opacity-20 rounded-full" />
                  <Globe className="h-32 w-32 text-teal-400/40 drop-shadow-[0_0_30px_rgba(45,212,191,0.2)]" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Tools List */}
      <section className="space-y-12">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Layers className="h-6 w-6 text-primary" />
          Advanced Tooling
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {advancedTools.map((t, i) => (
            <div key={i} className="flex flex-col gap-4 p-8 rounded-3xl bg-card border border-border hover:bg-card/50 transition-all">
              <div className="text-primary/60">{t.icon}</div>
              <h4 className="font-bold text-foreground tracking-tight">{t.title}</h4>
              <p className="text-sm text-muted-foreground/80 leading-relaxed italic">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-48 pt-24 border-t border-white/5 text-center px-8 relative overflow-hidden">
        <div className="teal-glow w-[600px] h-[600px] -bottom-24 left-1/2 -translate-x-1/2 opacity-5" />
        <h2 className="text-5xl md:text-7xl font-serif italic tracking-tight mb-8 text-white max-w-4xl mx-auto"> Ready to index the future?</h2>
        <p className="text-lg text-muted-foreground/60 font-medium mb-16 max-w-2xl mx-auto italic leading-relaxed">
          Start your transformation today. Connect your first repository and see the difference AI intelligence makes.
        </p>
        <button className="px-12 py-5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">
          Initiate Repository Indexing
        </button>
      </section>
    </PageLayout>
  );
}
