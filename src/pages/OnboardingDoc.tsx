import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Terminal, Download, Copy, Check, Loader2, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useRepoStore } from "@/lib/store";
import { generateOnboardingDoc } from "@/lib/api";
import { DEMO_REPOS } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

const OnboardingDoc = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const { meta, repoContext } = useRepoStore();
  const repo = meta || DEMO_REPOS.find((r) => r.id === repoId) || DEMO_REPOS[0];

  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const context = repoContext || `Repository: ${repo.name} by ${repo.owner}\nFramework: ${(repo as any).framework || "Unknown"}\nFiles: ${repo.fileCount}`;
      const doc = await generateOnboardingDoc(context);
      setMarkdown(doc);
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to generate onboarding doc",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${repo.name}-onboarding.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-glass border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between h-12 px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/repo/${repoId}`)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">
              {repo.owner}/<span className="text-foreground font-semibold">{repo.name}</span>
              <span className="text-muted-foreground"> · Onboarding Guide</span>
            </span>
          </div>
          {markdown && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="font-mono text-xs">
                {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs">
                <Download className="h-3.5 w-3.5 mr-1" />
                Download .md
              </Button>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {!markdown && !loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Generate Onboarding Guide</h1>
              <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
                AI will analyze the codebase and generate a comprehensive onboarding document with setup instructions, key files, patterns, and gotchas.
              </p>
              <Button onClick={handleGenerate} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono">
                <Zap className="h-4 w-4 mr-2" />
                Generate Onboarding Guide
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground font-mono">Analyzing codebase and generating guide...</p>
            </div>
          )}

          {markdown && !loading && (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-secondary-foreground prose-a:text-primary prose-code:text-primary prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-code-bg prose-pre:border prose-pre:border-border prose-strong:text-foreground prose-li:text-secondary-foreground">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const inline = !match;
                    return inline ? (
                      <code className={className} {...props}>{children}</code>
                    ) : (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        customStyle={{ margin: 0, background: "hsl(220, 20%, 8%)", fontSize: "12px" }}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    );
                  },
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};


export default OnboardingDoc;
