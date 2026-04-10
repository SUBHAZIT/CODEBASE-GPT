import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Code2, MessageSquare, CircleDot, Clock,
  ExternalLink, Loader2, AlertCircle, Sparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRepoStore } from "@/lib/store";
import { DEMO_REPOS } from "@/lib/mock-data";
import { fetchIssues, type GitHubIssue } from "@/lib/api";
import { useCompactMode } from "@/hooks/use-compact-mode";
import { streamChat } from "@/lib/api";

const RepoIssues = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const compact = useCompactMode();
  const { meta: storeMeta, repoContext, githubToken } = useRepoStore();
  const repo = storeMeta || DEMO_REPOS.find((r) => r.id === repoId) || DEMO_REPOS[0];

  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "closed">("open");

  // AI solving
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadIssues();
  }, [filter]);

  async function loadIssues() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchIssues(repo.owner, repo.name, filter, githubToken || undefined);
      setIssues(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  }

  async function solveIssue(issue: GitHubIssue) {
    setSelectedIssue(issue);
    setAiResponse("");
    setAiLoading(true);

    const prompt = `I need help solving this GitHub issue:

**Issue #${issue.number}: ${issue.title}**
Labels: ${issue.labels.map((l) => l.name).join(", ") || "none"}

${issue.body}

---

Based on the codebase context, provide:
1. A clear explanation of the root cause
2. The specific files that need to be changed
3. The exact code changes needed (with before/after snippets)
4. Any edge cases to watch out for

Be precise and reference actual files from the codebase.`;

    await streamChat({
      messages: [{ role: "user", content: prompt }],
      repoContext,
      onDelta: (text) => setAiResponse((prev) => prev + text),
      onDone: () => setAiLoading(false),
      onError: (err) => {
        setAiResponse(`Error: ${err}`);
        setAiLoading(false);
      },
    });
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    return "just now";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-11 px-6">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/repo/${repoId}`)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <Code2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">
              {repo.owner}/<span className="text-foreground font-medium">{repo.name}</span>
              <span className="text-muted-foreground ml-1">/ issues</span>
            </span>
          </div>
          <Button onClick={() => navigate(`/repo/${repoId}/chat`)} size="sm" className="h-7 px-3 text-[11px]">
            <MessageSquare className="h-3 w-3 mr-1" /> Chat
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-4">
          {(["open", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${filter === s
                  ? "bg-card border border-border text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <CircleDot className={`h-3 w-3 inline mr-1.5 ${s === "open" ? "text-green-500" : "text-muted-foreground"}`} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-xs text-muted-foreground">Fetching issues...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded border border-destructive/30 bg-destructive/5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Issues list */}
        {!loading && !error && (
          <div className="rounded border border-border bg-card divide-y divide-border">
            {issues.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No {filter} issues found.
              </div>
            ) : (
              issues.map((issue) => (
                <motion.div
                  key={issue.number}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <CircleDot className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${issue.state === "open" ? "text-green-500" : "text-muted-foreground"
                      }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <button
                            onClick={() => setSelectedIssue(selectedIssue?.number === issue.number ? null : issue)}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left"
                          >
                            {issue.title}
                          </button>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] text-muted-foreground">
                              #{issue.number}
                            </span>
                            {issue.labels.map((label) => (
                              <span
                                key={label.name}
                                className="text-[10px] px-1.5 py-0.5 rounded-full border border-border"
                                style={{
                                  backgroundColor: `#${label.color}20`,
                                  color: `#${label.color}`,
                                  borderColor: `#${label.color}40`,
                                }}
                              >
                                {label.name}
                              </span>
                            ))}
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {timeAgo(issue.updated_at)}
                            </span>
                            {issue.comments > 0 && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <MessageSquare className="h-2.5 w-2.5" /> {issue.comments}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px]"
                            onClick={() => solveIssue(issue)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" /> Solve
                          </Button>
                          <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* Expanded body */}
                      <AnimatePresence>
                        {selectedIssue?.number === issue.number && !aiResponse && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 p-3 rounded bg-muted/50 text-xs text-secondary-foreground leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                              {issue.body || "No description provided."}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* AI Solution Panel */}
      <AnimatePresence>
        {(aiResponse || aiLoading) && selectedIssue && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background shadow-lg"
            style={{ maxHeight: "50vh" }}
          >
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    Solution for #{selectedIssue.number}
                  </span>
                  {aiLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() =>
                      navigate(`/repo/${repoId}/chat`, {
                        state: { initialQuestion: `Help me solve issue #${selectedIssue.number}: ${selectedIssue.title}\n\n${selectedIssue.body}` },
                      })
                    }
                  >
                    Continue in Chat
                  </Button>
                  <button
                    onClick={() => { setAiResponse(""); setSelectedIssue(null); }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="py-3 overflow-y-auto text-xs text-secondary-foreground leading-relaxed whitespace-pre-wrap font-mono" style={{ maxHeight: "calc(50vh - 40px)" }}>
                {aiResponse || "Analyzing issue..."}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RepoIssues;