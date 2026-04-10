import { useState, useEffect } from "react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, GitBranch, Lock, Globe, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  updated_at: string;
  stargazers_count: number;
  language: string | null;
}

interface UserReposProps {
  onIndex: (repoUrl: string) => void;
}

export function UserRepos({ onIndex }: UserReposProps) {
  const { fetchUserRepos, user } = useUserAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadRepos = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const data = await fetchUserRepos();
      setRepos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) loadRepos();
  }, [user]);

  const filteredRepos = repos.filter(repo => 
    repo.name.toLowerCase().includes(search.toLowerCase()) ||
    (repo.description?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Fetching your repositories...</p>
      </div>
    );
  }

  return (
    <section className="py-20 border-t border-border bg-card/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">My Repositories</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Select a repository to index
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search repos..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 w-full md:w-64 bg-background border-border text-sm"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => loadRepos(true)} 
              disabled={refreshing}
              className="h-10 w-10 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredRepos.map((repo, i) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group flex flex-col p-5 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-accent/10 transition-all cursor-default relative overflow-hidden"
              >
                {/* Status indicator */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-accent group-hover:bg-primary/10 transition-colors">
                      <GitBranch className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-muted-foreground leading-none mb-1">
                        {repo.language || "Unknown"}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground truncate max-w-[160px]">
                        {repo.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight flex items-center gap-1 ${
                    repo.private ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  }`}>
                    {repo.private ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                    {repo.private ? "Private" : "Public"}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-6 h-8 leading-relaxed">
                  {repo.description || "No description provided."}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => window.open(repo.html_url, "_blank")}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="View on GitHub"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] text-muted-foreground">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    onClick={() => onIndex(repo.html_url)}
                    className="h-7 px-3 text-[10px] font-black uppercase tracking-widest bg-teal-500 text-black hover:bg-teal-400 transition-all rounded-lg"
                  >
                    Index Repo
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredRepos.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-lg bg-accent/5">
            <p className="text-sm text-muted-foreground">No repositories found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
}
