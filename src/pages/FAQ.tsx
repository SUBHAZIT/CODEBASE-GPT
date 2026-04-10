import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { HelpCircle, Search, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function FAQ() {
  const faqs = [
    {
      category: "Platform Access",
      questions: [
        {
          q: "What are the repository indexing limits?",
          a: "Free users can index up to 5 repositories without authentication. Authenticated users enjoy unlimited public repository indexing. For private repositories, the limit depends on your subscription tier."
        },
        {
          q: "How do I connect my private GitHub repositories?",
          a: "Simply sign in with your GitHub account. We use secure OAuth 2.0 scopes (`repo` and `read:user`) to list and clone your private projects for analysis. We never see your password."
        }
      ]
    },
    {
      category: "Technology & AI",
      questions: [
        {
          q: "Which AI model powers CodebaseGPT?",
          a: "Everything is powered by Google's Gemini 1.5 Pro. Its 1M+ token context window allows it to digest entire codebases and maintain global architectural awareness."
        },
        {
          q: "Does it support monorepos or complex structures?",
          a: "Yes. Our structural tokenization engine can navigate complex monorepo patterns, identifying boundaries between packages and mapping internal dependencies across workspace links."
        }
      ]
    },
    {
      category: "Security & Privacy",
      questions: [
        {
          q: "Is my code stored on your servers?",
          a: "No. Your source code is ingested into our ephemeral indexing engine, vectorized, and then purged. We only store the high-dimensional embeddings and structural metadata required to answer your queries."
        },
        {
          q: "Does the AI learn from my private data?",
          a: "Absolutely not. Your code is processed within private tenant boundaries. We do not use your private repository data to train or fine-tune our global AI models."
        }
      ]
    }
  ];

  return (
    <PageLayout 
      category="Support"
      title="Common Enquiries" 
      subtitle="Detailed answers to technical, security, and billing questions from the CodebaseGPT community."
    >
      <div className="max-w-5xl mx-auto">
        {/* Search Bar Visual */}
        <div className="relative mb-32 max-w-2xl mx-auto group">
          <div className="absolute -inset-1 bg-teal-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
          <div className="relative">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-teal-400/40" />
            </div>
            <input 
               type="text" 
               disabled 
               placeholder="Search the technical manual..." 
               className="w-full h-16 bg-[#030608] border border-white/10 rounded-2xl px-16 text-sm font-bold text-white placeholder:text-muted-foreground/30 uppercase tracking-[0.2em] focus:outline-none focus:border-teal-500/30 transition-all"
            />
            <div className="absolute inset-y-0 right-6 flex items-center gap-2">
              <kbd className="hidden sm:inline-flex px-2 py-1 bg-white/5 rounded border border-white/10 uppercase font-black text-[9px] text-muted-foreground/40 tracking-widest">CMD</kbd>
              <kbd className="hidden sm:inline-flex px-2 py-1 bg-white/5 rounded border border-white/10 uppercase font-black text-[9px] text-muted-foreground/40 tracking-widest">K</kbd>
            </div>
          </div>
        </div>

        <div className="grid gap-24">
          {faqs.map((group, gi) => (
            <div key={gi} className="space-y-10">
               <div className="flex items-center gap-6">
                 <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-400/60 whitespace-nowrap">
                    {group.category}
                 </h2>
                 <div className="h-px w-full bg-white/5" />
               </div>

               <div className="grid gap-6">
                  {group.questions.map((f, i) => (
                    <motion.div 
                      key={f.q} 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="group p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-default relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex gap-8 items-start relative">
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                           <HelpCircle className="h-5 w-5 text-teal-400/60" />
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-2xl font-serif italic text-white leading-tight tracking-tight group-hover:text-teal-400 transition-colors">{f.q}</h3>
                           <p className="text-base text-muted-foreground/60 leading-relaxed italic font-medium max-w-3xl">
                             {f.a}
                           </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>
          ))}
        </div>

        <div className="mt-40 p-16 rounded-[3rem] border border-white/5 bg-white/[0.01] text-center space-y-8 relative overflow-hidden group">
           <div className="absolute inset-0 blueprint-grid opacity-10" />
           <div className="teal-glow w-[400px] h-[400px] -bottom-24 left-1/2 -translate-x-1/2 opacity-5" />
           
           <h3 className="text-4xl font-serif italic text-white relative">Still need clarification?</h3>
           <p className="text-lg text-muted-foreground/60 max-w-md mx-auto italic relative">Our technical engineers are available for specialized consultations for enterprise customers.</p>
           <div className="pt-4 relative">
             <button className="px-12 py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]">Contact Tech Support</button>
           </div>
        </div>
      </div>
    </PageLayout>
  );
}
