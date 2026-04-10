import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight, Zap, MessageSquare, FileCode, Code2, Lock, ChevronDown,
  Shield, GitBranch, Search, Brain, BarChart3, Bug, Github, LogOut, User, Settings as SettingsIcon,
  Sparkles, Terminal, Package, Download, Boxes, Cpu, Copy, Check, Play, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useCompactMode } from "@/hooks/use-compact-mode";
import { useTheme } from "@/hooks/use-theme";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserRepos } from "@/components/dashboard/UserRepos";
import { useUsageStore } from "@/lib/usage-store";
import { LoginWall } from "@/components/auth/LoginWall";
import { Progress } from "@/components/ui/progress";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { supabase } from "@/integrations/supabase/client";

const CountUp = ({ end, duration = 2 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const FEATURES = [
  {
    icon: Search,
    title: "AI-Powered Code Chat",
    desc: "Ask natural language questions about any codebase. Get precise answers with file references and line numbers.",
  },
  {
    icon: Brain,
    title: "Instant Onboarding Docs",
    desc: "Auto-generate comprehensive onboarding documentation so new developers can ramp up in minutes.",
  },
  {
    icon: Shield,
    title: "Security Scanning",
    desc: "Detect vulnerabilities, misconfigurations, and security anti-patterns across the entire repository.",
  },
  {
    icon: BarChart3,
    title: "Architecture Overview",
    desc: "Visualize dependency graphs, understand system design, and map the full project structure.",
  },
  {
    icon: Bug,
    title: "Issue Solver",
    desc: "Fetch GitHub issues and get AI-generated solutions with exact code changes and root cause analysis.",
  },
  {
    icon: GitBranch,
    title: "Private Repo Support",
    desc: "Securely index private repositories using a personal access token stored only in your browser.",
  },
  {
    icon: Sparkles,
    title: "PRGPT: AI PR Reviewer",
    desc: "Automate code reviews and PR summaries using Gemini 1.5. Get line-by-line suggestions and chat with your PRs.",
  },
];

const FAQ = [
  {
    q: "How does CodebaseGPT index my repository?",
    a: "We fetch the file tree and contents via the GitHub API, chunk them intelligently, and build a context model. This lets the AI answer questions with precise file and line references.",
  },
  {
    q: "Is my code stored on your servers?",
    a: "Code is processed in-memory during your session. We don't persist raw source code. Chat sessions can optionally be saved for your convenience.",
  },
  {
    q: "Does it work with private repositories?",
    a: "Yes. Provide a GitHub Personal Access Token (classic or fine-grained) and it's stored only in your browser's localStorage. The token is sent directly to GitHub's API — we never store it server-side.",
  },
  {
    q: "What languages and frameworks are supported?",
    a: "CodebaseGPT is language-agnostic. It works with any GitHub repository regardless of language, framework, or project structure.",
  },
  {
    q: "How accurate are the AI responses?",
    a: "Answers are grounded in your actual codebase context. The AI cites specific files and line numbers, so you can always verify. Complex or ambiguous questions may require follow-up prompts.",
  },
];

const Landing = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const navigate = useNavigate();
  const compact = useCompactMode();
  const { user, loginWithGitHub, logout, loading } = useUserAuth();
  const { theme, toggleTheme } = useTheme();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const navBg = useTransform(smoothProgress, [0, 0.05], [0, 1]);
  const { indexCount, incrementIndexCount } = useUsageStore();
  const [showLoginWall, setShowLoginWall] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        let visitorId = localStorage.getItem("visitor_id");
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem("visitor_id", visitorId);
        }

        // Track visit via Edge Function
        await supabase.functions.invoke("track-visit", {
          body: { visitor_id: visitorId },
        });

        // Fetch total unique visitors
        const { data } = await supabase.functions.invoke("stats");
        if (data && typeof data.count === "number") {
          setVisitorCount(data.count);
        }
      } catch (error) {
        console.error("Error tracking visitor:", error);
      }
    };

    trackVisitor();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("github_pat");
    if (saved) {
      setGithubToken(saved);
      setShowToken(true);
    }
  }, []);

  const handleIndex = (overrideUrl?: string) => {
    const url = overrideUrl || repoUrl;

    if (!url.includes("github.com")) {
      toast({ title: "Invalid URL", description: "Please enter a valid GitHub repository URL.", variant: "destructive" });
      return;
    }

    if (!user && indexCount >= 5) {
      console.log("Limit hit, showing LoginWall", { indexCount });
      setShowLoginWall(true);
      return;
    }

    if (githubToken) localStorage.setItem("github_pat", githubToken);
    if (!user) incrementIndexCount();

    navigate(`/index/custom-repo`, { state: { githubUrl: url, githubToken: githubToken || undefined } });
  };

  const handleRepoClick = (url: string) => {
    setRepoUrl(url);
    handleIndex(url);
  };

  const content = compact ? (
    <div className="h-screen flex flex-col bg-background p-3">
      <div className="flex items-center gap-2 mb-3">
        <Code2 className="h-4 w-4 text-primary" />
        <span className="font-mono text-xs font-medium text-foreground">CodebaseGPT</span>
      </div>
      <div className="mb-3">
        <div className="flex gap-1.5">
          <Input
            placeholder="github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleIndex()}
            className="h-8 font-mono text-xs bg-card border-border"
          />
          <Button onClick={() => handleIndex()} size="sm" className="h-8 px-3 text-xs shrink-0">
            Go
          </Button>
        </div>

        <Collapsible open={showToken} onOpenChange={setShowToken}>
          <CollapsibleTrigger className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-1.5">
            <Lock className="h-2.5 w-2.5" /> Private repo?
            <ChevronDown className={`h-2.5 w-2.5 transition-transform ${showToken ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Input
              type="password"
              placeholder="GitHub Personal Access Token"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="h-7 font-mono text-[10px] bg-card border-border mt-1.5"
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
      <p className="text-[10px] text-muted-foreground">Paste any GitHub URL to get started.</p>
    </div>
  ) : (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-teal-500/30 relative">
      {/* Global Blueprint Grid Overlay */}
      <div className="fixed inset-0 blueprint-grid pointer-events-none z-0" />

      {/* Plus Markers for global grid (optional, can be per section) */}

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tighter uppercase transition-colors group-hover:text-primary">CodebaseGPT</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em]">Features</Link>
            <Link to="/how-it-works" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em]">How it works</Link>
            <Link to="/cli" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em]">CLI</Link>
            <Link to="/sdk" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em]">SDK</Link>
            <Link to="/faq" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em]">FAQ</Link>
            <Link to="/docs" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em]">Docs</Link>
          </div>

          <div className="flex items-center gap-4">

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-white/10 p-0 overflow-hidden hover:bg-white/5">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback className="bg-muted text-[10px] font-bold">{user.user_metadata.user_name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-semibold text-xs py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground">{user.user_metadata.user_name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="text-xs py-3 px-4 focus:bg-white/5 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="text-xs py-3 px-4 focus:bg-white/5 cursor-pointer">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={() => logout()} className="text-xs py-3 px-4 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowLoginDialog(true)} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
                  Log in
                </Button>
                <Button size="sm" onClick={() => setShowLoginDialog(true)} className="h-9 px-5 text-[10px] font-black uppercase tracking-[0.2em] bg-teal-500 text-black hover:bg-teal-400 transition-all rounded-full shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                  Try CodebaseGPT
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 overflow-hidden border-b border-white/5">
        {/* Teal Glows */}
        <div className="teal-glow w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
        <div className="teal-glow w-[400px] h-[400px] top-1/4 left-1/4 opacity-15" />

        {/* Corner Frames */}
        <div className="corner-frame corner-frame-tl ml-8 mt-8" />
        <div className="corner-frame corner-frame-tr mr-8 mt-8" />
        <div className="corner-frame corner-frame-bl ml-8 mb-8" />
        <div className="corner-frame corner-frame-br mr-8 mb-8" />

        {/* Diagonal Guide Lines */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
          <div className="absolute top-0 left-0 w-[200%] h-px bg-teal-500/20 -rotate-45 origin-top-left" />
          <div className="absolute bottom-0 right-0 w-[200%] h-px bg-teal-500/20 -rotate-45 origin-bottom-right" />
        </div>

        {/* Grid Lines & Intersections */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="grid-line-v left-1/2 -translate-x-1/2 opacity-10" />
          <div className="grid-line-h top-1/4 opacity-10" />
          <div className="grid-line-h top-3/4 opacity-10" />

        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Badges */}
            <div className="flex items-center gap-3 mb-10">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-primary/80">#1 AI Codebase Engine</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                <Github className="h-3 w-3 text-white/40" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-white/60">
                  Trusted by {visitorCount !== null ? <CountUp end={visitorCount} /> : "0"}+ Developers
                </span>
              </div>
            </div>

            <h1 className="text-5xl md:text-8xl font-serif leading-[1.05] tracking-tight mb-8">
              The most complex codebases <br />
              <span className="italic text-teal-500">decoded in seconds.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-medium italic max-w-2xl mb-12 leading-relaxed">
              Rebuild your understanding of any software system. Ask questions, <br className="hidden md:block" />
              track dependencies, and solve issues - directly in your browser.
            </p>

            <div className="w-full max-w-2xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 p-1.5 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl group focus-within:border-primary/40 transition-all">
                <div className="flex-grow flex items-center px-4">
                  <Github className="h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary/60 transition-colors mr-3" />
                  <input
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleIndex()}
                    className="w-full bg-transparent border-none outline-none font-mono text-sm placeholder:text-muted-foreground/30 text-foreground"
                  />
                </div>
                <Button onClick={() => handleIndex()} className="h-12 px-8 rounded-2xl bg-teal-500 text-black font-black uppercase tracking-widest text-[11px] hover:bg-teal-400 hover:scale-105 transition-all active:scale-95 shadow-[0_0_30px_rgba(20,184,166,0.2)] shrink-0">
                  Index Repository <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {!user && (
                <div className="px-6 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    <span>Community Tier Access</span>
                    <span>{indexCount}/5 Credits Used</span>
                  </div>
                  <Progress value={(indexCount / 5) * 100} className="h-1 bg-white/5 border border-white/5" />
                </div>
              )}

              <Collapsible open={showToken} onOpenChange={setShowToken} className="pt-2">
                <CollapsibleTrigger className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/60 hover:text-primary transition-colors mx-auto">
                  <Lock className="h-3 w-3" /> Need private repo access?
                  <ChevronDown className={`h-3 w-3 transition-transform ${showToken ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-4 flex flex-col gap-3 p-4 rounded-3xl bg-white/[0.03] border border-white/5 max-w-lg mx-auto">
                    <input
                      type="password"
                      placeholder="GitHub Personal Access Token"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:border-primary/40 transition-all"
                    />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 text-center"> Token stays in your localStorage, encrypted. </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </motion.div>

          {/* User Repos list if exists */}
          {user && (
            <div className="mt-20">
              <UserRepos onIndex={handleRepoClick} />
            </div>
          )}

          {/* Logo Cloud Section */}
          <div className="mt-32 pt-16 border-t border-white/5 overflow-hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mb-12">Enjoyed by developers at the world's best companies:</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-20 grayscale filter brightness-200">
              {['OpenAI', 'Google', 'Anthropic', 'NVIDIA', 'Vercel', 'GitHub', 'Meta'].map(client => (
                <span key={client} className="text-xl md:text-2xl font-black italic tracking-tighter select-none">{client}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Simple by Design Section */}
      <section id="how-it-works" className="relative py-32 border-b border-white/5 overflow-hidden">
        {/* Teal Glow */}
        <div className="teal-glow w-[600px] h-[600px] -top-1/4 -right-1/4 opacity-10" />

        {/* Corner Frames */}
        <div className="corner-frame corner-frame-tl ml-8 mt-8 opacity-50" />
        <div className="corner-frame corner-frame-tr mr-8 mt-8 opacity-50" />

        {/* PRGPT Featured Section - Classic Redesign */}
        <div className="max-w-7xl mx-auto px-6 relative z-10 mb-32">
          <div className="rounded-[3rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-10 md:p-20 relative overflow-hidden text-center">
            {/* Background Decorations */}
            <div className="teal-glow w-[800px] h-[800px] -top-1/2 -left-1/2 opacity-10" />
            <div className="teal-glow w-[600px] h-[600px] -bottom-1/2 -right-1/2 opacity-10" />

            <div className="max-w-3xl mx-auto space-y-12 relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-teal-500/20 bg-teal-500/5 backdrop-blur-xl">
                  <Sparkles className="h-4 w-4 text-teal-500" />
                  <span className="text-[11px] font-black tracking-[0.3em] uppercase text-teal-500">PRGPT - AI PR REVIEWER</span>
                </div>

                <h2 className="text-5xl md:text-7xl font-serif leading-[1.1] tracking-tight">
                  Next-gen reviews, <br />
                  <span className="italic text-teal-500">for next-gen code.</span>
                </h2>

                <p className="text-xl text-muted-foreground font-medium italic leading-relaxed">
                  Powered by Open Source LLMs, PRGPT automates your code review process, providing line-by-line suggestions and comprehensive summaries directly in your GitHub pull requests.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid md:grid-cols-4 gap-8 py-12 border-y border-white/5">
                {[
                  { title: "PR Summarization", desc: "Release notes and changes summaries.", icon: MessageSquare },
                  { title: "Line-by-line", desc: "Detailed code change reviews.", icon: FileCode },
                  { title: "Continuous", desc: "Incremental reviews on each commit.", icon: GitBranch },
                  { title: "Bot Chat", desc: "Discuss changes in-thread.", icon: Brain },
                ].map((feat, i) => (
                  <div key={i} className="space-y-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto transition-all group-hover:border-teal-500/20 group-hover:bg-teal-500/5">
                      <feat.icon className="h-5 w-5 text-muted-foreground/60 group-hover:text-teal-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">{feat.title}</h4>
                      <p className="text-[10px] text-muted-foreground/60 italic font-medium">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Installation Terminal */}
              <div className="max-w-xl mx-auto">
                <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden text-left shadow-2xl">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">github-action.yml</span>
                  </div>
                  <div className="p-6 font-mono text-xs leading-relaxed">
                    <div className="flex gap-4">
                      <span className="text-muted-foreground/30 select-none">1</span>
                      <span><span className="text-teal-500">- name:</span> PRGPT - AI Reviewer</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground/30 select-none">2</span>
                      <span>&nbsp;&nbsp;<span className="text-teal-500">uses:</span> SUBHAZIT/PRGPT@CODE-RIVEW</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
                <a
                  href="https://github.com/marketplace/actions/prgpt-ai-based-pr-reviewer-summarizer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-14 px-10 rounded-full bg-teal-500 text-black font-black uppercase tracking-widest text-xs hover:bg-teal-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(20,184,166,0.2)] flex items-center"
                >
                  View on Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/5 bg-white/[0.02]">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">License</span>
                    <span className="text-xs font-bold text-foreground">MIT OPEN SOURCE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 h-px bg-white/5" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-serif mb-6 tracking-tight">Simple by design</h2>
            <p className="text-muted-foreground text-lg italic font-medium">Pick a repository, index it, and start chatting. That's it.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-0 relative border border-white/5 bg-white/[0.01]">
            {/* Background Glow */}
            <div className="absolute bg-glow w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 z-0" />

            {/* Grid background lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="grid-line-v left-1/3 opacity-10" />
              <div className="grid-line-v left-2/3 opacity-10" />
            </div>

            {[
              {
                id: 1,
                title: "Choose your codebase",
                desc: "Public or private repositories, monorepos, or small scripts. We handle them all.",
                icon: Github
              },
              {
                id: 2,
                title: "AI Analysis",
                desc: "Our engine maps dependencies, generates embeddings, and understands the 'why' behind your code.",
                icon: Brain
              },
              {
                id: 3,
                title: "Instant Insights",
                desc: "Ask anything. Get precise file references, line-by-line debugging, and security audits.",
                icon: MessageSquare
              },
              {
                id: 4,
                title: "Dependency Mapping",
                desc: "Deeply understand connections between different modules, functions, and files.",
                icon: GitBranch
              },
              {
                id: 5,
                title: "Visual Intelligence",
                desc: "Generate interactive architecture graphs and see how your system breathes.",
                icon: BarChart3
              },
              {
                id: 6,
                title: "Onboarding Docs",
                desc: "Create comprehensive guides for any sub-module or feature instantly.",
                icon: FileCode
              }
            ].map((step, i) => {
              const borderClasses = `
                ${i % 3 !== 2 ? 'md:border-r' : ''} 
                ${i < 3 ? 'md:border-b' : ''} 
                border-white/5
              `;

              return (
                <div key={i} className={`p-10 md:p-16 flex flex-col gap-8 group hover:bg-white/[0.03] transition-all relative z-10 ${borderClasses}`}>
                  <div className="space-y-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-teal-500 group-hover:border-teal-500/20 transition-all">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-serif italic tracking-tight text-white">{step.id}. {step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed italic font-medium">{step.desc}</p>
                    </div>
                  </div>
                  {/* Card Mockup Visual */}
                  <div className="mt-auto pt-8 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="h-32 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 overflow-hidden p-4">
                      <div className="w-full h-2 rounded-full bg-white/10 mb-3" />
                      <div className="w-2/3 h-2 rounded-full bg-white/10 mb-3" />
                      <div className="w-3/4 h-2 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative py-32 overflow-hidden border-b border-white/5">
        {/* Teal Glows */}
        <div className="teal-glow w-[500px] h-[500px] top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-15" />
        <div className="teal-glow w-[500px] h-[500px] bottom-0 right-0 translate-x-1/2 translate-y-1/2 opacity-15" />

        {/* Corner Frames */}
        <div className="corner-frame corner-frame-tl ml-8 mt-8 opacity-40" />
        <div className="corner-frame corner-frame-tr mr-8 mt-8 opacity-40" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-serif mb-6 tracking-tight">Everything you need to understand code</h2>
            <p className="text-muted-foreground text-lg italic font-medium max-w-2xl mx-auto">From onboarding to debugging to security — one tool that replaces hours of manual code reading.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group p-10 md:p-12 flex flex-col gap-6 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all cursor-default relative overflow-hidden"
              >
                {/* Subtle Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/60 group-hover:text-teal-500 group-hover:border-teal-500/20 transition-all">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-serif italic tracking-tight text-foreground">{f.title}</h3>
                    <p className="text-muted-foreground/60 text-sm leading-relaxed italic font-medium">{f.desc}</p>
                  </div>
                </div>

                {/* Card highlight border bottom */}
                <div className="absolute bottom-0 left-0 h-px w-0 bg-primary/40 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>

          <div className="mt-24 text-center">
            <Button size="lg" onClick={() => handleIndex()} className="h-14 px-10 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              Explore all features <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CLI Section — "Your codebase, from the terminal"      */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="cli" className="relative py-32 overflow-hidden border-b border-white/5">
        {/* Teal Glows */}
        <div className="teal-glow w-[600px] h-[600px] -top-1/4 -left-1/4 opacity-15" />
        <div className="teal-glow w-[500px] h-[500px] bottom-0 right-0 translate-x-1/4 translate-y-1/4 opacity-10" />

        {/* Corner Frames */}
        <div className="corner-frame corner-frame-tl ml-8 mt-8 opacity-40" />
        <div className="corner-frame corner-frame-tr mr-8 mt-8 opacity-40" />
        <div className="corner-frame corner-frame-bl ml-8 mb-8 opacity-40" />
        <div className="corner-frame corner-frame-br mr-8 mb-8 opacity-40" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-teal-500/20 bg-teal-500/5 backdrop-blur-xl mb-8">
              <Terminal className="h-4 w-4 text-teal-500" />
              <span className="text-[11px] font-black tracking-[0.3em] uppercase text-teal-500">Command Line Interface</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif mb-6 tracking-tight">
              Your codebase, <br />
              <span className="italic text-teal-500">from the terminal.</span>
            </h2>
            <p className="text-muted-foreground text-lg italic font-medium max-w-2xl mx-auto">
              Index repos, run security scans, generate architecture overviews — all without leaving your terminal.
            </p>
          </div>

          {/* Two Column Layout: Features | Terminal */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left — CLI Commands Grid */}
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { cmd: "init", desc: "Scaffold .env config for your project", icon: Package },
                  { cmd: "index <url>", desc: "Index any GitHub repository instantly", icon: Download },
                  { cmd: "overview", desc: "Generate AI-powered architecture overview", icon: Brain },
                  { cmd: "scan", desc: "Run deep security vulnerability scan", icon: Shield },
                  { cmd: "open", desc: "Launch the dashboard in your browser", icon: Play },
                  { cmd: "version", desc: "Check current CLI version info", icon: Layers },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-teal-500/20 transition-all relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/60 group-hover:text-teal-500 group-hover:border-teal-500/20 transition-all">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <code className="text-[11px] font-mono font-bold text-teal-500/80 group-hover:text-teal-400 transition-colors">codebasegpt {item.cmd}</code>
                        <p className="text-[10px] text-muted-foreground/60 italic font-medium mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-px w-0 bg-teal-500/40 group-hover:w-full transition-all duration-500" />
                  </motion.div>
                ))}
              </div>

              {/* Install Badge */}
              <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="flex flex-col text-left flex-grow">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Install globally</span>
                  <code className="text-sm font-mono font-bold text-foreground">npm install -g @codebasegpt/cli</code>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5">
                  <Package className="h-3 w-3 text-teal-500" />
                  <span className="text-[9px] font-black tracking-widest uppercase text-teal-500">NPM</span>
                </div>
              </div>
            </div>

            {/* Right — Terminal Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">terminal</span>
                </div>
                <div className="p-6 font-mono text-xs leading-[1.8] space-y-1">
                  <div className="flex gap-2">
                    <span className="text-teal-500 select-none">$</span>
                    <span className="text-foreground">codebasegpt index https://github.com/vercel/next.js</span>
                  </div>
                  <div className="text-muted-foreground/60">
                    <span className="text-amber-400">⠋</span> [Stage 1] Fetching repository metadata...
                  </div>
                  <div className="text-muted-foreground/60">
                    <span className="text-amber-400">⠙</span> [Stage 2] Building file tree...
                  </div>
                  <div className="text-muted-foreground/60">
                    <span className="text-amber-400">⠸</span> [Stage 3] Indexing 2,847 files...
                  </div>
                  <div className="text-emerald-400">
                    ✔ Successfully indexed vercel/next.js
                  </div>
                  <div className="text-blue-400">
                    Repo ID: gh-vercel-next-js
                  </div>
                  <div className="text-blue-400">
                    Total Files: 2,847
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex gap-2">
                      <span className="text-teal-500 select-none">$</span>
                      <span className="text-foreground">codebasegpt scan gh-vercel-next-js</span>
                    </div>
                  </div>
                  <div className="text-muted-foreground/60">
                    <span className="text-amber-400">⠋</span> Running security scan...
                  </div>
                  <div className="text-emerald-400">
                    ✔ Scan complete! Found 3 findings.
                  </div>
                  <div className="mt-2">
                    <span className="text-foreground">1. </span>
                    <span className="font-bold text-foreground">Hardcoded API Key</span>
                    <span className="text-amber-400"> [HIGH]</span>
                  </div>
                  <div className="text-muted-foreground/40 pl-3">
                    File: src/config/auth.ts:42
                  </div>
                  <div className="mt-2">
                    <div className="flex gap-2">
                      <span className="text-teal-500 select-none">$</span>
                      <span className="text-foreground/40 animate-pulse">▋</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SDK Section — "Build with CodebaseGPT"                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="sdk" className="relative py-32 overflow-hidden border-b border-white/5 bg-teal-500/[0.01]">
        {/* Teal Glows */}
        <div className="teal-glow w-[700px] h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
        <div className="teal-glow w-[400px] h-[400px] -bottom-1/4 -left-1/4 opacity-10" />

        {/* Corner Frames */}
        <div className="corner-frame corner-frame-tl ml-8 mt-8 opacity-40" />
        <div className="corner-frame corner-frame-tr mr-8 mt-8 opacity-40" />

        {/* Grid Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="grid-line-v left-1/4" />
          <div className="grid-line-v left-3/4" />
          <div className="grid-line-h top-1/3" />
          <div className="grid-line-h top-2/3" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-teal-500/20 bg-teal-500/5 backdrop-blur-xl mb-8">
              <Boxes className="h-4 w-4 text-teal-500" />
              <span className="text-[11px] font-black tracking-[0.3em] uppercase text-teal-500">TypeScript SDK</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif mb-6 tracking-tight">
              Build with <br />
              <span className="italic text-teal-500">CodebaseGPT.</span>
            </h2>
            <p className="text-muted-foreground text-lg italic font-medium max-w-2xl mx-auto">
              Integrate AI-powered code intelligence into your own tools, dashboards, and workflows with our fully typed SDK.
            </p>
          </div>

          {/* Two Column Layout: Code | Features */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left — Code Preview Terminal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">example.ts</span>
                </div>
                <div className="p-6 font-mono text-xs leading-[1.9]">
                  {[
                    { num: "1", content: <><span className="text-purple-400">import</span> {"{ "}<span className="text-teal-400">CodebaseGPTClient</span>{" }"} <span className="text-purple-400">from</span> <span className="text-amber-300">'@codebasegpt/sdk'</span></> },
                    { num: "2", content: "" },
                    { num: "3", content: <><span className="text-purple-400">const</span> <span className="text-blue-300">client</span> = <span className="text-purple-400">new</span> <span className="text-teal-400">CodebaseGPTClient</span>({"{"}...</> },
                    { num: "4", content: "" },
                    { num: "5", content: <><span className="text-muted-foreground/40">{'// Index a repository'}</span></> },
                    { num: "6", content: <><span className="text-purple-400">const</span> <span className="text-blue-300">repo</span> = <span className="text-purple-400">await</span> <span className="text-blue-300">client</span>.<span className="text-yellow-300">indexRepository</span>(</> },
                    { num: "7", content: <>&nbsp;&nbsp;<span className="text-amber-300">'https://github.com/vercel/next.js'</span></> },
                    { num: "8", content: ")" },
                    { num: "9", content: "" },
                    { num: "10", content: <><span className="text-muted-foreground/40">{'// Get AI overview'}</span></> },
                    { num: "11", content: <><span className="text-purple-400">const</span> <span className="text-blue-300">overview</span> = <span className="text-purple-400">await</span> <span className="text-blue-300">client</span>.<span className="text-yellow-300">generateOverview</span>(</> },
                    { num: "12", content: <>&nbsp;&nbsp;<span className="text-blue-300">repo</span>.<span className="text-foreground">repoContext</span></> },
                    { num: "13", content: ")" },
                    { num: "14", content: "" },
                    { num: "15", content: <><span className="text-muted-foreground/40">{'// Stream AI chat'}</span></> },
                    { num: "16", content: <><span className="text-purple-400">await</span> <span className="text-blue-300">client</span>.<span className="text-yellow-300">streamChat</span>({"{"}...</> },
                  ].map((line) => (
                    <div key={line.num} className="flex gap-4">
                      <span className="text-muted-foreground/20 select-none w-5 text-right">{line.num}</span>
                      <span>{line.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right — SDK Methods Grid */}
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { method: "indexRepository()", desc: "Index any GitHub repo for AI analysis", icon: Download },
                  { method: "generateOverview()", desc: "AI-powered architecture overview", icon: Brain },
                  { method: "generateSecurityScan()", desc: "Deep security vulnerability analysis", icon: Shield },
                  { method: "generateSystemDesign()", desc: "Auto system design documentation", icon: BarChart3 },
                  { method: "fetchIssues()", desc: "Pull GitHub issues with full metadata", icon: Bug },
                  { method: "fetchFileContent()", desc: "Retrieve any file from indexed repo", icon: FileCode },
                  { method: "generateOnboardingDoc()", desc: "Auto-generate developer onboarding", icon: Cpu },
                  { method: "streamChat()", desc: "Real-time AI chat with SSE streaming", icon: MessageSquare },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-teal-500/20 transition-all relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/60 group-hover:text-teal-500 group-hover:border-teal-500/20 transition-all">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <code className="text-[11px] font-mono font-bold text-teal-500/80 group-hover:text-teal-400 transition-colors">{item.method}</code>
                        <p className="text-[10px] text-muted-foreground/60 italic font-medium mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-px w-0 bg-teal-500/40 group-hover:w-full transition-all duration-500" />
                  </motion.div>
                ))}
              </div>

              {/* Install + Type Safety Badge */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] flex-grow">
                  <div className="flex flex-col text-left flex-grow">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Install</span>
                    <code className="text-sm font-mono font-bold text-foreground">npm install @codebasegpt/sdk</code>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5">
                    <Package className="h-3 w-3 text-teal-500" />
                    <span className="text-[9px] font-black tracking-widest uppercase text-teal-500">NPM</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Type Safety</span>
                    <span className="text-xs font-bold text-foreground">100% TYPED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Bottom CTA Section */}
      <section className="py-48 relative overflow-hidden border-t border-white/5 bg-teal-500/[0.02]">
        {/* Teal Glow */}
        <div className="teal-glow w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25" />

        {/* Corner Frames */}
        <div className="corner-frame corner-frame-tl ml-8 mt-8 opacity-40" />
        <div className="corner-frame corner-frame-tr mr-8 mt-8 opacity-40" />
        <div className="corner-frame corner-frame-bl ml-8 mb-8 opacity-40" />
        <div className="corner-frame corner-frame-br mr-8 mb-8 opacity-40" />

        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="grid-line-v left-1/2 -translate-x-1/2" />
          <div className="grid-line-h top-1/2 -translate-y-1/2" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-7xl font-serif italic tracking-tight">Ready to master <br /> your codebase?</h2>
            <p className="text-muted-foreground text-lg italic font-medium max-w-lg mx-auto">Join 10,000+ developers using AI to decode complex software systems.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => handleIndex()} className="h-14 px-10 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all shadow-2xl">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate("/our-philosophy")}
                className="h-14 px-10 rounded-full border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5"
              >
                Our Philosophy
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-sm font-bold text-foreground">CODEBASEGPT</span>
              </div>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-xs uppercase tracking-wider">
                AI-powered codebase intelligence. Understand, debug, and secure any repository in minutes.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-[10px] font-black text-foreground mb-4 uppercase tracking-[0.2em]">Product</p>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Features</Link></li>
                <li><Link to="/how-it-works" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">How it works</Link></li>
                <li><Link to="/cli" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">CLI Tool</Link></li>
                <li><Link to="/sdk" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">SDK</Link></li>
                <li><Link to="/faq" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">FAQ</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="text-[10px] font-black text-foreground mb-4 uppercase tracking-[0.2em]">Resources</p>
              <ul className="space-y-3">
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">GitHub</a></li>
                <li><Link to="/docs" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Documentation</Link></li>
                <li><Link to="/changelog" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Changelog</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-[10px] font-black text-foreground mb-4 uppercase tracking-[0.2em]">Legal</p>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Terms of Service</Link></li>
                <li><Link to="/contact" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground">
              A PRODUCT OF CODEBASEGPT
            </p>
            <p className="text-[11px] text-muted-foreground">
              BUILT WITH ❤ FOR <span className="text-foreground">DEVELOPERS</span>
            </p>
          </div>
        </div>
      </footer>
      <div className="w-full bg-background border-t border-white/5 py-4 px-6 flex justify-center">
        <span className="text-[11px] font-medium text-muted-foreground tracking-wider">
          © COPYRIGHT 2026 <span className="text-teal-500">CODEBASEGPT</span>
        </span>
      </div>
    </div>
  );

  return (
    <>
      {content}
      <LoginWall open={showLoginWall} onOpenChange={setShowLoginWall} />
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  );
};

export default Landing;
