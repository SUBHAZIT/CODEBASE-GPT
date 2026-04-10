import { useEffect, useMemo, useState } from "react";
import { X, FileCode, Loader2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Citation } from "@/lib/mock-data";
import { useRepoStore } from "@/lib/store";
import { fetchFileContent } from "@/lib/api";

interface FileViewerProps {
  citation: Citation | null;
  onClose: () => void;
  repoOwner?: string;
  repoName?: string;
  githubToken?: string | null;
}

const detectLanguage = (filePath: string): string => {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    sql: "sql",
    sh: "bash",
    toml: "toml",
  };
  return map[ext] || "text";
};

const FileViewer = ({ citation, onClose, repoOwner, repoName, githubToken }: FileViewerProps) => {
  const { fileContents, meta, githubToken: storeToken, upsertFileContent } = useRepoStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const owner = repoOwner ?? meta?.owner;
  const repo = repoName ?? meta?.name;
  const token = githubToken ?? storeToken;

  const fileData = useMemo(
    () => (citation ? fileContents.find((f) => f.path === citation.filePath) : undefined),
    [citation, fileContents]
  );

  useEffect(() => {
    let cancelled = false;

    if (!citation) return;
    if (fileData?.content) return;
    if (!owner || !repo) return;

    setIsLoading(true);
    setLoadError(null);

    fetchFileContent({
      owner,
      repo,
      path: citation.filePath,
      githubToken: token || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        upsertFileContent({ path: res.path, content: res.content, size: res.size });
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load file");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [citation?.filePath, fileData?.content, owner, repo, token, upsertFileContent]);

  if (!citation) return null;

  const content =
    fileData?.content ||
    (isLoading
      ? `// Loading file: ${citation.filePath}`
      : loadError
        ? `// ${loadError}`
        : `// File content not available for: ${citation.filePath}`);

  const language = detectLanguage(citation.filePath);

  const isFullFile = citation.endLine >= 999999;
  const shouldHighlight = !isFullFile;

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-[11px] text-foreground truncate">{citation.filePath}</span>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />}
          {loadError && <span className="text-[10px] text-destructive shrink-0">Load failed</span>}
          {shouldHighlight && (
            <span className="text-[10px] text-primary shrink-0">
              L{citation.startLine}–{citation.endLine}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-accent/30 rounded transition-colors">
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          startingLineNumber={1}
          wrapLines
          lineProps={(lineNumber) => ({
            style: {
              backgroundColor:
                shouldHighlight &&
                lineNumber >= citation.startLine &&
                lineNumber <= citation.endLine
                  ? "rgba(210, 160, 60, 0.06)"
                  : undefined,
              borderLeft:
                shouldHighlight &&
                lineNumber >= citation.startLine &&
                lineNumber <= citation.endLine
                  ? "2px solid hsl(210, 60%, 55%)"
                  : "2px solid transparent",
              display: "block",
              paddingLeft: "8px",
            },
          })}
          customStyle={{
            margin: 0,
            padding: "6px 0",
            background: "hsl(220, 14%, 9%)",
            fontSize: "11px",
            lineHeight: "1.6",
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default FileViewer;
