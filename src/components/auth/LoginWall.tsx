import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Zap, Shield, History, Lock, Sparkles, Star, Code2, ArrowRight } from "lucide-react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { motion, AnimatePresence } from "framer-motion";

interface LoginWallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREMIUM_FEATURES = [
  {
    icon: Lock,
    title: "Private Repos",
    desc: "Index your most secure code",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: History,
    title: "Full History",
    desc: "Infinite session storage",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "V-Pro Speed",
    desc: "10x faster indexing engine",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Advanced SEO",
    desc: "Automated security audits",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export function LoginWall({ open, onOpenChange }: LoginWallProps) {
  const { loginWithGitHub, loading } = useUserAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-white/5 bg-[#030608] shadow-2xl">
        {/* HUD Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="blueprint-grid absolute inset-0 opacity-[0.03]" />
          <div className="teal-glow w-[400px] h-[400px] -top-20 -right-20 opacity-10" />
          
          {/* Technical Corner Frames */}
          <div className="corner-frame corner-frame-tl w-8 h-8 opacity-40" />
          <div className="corner-frame corner-frame-tr w-8 h-8 opacity-40" />
          <div className="corner-frame corner-frame-bl w-8 h-8 opacity-40" />
          <div className="corner-frame corner-frame-br w-8 h-8 opacity-40" />
        </div>
        <div className="relative h-48 flex items-center justify-center overflow-hidden border-b border-white/5 bg-white/[0.02]">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="relative p-3 rounded-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-16 h-16 flex items-center justify-center">
                <Code2 className="h-10 w-10 text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
              </div>
            </div>
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20"
            >
              <span className="text-[9px] font-black text-teal-400 uppercase tracking-[0.2em]">System Upgrade</span>
            </motion.div>
          </motion.div>
        </div>

        <div className="px-8 pt-6 pb-8 relative z-10">
          <div className="text-center mb-10">
            <DialogTitle className="text-4xl font-serif italic tracking-tight mb-3 text-white">
              Fuel your workflow
            </DialogTitle>
            <DialogDescription className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 leading-relaxed max-w-[300px] mx-auto">
              You've mastered the basics. Now unlock the full power of AI codebase intelligence.
            </DialogDescription>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            {PREMIUM_FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="group p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-teal-500/20 transition-all cursor-default relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/5 border border-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="h-5 w-5 text-teal-400/80" />
                  </div>
                  <div>
                    <p className="text-[11px] font-serif italic text-white opacity-90">{feature.title}</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground leading-tight mt-1">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <DialogFooter className="flex justify-center sm:justify-center">
            <Button 
              onClick={() => loginWithGitHub()} 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 group"
            >
              <Github className="h-5 w-5" />
              Continue with GitHub
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
