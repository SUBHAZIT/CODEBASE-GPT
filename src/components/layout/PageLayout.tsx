import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Code2, Github, User, LogOut, Search, Brain, Zap, MessageSquare, Shield, GitBranch, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useUserAuth } from "@/hooks/use-user-auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  category?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, subtitle, children, category }) => {
  const { user, logout } = useUserAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030608] text-foreground flex flex-col font-sans selection:bg-teal-500/30 relative overflow-x-hidden">
      {/* Global Blueprint Grid Overlay */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0 opacity-[0.03]" />
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] teal-glow opacity-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] teal-glow opacity-5 pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030608]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tighter uppercase transition-colors group-hover:text-primary">CodebaseGPT</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em]">Features</Link>
            <Link to="/how-it-works" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em]">How it works</Link>
            <Link to="/faq" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em]">FAQ</Link>
            <Link to="/docs" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em]">Docs</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-white/10 hover:border-primary/50 transition-all">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] uppercase">{user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#030608] border-white/10 backdrop-blur-xl" align="end">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="text-[10px] uppercase tracking-widest focus:bg-white/5 cursor-pointer">
                    <User className="mr-2 h-3.5 w-3.5" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="text-[10px] uppercase tracking-widest focus:bg-white/5 cursor-pointer">
                    <SettingsIcon className="mr-2 h-3.5 w-3.5" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={() => logout()} className="text-[10px] uppercase tracking-widest focus:bg-white/5 cursor-pointer text-red-400 focus:text-red-400">
                    <LogOut className="mr-2 h-3.5 w-3.5" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/">
                <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                  Log in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-40 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            {category && (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold font-mono tracking-[0.3em] uppercase text-primary/80">{category}</span>
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight mb-8 leading-tight text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-muted-foreground/60 max-w-2xl font-medium italic leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-grow relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative"
        >
          <div className="relative bg-white/[0.01] border border-white/5 rounded-[2.5rem] overflow-hidden">
            {/* Technical Corner Frames */}
            <div className="corner-frame corner-frame-tl w-10 h-10 opacity-40" />
            <div className="corner-frame corner-frame-tr w-10 h-10 opacity-40" />
            <div className="corner-frame corner-frame-bl w-10 h-10 opacity-40" />
            <div className="corner-frame corner-frame-br w-10 h-10 opacity-40" />

            <div className="relative p-8 md:p-16">
              {children}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pt-24 pb-12 border-t border-white/5 bg-[#030608]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-sm font-bold text-foreground transition-colors">CODEBASEGPT</span>
              </div>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-xs uppercase tracking-wider">
                AI-powered codebase intelligence. Understand, debug, and secure any repository in minutes.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black text-foreground mb-4 uppercase tracking-[0.2em]">Product</p>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Features</Link></li>
                <li><Link to="/how-it-works" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">How it works</Link></li>
                <li><Link to="/faq" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-black text-foreground mb-4 uppercase tracking-[0.2em]">Resources</p>
              <ul className="space-y-3">
                <li><a href="https://github.com" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">GitHub</a></li>
                <li><Link to="/docs" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Documentation</Link></li>
                <li><Link to="/changelog" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-black text-foreground mb-4 uppercase tracking-[0.2em]">Legal</p>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Terms of Service</Link></li>
                <li><Link to="/contact" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
              A PRODUCT OF CODEBASEGPT
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                System Operational
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
