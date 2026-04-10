import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { History, Calendar, Sparkles, Rocket, Bug, Cpu, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { CHANGELOG_DATA } from "@/lib/changelog-data";


export default function Changelog() {
  return (
    <PageLayout 
      category="Signals"
      title="Platform Evolution" 
      subtitle="Tracking every milestone in the development of the world's most advanced codebase intelligence engine."
    >
      <div className="max-w-4xl mx-auto">
        {/* Live Status Header */}
        <div className="mb-24 flex flex-col sm:flex-row items-center justify-between p-8 rounded-[2rem] bg-card/40 backdrop-blur-md border border-border gap-8">
           <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Live Platform Synchronization</div>

           </div>
           <div className="hidden md:block text-[10px] font-black uppercase tracking-widest text-primary/60 border border-primary/20 px-4 py-2 rounded-full">
              Autonomous Monitoring Active
           </div>
        </div>

        <div className="space-y-32">
          {CHANGELOG_DATA.map((u, i) => (
            <motion.div 
              key={u.version} 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative pl-16 md:pl-24"
            >
              {/* Timeline Connector */}
              <div className="absolute left-6 md:left-10 top-2 bottom-[-128px] w-px bg-white/5 group-hover:bg-teal-500/20 transition-colors" />
              <div className={`absolute left-2.5 md:left-6.5 top-0 h-7 w-7 md:h-8 md:w-8 rounded-xl bg-[#030608] border border-white/10 flex items-center justify-center p-1.5 z-10 ${u.isLatest ? 'border-teal-500/50 shadow-[0_0_20px_rgba(45,212,191,0.2)]' : ''}`}>
                 {u.type === "Major Update" ? <Rocket className="h-4 w-4 text-teal-400" /> : <Bug className="h-4 w-4 text-teal-400/60" />}
              </div>

              <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-4">
                  <h3 className="text-4xl font-serif italic tracking-tighter text-white m-0 opacity-90">{u.version}</h3>
                  {u.isLatest && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-teal-400">Current Node</span>
                    </div>
                  )}
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400/40 border border-white/5 px-3 py-1 rounded-full">{u.type}</div>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                     <Calendar className="h-3.5 w-3.5" />
                     {u.date}
                  </div>
                </div>

                <div className="p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all relative overflow-hidden cursor-default">
                  <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <ul className="grid gap-5 m-0 p-0 list-none">
                    {u.changes.map((c, ci) => (
                      <li key={ci} className="text-muted-foreground/60 flex items-start gap-4 italic group-hover:text-white transition-colors">
                        <div className="h-px w-4 bg-teal-500/30 mt-3 shrink-0" />
                        <p className="m-0 text-base leading-relaxed font-medium">{c}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-48 p-20 rounded-[3rem] border border-white/5 bg-white/[0.01] text-center relative group overflow-hidden space-y-8">
           <div className="absolute inset-0 blueprint-grid opacity-10" />
           <div className="teal-glow w-[500px] h-[500px] -bottom-24 left-1/2 -translate-x-1/2 opacity-5" />
           
           <h3 className="text-4xl font-serif italic text-white flex items-center justify-center gap-4 relative">
              <Sparkles className="h-8 w-8 text-teal-400/60" />
              What's arriving next?
           </h3>
           <p className="text-lg text-muted-foreground/60 leading-relaxed italic max-w-xl mx-auto font-medium relative">
             Our R&D team is currently focused on <strong>Multimodal Neural Debugging</strong> and automated code-to-speech documentation generation.
           </p>
           <div className="pt-4 relative">
             <button className="px-12 py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">Development Roadmap</button>
           </div>
        </div>
      </div>
    </PageLayout>
  );
}
