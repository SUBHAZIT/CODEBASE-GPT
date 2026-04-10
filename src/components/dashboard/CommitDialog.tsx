import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRepoStore } from "@/lib/store";
import { GitCommit, Github, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { toast } from "sonner";

interface CommitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommitDialog({ open, onOpenChange }: CommitDialogProps) {
  const { dirtyFiles, addTerminalLog, setFileDirty } = useRepoStore();
  const { user } = useUserAuth();
  const [message, setMessage] = useState("Update files via AI Codebase Architect");
  const [isPushing, setIsPushing] = useState(false);

  const handlePush = async () => {
    if (!message.trim()) {
      toast.error("Commit message is required");
      return;
    }

    setIsPushing(true);
    addTerminalLog({ type: 'info', message: `Initializing push for ${dirtyFiles.size} files...` });

    try {
      // Simulate GitHub API Push
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addTerminalLog({ type: 'success', message: 'GitHub API: Changes pushed successfully to main branch.' });
      addTerminalLog({ type: 'info', message: `Commit: ${Math.random().toString(36).substring(7)}` });
      
      // Clear dirty status
      dirtyFiles.forEach(path => setFileDirty(path, false));
      
      toast.success("Successfully pushed to GitHub!");
      onOpenChange(false);
    } catch (error) {
      addTerminalLog({ type: 'error', message: 'GitHub API Error: Authentication failed or Insufficient permissions.' });
      toast.error("Push failed. Check terminal for details.");
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0a0f1d] border-white/5 text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 tracking-tight italic">
            <GitCommit className="h-5 w-5 text-primary" />
            Commit & Push Changes
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/60 text-xs mt-2 italic">
            You are about to push {dirtyFiles.size} modified files to the remote repository.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Commit Message</label>
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-white/5 border-white/10 text-sm focus:border-primary/50"
              placeholder="Describe your changes..."
            />
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 max-h-[160px] overflow-y-auto mini-scrollbar">
             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Changed Files</div>
             <div className="space-y-1">
               {Array.from(dirtyFiles).map(path => (
                 <div key={path} className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground truncate">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                    {path}
                 </div>
               ))}
             </div>
          </div>
        </div>

        <DialogFooter className="bg-white/[0.02] -mx-6 -mb-6 p-6 mt-4 border-t border-white/5">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPushing} className="text-xs uppercase tracking-widest font-black">Cancel</Button>
          <Button 
            onClick={handlePush} 
            disabled={isPushing}
            className="bg-primary hover:bg-primary/90 text-[10px] uppercase font-black tracking-widest px-8"
          >
            {isPushing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Github className="h-3.5 w-3.5 mr-2" />}
            Confirm Push
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
