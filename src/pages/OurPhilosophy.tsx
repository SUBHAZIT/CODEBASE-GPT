import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Code2, ArrowLeft, Sparkles, Shield, Eye, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const OurPhilosophy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Brain,
      title: "Context-First AI",
      content: "We believe that AI is only as good as the context it consumes. Unlike generic LLMs, CodebaseGPT prioritizes deep structural analysis of your repository, mapping dependencies and understanding architecture before answering a single question."
    },
    {
      icon: Eye,
      title: "Radical Transparency",
      content: "Black boxes are for magic shows, not software engineering. Every insight provided by our engine includes direct file references and line numbers. We don't just tell you what's happening; we show you where it's happening."
    },
    {
      icon: Shield,
      title: "Privacy by Default",
      content: "Your intellectual property is sacred. Our architecture is designed to process code in-memory or via secure, ephemeral edge sessions. We never persist your raw source code, and your secrets stay in your browser."
    },
    {
      icon: Sparkles,
      title: "The Blueprint Aesthetic",
      content: "Software is an art form. Our design language—the Blueprint—reflects the precision of engineering and the clarity of a master plan. We build tools that are as beautiful to look at as they are powerful to use."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-teal-500/30">
      {/* Blueprint Grid Overlay */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0" />
      
      {/* Background Glows */}
      <div className="teal-glow w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
      <div className="teal-glow w-[400px] h-[400px] -top-48 -right-48 opacity-10" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tighter uppercase">CodebaseGPT</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Home
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/80">Our Vision</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-8">
            Engineering <span className="italic text-teal-500">Clarity.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium italic max-w-2xl mx-auto leading-relaxed">
            "The best way to predict the future of software is to understand its current state with absolute precision."
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-teal-500 group-hover:border-teal-500/20 transition-all mb-8">
                <section.icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-serif italic mb-4 text-white">{section.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed italic font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-12 rounded-[3rem] border border-white/5 bg-teal-500/[0.02] text-center"
        >
          <h2 className="text-3xl font-serif italic mb-6">Join the Movement</h2>
          <p className="text-muted-foreground text-sm mb-10 max-w-md mx-auto italic font-medium">
            We are building a new standard for codebase intelligence. Help us define the future of software understanding.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="h-12 px-8 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 transition-all"
          >
            Get Started Now
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
          CodebaseGPT © 2026 • Blueprint Design System v1.0
        </p>
      </footer>
    </div>
  );
};

export default OurPhilosophy;
