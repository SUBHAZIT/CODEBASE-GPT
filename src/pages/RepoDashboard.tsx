import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare, FileCode, ChevronLeft, Code2,
  Layers, Package, AlertTriangle, BookOpen, Network, Shield, LayoutDashboard, CircleDot,
  Sparkles, FolderOpen, Settings, ArrowUpRight, LogIn, Info, Database, GitBranch,
  User, Terminal, Loader2, GitCommit, FileDiff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_REPOS, DEMO_FILE_TREE } from "@/lib/mock-data";
import { useRepoStore } from "@/lib/store";
import DependencyGraph from "@/components/dashboard/DependencyGraph";
import CodebaseSearch from "@/components/dashboard/CodebaseSearch";
import { useCompactMode } from "@/hooks/use-compact-mode";
import { useState, useEffect, useRef } from "react";
import { openInStackBlitz } from "@/lib/webcontainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useUserAuth } from "@/hooks/use-user-auth";
import { LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { indexRepository, generateOverview } from "@/lib/api";

const QUESTION_ICONS = [LogIn, Info, Database, GitBranch];

/** Parse owner and repo name from a repoId like "gh-owner-repo-timestamp" */
function parseRepoId(repoId: string): { owner: string; repo: string } | null {
  if (!repoId.startsWith("gh-")) return null;
  const parts = repoId.slice(3).split("-");
  // Format: gh-{owner}-{repo}-{timestamp} — timestamp is last segment
  if (parts.length < 3) return null;
  const owner = parts[0];
  // Repo name may contain hyphens, so join everything between owner and last segment (timestamp)
  const repo = parts.slice(1, -1).join("-");
  return owner && repo ? { owner, repo } : null;
}

const RepoDashboard = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const compact = useCompactMode();
  const { user, logout } = useUserAuth();
  const { meta: storeMeta, overview: storeOverview, fileTree: storeFileTree, fileContents: storeFileContents, indexMode: storeIndexMode, totalSourceFiles: storeTotalSourceFiles, unfetchedFiles: storeUnfetchedFiles, setRepoData, setOverview } = useRepoStore();
  const [graphExpanded, setGraphExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading repository data...");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const fetchAttempted = useRef(false);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const overviewAttempted = useRef(false);

  // Auto-fetch repo data when store is empty (e.g. direct navigation via CLI)
  useEffect(() => {
    if (storeMeta || !repoId || fetchAttempted.current) return;

    // Try localStorage cache first (keyed by repoId)
    const cached = localStorage.getItem(`repo_data_${repoId}`);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setRepoData(data);
        if (data.overview) setOverview(data.overview);
        return;
      } catch { /* ignore bad cache */ }
    }

    // Parse owner/repo from the repoId
    const parsed = parseRepoId(repoId);
    if (!parsed) return;

    fetchAttempted.current = true;
    setLoading(true);
    setFetchError(null);
    setLoadingMessage(`Fetching ${parsed.owner}/${parsed.repo} from GitHub...`);

    const githubUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
    const token = localStorage.getItem("github_pat") || undefined;

    indexRepository(githubUrl, token, (stage, message) => {
      setLoadingMessage(message);
    })
      .then(async (data) => {
        const repoData = {
          repoId: data.repoId,
          meta: data.meta,
          fileTree: data.fileTree,
          fileContents: data.fileContents,
          repoContext: data.repoContext,
          indexMode: data.indexMode || "full",
          totalSourceFiles: data.totalSourceFiles || data.totalFiles,
          unfetchedFiles: data.unfetchedFiles || [],
        };
        setRepoData(repoData as any);

        // Cache for future visits
        localStorage.setItem(`repo_data_${repoId}`, JSON.stringify(repoData));

        setLoadingMessage("Generating AI overview...");
        setOverviewLoading(true);
        try {
          const overview = await generateOverview(data.repoContext);
          setOverview(overview as any);
          // Persist overview to cache
          localStorage.setItem(`repo_data_${repoId}`, JSON.stringify({ ...repoData, overview }));
        } catch (e) {
          console.error("Overview generation failed:", e);
          setOverviewError(e instanceof Error ? e.message : "Failed to generate overview");
        } finally {
          setOverviewLoading(false);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Auto-fetch failed:", err);
        setFetchError(err.message || "Failed to load repository");
        setLoading(false);
      });
  }, [repoId, storeMeta, setRepoData, setOverview, retryCount]);

  // Auto-generate overview when store has repo data but no overview
  const { repoContext: storeRepoContext } = useRepoStore();
  useEffect(() => {
    if (storeOverview || !storeMeta || !storeRepoContext || overviewAttempted.current || overviewLoading) return;
    overviewAttempted.current = true;
    setOverviewLoading(true);
    setOverviewError(null);

    generateOverview(storeRepoContext)
      .then((overview) => {
        setOverview(overview as any);
        // Persist to cache
        if (repoId) {
          try {
            const cached = localStorage.getItem(`repo_data_${repoId}`);
            if (cached) {
              const data = JSON.parse(cached);
              data.overview = overview;
              localStorage.setItem(`repo_data_${repoId}`, JSON.stringify(data));
            }
          } catch { /* ignore */ }
        }
      })
      .catch((e) => {
        console.error("Overview generation failed:", e);
        setOverviewError(e instanceof Error ? e.message : "Failed to generate overview");
      })
      .finally(() => setOverviewLoading(false));
  }, [storeOverview, storeMeta, storeRepoContext, repoId, setOverview, overviewLoading]);

  // Retry overview generation
  const handleRetryOverview = () => {
    overviewAttempted.current = false;
    setOverviewError(null);
    setOverviewLoading(false);
    // Trigger re-run by resetting
    setOverview(null as any);
  };

  // Show loading screen while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-xs text-muted-foreground mt-4">
            ← Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  // Show error screen if fetch failed
  if (fetchError && !storeMeta) {
    const parsed = repoId ? parseRepoId(repoId) : null;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md w-full mx-6 flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">Failed to Load Repository</h2>
            {parsed && (
              <p className="text-sm text-muted-foreground mb-1 font-mono">{parsed.owner}/{parsed.repo}</p>
            )}
            <p className="text-sm text-destructive/80">{fetchError}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchAttempted.current = false;
                setFetchError(null);
                setRetryCount((c) => c + 1);
              }}
              className="h-9 px-4 text-xs"
            >
              Retry
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/")}
              className="h-9 px-4 text-xs"
            >
              Back to Home
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center max-w-xs mt-2">
            Tip: If the repo is private, set a GitHub Personal Access Token in your browser's localStorage as <code className="text-primary">github_pat</code>.
          </p>
        </motion.div>
      </div>
    );
  }

  const repo = storeMeta || DEMO_REPOS.find((r) => r.id === repoId) || DEMO_REPOS[0];
  const overview = storeOverview;
  const fileTree = storeFileTree.length > 0 ? storeFileTree : DEMO_FILE_TREE;

  const navItems = [
    { label: "Issues", icon: CircleDot, path: `/repo/${repoId}/issues` },
    { label: "Pull Requests", icon: FileDiff, path: `/repo/${repoId}/prs` },
    { label: "Commits", icon: GitCommit, path: `/repo/${repoId}/commits` },
    { label: "Onboarding", icon: BookOpen, path: `/repo/${repoId}/onboarding` },
    { label: "Security", icon: Shield, path: `/repo/${repoId}/security` },
    { label: "System Design", icon: LayoutDashboard, path: `/repo/${repoId}/system-design` },
  ];

  const fileDescriptions: Record<string, string> = {
    0: "Core logic",
    1: "Configuration",
    2: "Build setup",
    3: "Entry point",
    4: "Routing",
  };

  const fileIcons = [FolderOpen, Settings, Settings, Code2, GitBranch];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-12 px-6">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Code2 className="h-4 w-4" />
              <span>CodebaseGPT</span>
            </button>
            {!compact && (
              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Button key={item.label} variant="ghost" size="sm" onClick={() => navigate(item.path)}
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground">
                    {item.label}
                  </Button>
                ))}
                <Button onClick={() => navigate(`/repo/${repoId}/chat`)} variant="ghost" size="sm"
                  className="h-8 px-3 text-xs text-primary hover:text-primary">
                  Chat
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!compact && <CodebaseSearch repoId={repoId || repo.id} />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border p-0 overflow-hidden hover:bg-accent/50">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-[10px] font-bold">{user.user_metadata?.user_name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-semibold text-xs py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground">{user.user_metadata?.user_name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="text-xs py-3 px-4 cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="text-xs py-3 px-4 cursor-pointer">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-xs py-3 px-4 text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate("/profile")}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Repo breadcrumb */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{repo.owner}</span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-foreground font-semibold">{repo.name}</span>
              <button onClick={() => navigate("/settings")} className="text-muted-foreground hover:text-foreground transition-colors ml-1">
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => openInStackBlitz(repo.name, storeFileContents)}
              className="h-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span className="text-xs">OPEN IN IDE</span>
            </Button>
          </div>

          {/* Stats pills */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {[
              { label: (overview?.framework || repo.framework || "Detected").toUpperCase(), icon: Layers, variant: "primary" },
              { label: `${repo.fileCount.toLocaleString()} FILES`, icon: FileCode, variant: "default" },
              { label: `${(overview?.complexity || "Medium").toUpperCase()} COMPLEXITY`, icon: AlertTriangle, variant: (overview?.complexity === "High" || overview?.complexity === "Enterprise") ? "warning" : "default" },
              { label: repo.language.toUpperCase(), icon: Code2, variant: "default" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium tracking-wide ${stat.variant === "primary"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : stat.variant === "warning"
                    ? "border-warning/30 bg-warning/10 text-warning"
                    : "border-border bg-card text-foreground"
                  }`}
              >
                <stat.icon className="h-3.5 w-3.5" />
                {stat.label}
              </div>
            ))}
          </div>

          {/* On-Demand Mode Banner */}
          {storeIndexMode === "on-demand" && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <span className="text-base">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-2">
                    ON-DEMAND MODE
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    This is a large repository with <span className="text-foreground font-semibold">{(storeTotalSourceFiles || 0).toLocaleString()} source files</span>.
                    Only skeleton files were indexed upfront — <span className="text-foreground font-semibold">{(storeUnfetchedFiles?.length || 0).toLocaleString()} files</span> are
                    available on-demand when you browse or ask the AI.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Architecture + Key Files row */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-4 mb-4">
            {/* Architecture Narrative card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Architecture Narrative</h2>
              </div>
              {overviewLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                  <div className="h-3 bg-muted rounded w-4/6" />
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Generating AI overview…
                  </p>
                </div>
              ) : overviewError ? (
                <div className="space-y-2">
                  <p className="text-xs text-destructive">{overviewError}</p>
                  <Button variant="outline" size="sm" onClick={handleRetryOverview} className="h-7 text-xs">
                    Retry
                  </Button>
                </div>
              ) : overview ? (
                <p className="text-sm leading-relaxed text-secondary-foreground">{overview.narrative}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No overview available yet.</p>
              )}
            </div>

            {/* Key Files card */}
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileCode className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Key Files</h2>
              </div>
              <div className="space-y-0.5">
                {overviewLoading ? (
                  <div className="space-y-2 animate-pulse">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-2">
                        <div className="h-3.5 w-3.5 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-24" />
                      </div>
                    ))}
                  </div>
                ) : overview ? (
                  overview.keyFiles.slice(0, 5).map((file, i) => {
                    const Icon = fileIcons[i] || FileCode;
                    return (
                      <button
                        key={i}
                        className="flex items-center justify-between w-full px-2 py-2 rounded hover:bg-accent/30 transition-colors group"
                        onClick={() => navigate(`/repo/${repoId}/chat`, { state: { initialQuestion: `Explain the file: ${file}` } })}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-mono text-foreground">{file.split("/").pop()}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{fileDescriptions[i] || "Source"}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic px-2">No key files detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* PRGPT Integration Row */}
          <div className="grid lg:grid-cols-1 gap-4 mb-4">
            <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.02] p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-24 w-24 text-teal-500" />
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                    <img src="/prgpt_logo.png" alt="PRGPT" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      PRGPT - AI PR REVIEWER
                      <span className="px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 text-[8px] text-teal-500 font-black uppercase tracking-tighter">UNDER DEVELOPMENT</span>
                    </h3>
                    <p className="text-xs text-muted-foreground italic">Automated reviews, summarization, and interactive PR chat.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://github.com/marketplace/actions/prgpt-ai-based-pr-reviewer-summarizer', '_blank')}
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-wider border-teal-500/30 text-teal-500 hover:bg-teal-500/10 hidden md:flex"
                  >
                    Setup Github Action
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/repo/${repoId}/prs`)}
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-wider bg-teal-500 text-black hover:bg-teal-400"
                  >
                    Open PR Dashboard <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Dependency Graph + Dependencies row */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-4 mb-8">
            {/* Dependency Graph card */}
            {!compact && (
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Dependency Graph</h2>
                  </div>
                  <button
                    onClick={() => setGraphExpanded(!graphExpanded)}
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    {graphExpanded ? "Collapse" : "Expand"}
                  </button>
                </div>
                <div style={{ height: graphExpanded ? 560 : 340 }} className="transition-all duration-500 ease-in-out">
                  <DependencyGraph
                    fileTree={fileTree}
                    expanded={graphExpanded}
                    onShowDetails={(path) => {
                      navigate(`/repo/${repoId}/chat`, { state: { initialQuestion: `Show me the details of: ${path} — what does it do, what are its exports, and how is it used?` } });
                    }}
                    onExplain={(path) => {
                      navigate(`/repo/${repoId}/chat`, { state: { initialQuestion: `Explain the file: ${path}` } });
                    }}
                  />
                </div>
              </div>
            )}

            {/* Dependencies card */}
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Dependencies</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {overviewLoading ? (
                  <div className="flex flex-wrap gap-2 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-7 bg-muted rounded-md w-20 border border-border" />
                    ))}
                  </div>
                ) : overview?.mainDeps ? (
                  overview.mainDeps.map((dep) => (
                    <span
                      key={dep}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-muted text-secondary-foreground border border-border"
                    >
                      {dep}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No dependencies detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* Suggested Questions */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Suggested Questions</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {overviewLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border bg-card animate-pulse">
                    <div className="h-4 w-4 bg-muted rounded mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                ))
              ) : overview?.suggestedQs ? (
                overview.suggestedQs.slice(0, 4).map((q, i) => {
                  const Icon = QUESTION_ICONS[i % QUESTION_ICONS.length];
                  return (
                    <button
                      key={i}
                      onClick={() => navigate(`/repo/${repoId}/chat`, { state: { initialQuestion: q } })}
                      className="group text-left p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground mb-3" />
                      <p className="text-xs text-secondary-foreground group-hover:text-foreground transition-colors leading-relaxed">
                        {q}
                      </p>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground italic col-span-4">No suggested questions available.</p>
              )}
            </div>
          </section>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-6">
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
          Powered by CodebaseGPT • Indexing Complete
        </p>
      </footer>
    </div>
  );
};

export default RepoDashboard;