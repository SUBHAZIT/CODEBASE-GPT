import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Code2, MessageSquare, CircleDot, Clock,
  ExternalLink, Loader2, AlertCircle, Sparkles, X, FileDiff, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRepoStore } from "@/lib/store";
import { DEMO_REPOS } from "@/lib/mock-data";
import { fetchPullRequests, fetchPullRequestDiff, type GitHubPullRequest, streamChat } from "@/lib/api";
import { useCompactMode } from "@/hooks/use-compact-mode";

const RepoPRs = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const compact = useCompactMode();
  const { meta: storeMeta, repoContext, githubToken } = useRepoStore();
  const repo = storeMeta || DEMO_REPOS.find((r) => r.id === repoId) || DEMO_REPOS[0];

  const [pulls, setPulls] = useState<GitHubPullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "closed" | "all">("open");

  // AI solving/reviewing
  const [selectedPR, setSelectedPR] = useState<GitHubPullRequest | null>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadPullRequests();
  }, [filter]);

  async function loadPullRequests() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPullRequests(repo.owner, repo.name, filter, githubToken || undefined);
      setPulls(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch pull requests");
    } finally {
      setLoading(false);
    }
  }

  async function reviewPR(pr: GitHubPullRequest) {
    setSelectedPR(pr);
    setAiResponse("");
    setAiLoading(true);

    try {
      const diffText = await fetchPullRequestDiff(repo.owner, repo.name, pr.number, githubToken || undefined);
      
      const prompt = `I need you to act as an expert AI code reviewer. Please review this Pull Request based on its code diff.

**PR #${pr.number}: ${pr.title}**
Description: ${pr.body}

Diff:
\`\`\`diff
${diffText.slice(0, 15000)} /* Truncating diff if too large */
\`\`\`

---

Based on the codebase context and this PR diff, provide:
1. A concise overview of what this PR does.
2. A list of any potential bugs, edge cases, or issues.
3. Suggestions for improvements.
4. An overall summary of whether the code looks good to merge.

Be precise, encouraging, and reference actual code from the diff.`;

      await streamChat({
        messages: [{ role: "user", content: prompt }],
        repoContext,
        onDelta: (text: string) => setAiResponse((prev) => prev + text),
        onDone: () => setAiLoading(false),
        onError: (err: string) => {
          setAiResponse((prev) => prev + `\n\nError: ${err}`);
          setAiLoading(false);
        },
      });
    } catch (e) {
      setAiResponse(e instanceof Error ? e.message : "Failed to fetch PR diff for review.");
      setAiLoading(false);
    }
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
              <span className="text-muted-foreground ml-1">/ pull requests</span>
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
          {(["open", "closed", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${filter === s
                  ? "bg-card border border-border text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {s === "open" && <CircleDot className="h-3 w-3 inline mr-1.5 text-green-500" />}
              {s === "closed" && <CheckCircle2 className="h-3 w-3 inline mr-1.5 text-purple-500" />}
              {s === "all" && <FileDiff className="h-3 w-3 inline mr-1.5 text-muted-foreground" />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-xs text-muted-foreground">Fetching pull requests...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">Unable to Load Pull Requests</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{error}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => loadPullRequests()} className="h-7 px-3 text-[11px]">
                    <Loader2 className={`h-3 w-3 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pulls list */}
        {!loading && !error && (
          <div className="rounded border border-border bg-card divide-y divide-border">
            {pulls.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No {filter} pull requests found.
              </div>
            ) : (
              pulls.map((pr) => (
                <motion.div
                  key={pr.number}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {pr.merged_at ? (
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-purple-500" />
                    ) : pr.draft ? (
                      <FileDiff className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <CircleDot className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${pr.state === "open" ? "text-green-500" : "text-muted-foreground"}`} />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <button
                            onClick={() => setSelectedPR(selectedPR?.number === pr.number ? null : pr)}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left"
                          >
                            {pr.title}
                          </button>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] text-muted-foreground">
                              #{pr.number}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              by {pr.user.login}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {timeAgo(pr.updated_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] text-teal-500 hover:text-teal-400 hover:bg-teal-500/10"
                            onClick={() => reviewPR(pr)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" /> PRGPT Review
                          </Button>
                          <a
                            href={pr.html_url}
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
                        {selectedPR?.number === pr.number && !aiResponse && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 p-3 rounded bg-muted/50 text-xs text-secondary-foreground leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                              {pr.body || "No description provided."}
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

      {/* AI Review Panel */}
      <AnimatePresence>
        {(aiResponse || aiLoading) && selectedPR && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-teal-500/20 bg-background shadow-lg"
            style={{ maxHeight: "50vh" }}
          >
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-teal-500/10">
                    <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    PRGPT Review for #{selectedPR.number}
                  </span>
                  {aiLoading && <Loader2 className="h-3 w-3 animate-spin text-teal-500 ml-2" />}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() =>
                      navigate(`/repo/${repoId}/chat`, {
                        state: { initialQuestion: `Help me understand PR #${selectedPR.number}: ${selectedPR.title}\n\n${selectedPR.body}` },
                      })
                    }
                  >
                    Continue in Chat
                  </Button>
                  <button
                    onClick={() => { setAiResponse(""); setSelectedPR(null); }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="py-3 overflow-y-auto text-xs text-secondary-foreground leading-relaxed whitespace-pre-wrap font-mono" style={{ maxHeight: "calc(50vh - 40px)" }}>
                {aiResponse || "Analyzing PR diff..."}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RepoPRs;
