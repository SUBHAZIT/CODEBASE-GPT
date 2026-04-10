import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Mail, Github, Twitter, MapPin, Shield, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const contactOptions = [
    { icon: <Mail className="h-6 w-6" />, label: "Protocol", value: "SUBHAJITPATHAK9900@GMAIL.COM" },
    { icon: <Twitter className="h-6 w-6" />, label: "Signal", value: "@CodebaseGPT" },
    { icon: <Github className="h-6 w-6" />, label: "Repository", value: "CODEBASEGPT" },
    { icon: <MapPin className="h-6 w-6" />, label: "Nexus", value: "KOLKATA, WEST BENGAL, INDIA" },
  ];

  return (
    <PageLayout
      category="Network"
      title="Establish Connection"
      subtitle="Engage with our technical team to explore custom integrations, high-volume indexing, or neural feedback."
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-serif italic text-white leading-tight">Sync with our technical engineers.</h2>
              <p className="text-lg text-muted-foreground/60 leading-relaxed italic font-medium">
                Our support terminals are monitored 24/7 by neural engineers.
                Expect a response within 400ms of ingestion (or slightly longer for human-in-the-loop queries).
              </p>
            </div>

            <div className="grid gap-6">
              {contactOptions.map((opt, i) => (
                <div key={i} className="group p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex gap-6 items-center">
                    <div className="h-12 w-12 rounded-xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-center text-teal-400/60 group-hover:scale-110 transition-transform">
                      {opt.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/40">{opt.label}</p>
                      <p className="text-sm font-bold text-white/80">{opt.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-4 italic relative overflow-hidden group">
              <div className="absolute inset-0 blueprint-grid opacity-5" />
              <div className="relative flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-teal-400/60">
                <CheckCircle2 className="h-4 w-4" />
                Network Status: Active
              </div>
              <p className="relative text-xs text-muted-foreground/40 leading-relaxed">
                Support engineers are currently online in PST and UTC timezones.
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-teal-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
            <div className="relative p-12 rounded-[2.5rem] border border-white/10 bg-[#030608] shadow-2xl space-y-8 overflow-hidden">
              <div className="absolute inset-0 blueprint-grid opacity-5" />
              <div className="relative space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/40 block ml-1">Terminal ID / Name</label>
                  <input
                    placeholder="ENTER FULL NAME..."
                    className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-xl px-5 text-xs font-bold text-white placeholder:text-muted-foreground/20 uppercase tracking-widest focus:outline-none focus:border-teal-500/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/40 block ml-1">Ingestion Point / Email</label>
                  <input
                    placeholder="USER@ORG.DOMAIN"
                    className="w-full h-14 bg-white/[0.02] border border-white/10 rounded-xl px-5 text-xs font-bold text-white placeholder:text-muted-foreground/20 uppercase tracking-widest focus:outline-none focus:border-teal-500/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/40 block ml-1">Transmission Data / Message</label>
                  <textarea
                    rows={5}
                    placeholder="INITIATING TRANSMISSION..."
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-5 text-xs font-bold text-white placeholder:text-muted-foreground/20 uppercase tracking-widest focus:outline-none focus:border-teal-500/30 transition-all resize-none"
                  />
                </div>
                <button className="w-full h-14 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                  Broadcast Signal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
