import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Lock, ArrowRight, Loader2, Code2 } from "lucide-react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { motion } from "framer-motion";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { loginWithGitHub } = useUserAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    const { error } = await loginWithGitHub();
    if (error) {
      setIsLoggingIn(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-white/5 bg-[#030608] shadow-2xl">
        {/* HUD Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="blueprint-grid absolute inset-0 opacity-[0.03]" />
          <div className="teal-glow w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
          
          {/* Technical Corner Frames */}
          <div className="corner-frame corner-frame-tl w-8 h-8 opacity-40" />
          <div className="corner-frame corner-frame-tr w-8 h-8 opacity-40" />
          <div className="corner-frame corner-frame-bl w-8 h-8 opacity-40" />
          <div className="corner-frame corner-frame-br w-8 h-8 opacity-40" />
        </div>

        <div className="relative z-10 p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-teal-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Code2 className="h-7 w-7 text-teal-500 relative z-10" />
            </div>

            <div className="space-y-3">
              <DialogTitle className="text-4xl font-serif italic tracking-tight text-white leading-tight">Welcome back</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-bold leading-relaxed max-w-[280px] mx-auto">
                Sign in to manage your indexed repositories and unlock full codebase intelligence.
              </DialogDescription>
            </div>

            <div className="w-full space-y-4 pt-4">
              <Button 
                onClick={handleLogin} 
                disabled={isLoggingIn}
                className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-neutral-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 group"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting
                  </>
                ) : (
                  <>
                    <Github className="h-5 w-5" />
                    Continue with GitHub
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </Button>
              
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
                Safe. Secure. Open Source Friendly.
              </p>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
