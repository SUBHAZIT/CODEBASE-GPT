import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { HelpCircle, Zap, ShieldCheck, Code2, Search, MessageSquare, Database, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const howItWorksFAQ = [
    {
      q: "How does CodebaseGPT index my repository?",
      a: "When you provide a repository URL, our engine performs a structural analysis of the codebase. It parses the file tree, understands module relationships using AST parsers (like Tree-sitter), and creates high-dimensional vector embeddings of code snippets. This allows the AI to maintain global architectural awareness.",
      icon: <Database className="h-5 w-5 text-primary" />
    },
    {
      q: "Is my source code stored securely?",
      a: "Yes. CodebaseGPT is built with a zero-retention philosophy. Your raw source code is processed in ephemeral memory during indexing and then purged. We only store the structural metadata and vector embeddings required to provide intelligence. All data is encrypted with AES-256 at rest and TLS 1.3 in transit.",
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />
    },
    {
      q: "Which programming languages are supported?",
      a: "CodebaseGPT is language-agnostic. While it has specialized deep-reasoning capabilities for TypeScript, JavaScript, Python, Go, Rust, and Java, it can analyze and reason about any text-based source code in any repository.",
      icon: <Code2 className="h-5 w-5 text-blue-500" />
    },
    {
      q: "How does the AI provide such precise answers?",
      a: "Unlike standard LLMs that 'guess', CodebaseGPT uses Retrieval-Augmented Generation (RAG). It first searches your indexed codebase for the most relevant files and context, then feeds that specific data into the AI model, ensuring every answer is grounded in your actual code.",
      icon: <Search className="h-5 w-5 text-purple-500" />
    },
    {
      q: "Can I use CodebaseGPT for private repositories?",
      a: "Absolutely. For private repositories, you can provide a GitHub Personal Access Token (PAT) which is stored only in your browser's local storage. This token is used to securely fetch your code via GitHub's API — it is never sent to or stored on our servers.",
      icon: <Lock className="h-5 w-5 text-amber-500" />
    },
    {
      q: "What can I actually do with the AI chat?",
      a: "You can ask for architectural overviews, debug complex issues, find specific logic across multiple files, generate documentation, or even ask for security audits. The AI acts as a senior developer who has memorized every line of your project.",
      icon: <MessageSquare className="h-5 w-5 text-sky-500" />
    }
  ];

  return (
    <PageLayout 
      category="The Engine"
      title="How CodebaseGPT Reasons" 
      subtitle="Discover the sophisticated pipeline that transforms raw source code into an interactive, intelligent knowledge base."
    >
      <div className="max-w-4xl mx-auto py-12">
        <div className="grid gap-6">
          {howItWorksFAQ.map((item, i) => (
            <motion.div 
              key={item.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-default relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex gap-8 items-start relative">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(45,212,191,0.1)]">
                  <div className="text-teal-400/80">{item.icon}</div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif italic tracking-tight text-white group-hover:text-teal-400 transition-colors leading-tight">
                    {item.q}
                  </h3>
                  <p className="text-base text-muted-foreground/60 leading-relaxed italic font-medium max-w-2xl">
                    {item.a}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 p-16 rounded-[3rem] border border-white/5 bg-white/[0.01] text-center space-y-8 relative overflow-hidden group">
          <div className="absolute inset-0 blueprint-grid opacity-10" />
          <div className="teal-glow w-[400px] h-[400px] -bottom-24 left-1/2 -translate-x-1/2 opacity-5" />
          
          <h3 className="text-4xl font-serif italic tracking-tight text-white relative">Ready to experience the intelligence?</h3>
          <p className="text-lg text-muted-foreground/60 max-w-xl mx-auto italic font-medium relative">
            Join thousands of developers who are using CodebaseGPT to navigate complex systems with ease.
          </p>
          <div className="pt-4 relative">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:bg-neutral-200 transition-all"
              onClick={() => window.location.href = '/'}
            >
              Initiate Indexing
            </motion.button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
