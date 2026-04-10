import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Code2, MessageSquare, Clock,
  ExternalLink, Loader2, AlertCircle, Sparkles, X, GitCommit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRepoStore } from "@/lib/store";
import { DEMO_REPOS } from "@/lib/mock-data";
import { fetchCommits, type GitHubCommit, streamChat } from "@/lib/api";
import { useCompactMode } from "@/hooks/use-compact-mode";

const RepoCommits = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const compact = useCompactMode();
  const { meta: storeMeta, repoContext, githubToken } = useRepoStore();
  const repo = storeMeta || DEMO_REPOS.find((r) => r.id === repoId) || DEMO_REPOS[0];

  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI solving/reviewing
  const [selectedCommit, setSelectedCommit] = useState<GitHubCommit | null>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadCommits();
  }, []);

  async function loadCommits() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCommits(repo.owner, repo.name, githubToken || undefined);
      setCommits(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch commits");
    } finally {
      setLoading(false);
    }
  }

  async function explainCommit(commit: GitHubCommit) {
    setSelectedCommit(commit);
    setAiResponse("");
    setAiLoading(true);

    try {
      const prompt = `Please explain the significance and context of this commit, relative to the general architecture of the application.

**Commit SHA:** ${commit.sha}
**Message:** ${commit.commit.message}

Based on the message and your repo context, what is likely happening here? What impact does it have on the full codebase? Provide a short technical explanation.`;

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
      setAiResponse(e instanceof Error ? e.message : "Failed to explain commit.");
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
              <span className="text-muted-foreground ml-1">/ commits</span>
            </span>
          </div>
          <Button onClick={() => navigate(`/repo/${repoId}/chat`)} size="sm" className="h-7 px-3 text-[11px]">
            <MessageSquare className="h-3 w-3 mr-1" /> Chat
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-4 px-2">
          <GitCommit className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Recent Commits</h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-xs text-muted-foreground">Fetching commit history...</span>
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
                <h3 className="text-sm font-semibold text-foreground mb-1">Unable to Load Commits</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{error}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => loadCommits()} className="h-7 px-3 text-[11px]">
                    <Loader2 className={`h-3 w-3 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Commits list */}
        {!loading && !error && (
          <div className="rounded border border-border bg-card divide-y divide-border">
            {commits.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No commits found.
              </div>
            ) : (
              commits.map((c) => (
                <motion.div
                  key={c.sha}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <GitCommit className={`h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {c.commit.message.split('\n')[0]}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 py-0.5 rounded">
                              {c.sha.slice(0, 7)}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              by {c.author?.login || c.commit.author.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {timeAgo(c.commit.author.date)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px]"
                            onClick={() => explainCommit(c)}
                          >
                            <Sparkles className="h-3 w-3 mr-1 text-primary" /> Explain
                          </Button>
                          <a
                            href={c.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
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
        {(aiResponse || aiLoading) && selectedCommit && (
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
                    Commit Outline: {selectedCommit.sha.slice(0, 7)}
                  </span>
                  {aiLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-2" />}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() =>
                      navigate(`/repo/${repoId}/chat`, {
                        state: { initialQuestion: `Help me understand this commit ${selectedCommit.sha.slice(0, 7)}: ${selectedCommit.commit.message}` },
                      })
                    }
                  >
                    Continue in Chat
                  </Button>
                  <button
                    onClick={() => { setAiResponse(""); setSelectedCommit(null); }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="py-3 overflow-y-auto text-xs text-secondary-foreground leading-relaxed whitespace-pre-wrap font-mono" style={{ maxHeight: "calc(50vh - 40px)" }}>
                {aiResponse || "Analyzing commit message and context..."}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RepoCommits;
