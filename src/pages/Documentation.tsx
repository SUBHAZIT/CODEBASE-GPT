import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Book, Code, Terminal, Zap, BookOpen, Layers, Shield, Cpu, HelpCircle, Search, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function Documentation() {
  const sections = [
    {
      title: "Core Infrastructure",
      items: [
        { icon: <Cpu className="h-4 w-4" />, label: "Indexing Logic" },
        { icon: <Layers className="h-4 w-4" />, label: "Vector Embeddings" },
        { icon: <Code className="h-4 w-4" />, label: "Language Support" }
      ]
    },
    {
      title: "Security & Auditing",
      items: [
        { icon: <Shield className="h-4 w-4" />, label: "Secret Detection" },
        { icon: <Zap className="h-4 w-4" />, label: "Vulnerability Scan" }
      ]
    }
  ];

  return (
    <PageLayout 
      category="Technical Docs"
      title="The Unified Framework" 
      subtitle="Deep dive into the architecture, APIs, and operational layers that drive CodebaseGPT."
    >
      <div className="grid lg:grid-cols-12 gap-16">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-12 relative">
           <div className="absolute -left-8 top-0 bottom-0 w-px bg-white/5 hidden lg:block" />
           {sections.map((s, i) => (
             <div key={s.title} className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400/50">{s.title}</h4>
                <ul className="space-y-4">
                  {s.items.map((item, ii) => (
                    <li key={item.label} className="group flex items-center gap-3 text-xs font-bold text-muted-foreground hover:text-white cursor-pointer transition-all uppercase tracking-widest pl-2 border-l border-transparent hover:border-teal-500/40">
                       <span className="text-teal-400/30 group-hover:text-teal-400 transition-colors">{item.icon}</span>
                       {item.label}
                    </li>
                  ))}
                </ul>
             </div>
           ))}
        </aside>
        
        <div className="lg:col-span-9 space-y-24">
          <section>
             <div className="flex items-center gap-4 text-white mb-8 group">
                <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6 text-teal-400/80" />
                </div>
                <h2 className="m-0 text-3xl lg:text-4xl font-serif italic">System Architecture</h2>
             </div>
             <p className="text-lg font-medium italic mb-12 border-l-2 border-teal-500/20 pl-8 text-muted-foreground/80 leading-relaxed">
                CodebaseGPT is built on a distributed indexing engine that treats repositories as coherent biological systems rather than collections of text files.
             </p>
             
             <div className="prose prose-invert max-w-none text-muted-foreground/60 leading-relaxed italic font-medium">
               <p>
                Our platform leverages the distributed vectorization of source code. When you input a repository URL, the system initiates a multi-stage ingestion pipeline designed for speed, security, and semantic depth.
               </p>
             </div>
             
             <div className="grid sm:grid-cols-2 gap-6 my-16">
                <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <h4 className="m-0 text-white font-serif italic text-lg opacity-90">Global Context Awareness</h4>
                   <p className="text-sm m-0 text-muted-foreground/60 italic leading-relaxed">Unlike traditional search tools, we maintain a global understanding of cross-file dependencies and module boundaries.</p>
                </div>
                <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <h4 className="m-0 text-white font-serif italic text-lg opacity-90">Semantic Tokenization</h4>
                   <p className="text-sm m-0 text-muted-foreground/60 italic leading-relaxed">We use sophisticated AST parsers to understand the intent and structure of your logic before it ever reaches the LLM.</p>
                </div>
             </div>
          </section>

          <section>
             <div className="flex items-center gap-4 text-white mb-8 group">
                <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 group-hover:scale-110 transition-transform">
                  <Terminal className="h-6 w-6 text-teal-400/80" />
                </div>
                <h2 className="m-0 text-3xl lg:text-4xl font-serif italic">Environment Configuration</h2>
             </div>
             <p className="text-muted-foreground/60 italic font-medium leading-relaxed mb-8">
                Configure your environment for optimal indexing. The indexing agent follows default system rules but can be customized for deep analysis.
             </p>
             
             <div className="relative group">
               <div className="absolute inset-0 bg-teal-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
               <pre className="relative p-10 rounded-2xl border border-white/10 bg-[#030608] font-mono text-sm leading-relaxed overflow-x-auto shadow-2xl">
                  <div className="absolute top-4 right-6 text-[9px] font-black tracking-widest text-teal-400/40 opacity-0 group-hover:opacity-100 transition-opacity uppercase font-mono">Terminal Source / Bash</div>
                  <div className="space-y-2">
                     <span className="text-teal-900/40 italic"># Install the primary CLI agent</span><br/>
                     <span className="text-teal-400/60 uppercase text-[10px] tracking-widest mr-3">CLI</span> <span className="text-white">npm install -g @codebasegpt/cli</span><br/><br/>
                     <span className="text-teal-900/40 italic"># Authenticate with the neural cloud</span><br/>
                     <span className="text-teal-400/60 uppercase text-[10px] tracking-widest mr-3">CLI</span> <span className="text-white">codebase-gpt login</span><br/><br/>
                     <span className="text-teal-900/40 italic"># Initiate high-depth scan sequence</span><br/>
                     <span className="text-teal-400/60 uppercase text-[10px] tracking-widest mr-3">CLI</span> <span className="text-white">codebase-gpt index ./project --mode high-depth</span>
                  </div>
               </pre>
             </div>
          </section>

          <div className="mt-20 p-16 rounded-[3rem] border border-white/5 bg-white/[0.01] relative group overflow-hidden text-center space-y-8">
             <div className="absolute inset-0 blueprint-grid opacity-10" />
             <div className="teal-glow w-[400px] h-[400px] -bottom-24 left-1/2 -translate-x-1/2 opacity-5" />
             
             <div className="relative space-y-6">
                <h3 className="m-0 text-3xl font-serif italic text-white leading-tight">Need specialized technical guidance?</h3>
                <p className="text-lg text-muted-foreground/60 max-w-xl mx-auto italic font-medium leading-relaxed">Learn how to integrate CodebaseGPT into your CI/CD pipelines with custom GitHub actions.</p>
                <div className="pt-4">
                  <button className="px-12 py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:bg-neutral-200 transition-all">Explore API Specification</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
