import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { FileCode, FolderOpen, Search, TextSearch, ArrowRight } from "lucide-react";
import { useRepoStore } from "@/lib/store";
import { DEMO_FILE_TREE } from "@/lib/mock-data";
import type { FileTreeNode } from "@/lib/mock-data";

interface CodebaseSearchProps {
  repoId: string;
}

/* ── helpers ── */

function flattenTree(nodes: FileTreeNode[]): FileTreeNode[] {
  const result: FileTreeNode[] = [];
  const walk = (list: FileTreeNode[]) => {
    for (const n of list) {
      result.push(n);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return result;
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ── component ── */

const CodebaseSearch = ({ repoId }: CodebaseSearchProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { fileTree: storeTree, fileContents } = useRepoStore();
  const fileTree = storeTree.length > 0 ? storeTree : DEMO_FILE_TREE;

  // Flatten file tree once
  const flatFiles = useMemo(() => flattenTree(fileTree), [fileTree]);

  // ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // File tree search — fuzzy-ish path match
  const fileResults = useMemo(() => {
    if (!query) return flatFiles.filter((n) => n.type === "file").slice(0, 8);
    const q = query.toLowerCase();
    return flatFiles
      .filter((n) => n.path.toLowerCase().includes(q) || n.name.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, flatFiles]);

  // Content search — match inside fileContents
  const contentResults = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const matches: { path: string; line: string; lineNum: number }[] = [];

    for (const file of fileContents) {
      const lines = file.content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(q)) {
          matches.push({ path: file.path, line: lines[i].trim(), lineNum: i + 1 });
          if (matches.length >= 10) break;
        }
      }
      if (matches.length >= 10) break;
    }
    return matches;
  }, [query, fileContents]);

  const handleSelect = useCallback(
    (question: string) => {
      setOpen(false);
      navigate(`/repo/${repoId}/chat`, { state: { initialQuestion: question } });
    },
    [navigate, repoId],
  );

  return (
    <>
      {/* Trigger bar */}
      <button
        id="search-codebase-trigger"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-muted/50
                   text-muted-foreground text-xs w-48 hover:border-primary/40 hover:bg-muted
                   transition-all duration-200 cursor-pointer group"
      >
        <Search className="h-3.5 w-3.5 shrink-0 group-hover:text-primary transition-colors" />
        <span className="flex-1 text-left">Search codebase...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background
                        px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Command palette dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search files, code, patterns..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-4">
              <Search className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No results found.</p>
              <p className="text-xs text-muted-foreground/60">Try a different search term</p>
            </div>
          </CommandEmpty>

          {/* File results */}
          <CommandGroup heading="Files">
            {fileResults.map((node) => (
              <CommandItem
                key={node.path}
                value={node.path}
                onSelect={() => handleSelect(`Explain the file: ${node.path}`)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {node.type === "folder" ? (
                  <FolderOpen className="h-3.5 w-3.5 text-yellow-500/70 shrink-0" />
                ) : (
                  <FileCode className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                )}
                <span className="flex-1 text-xs font-mono truncate">
                  {highlightMatch(node.path, query)}
                </span>
                {node.language && (
                  <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted border border-border">
                    {node.language}
                  </span>
                )}
                <ArrowRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Content results */}
          {contentResults.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Code Matches">
                {contentResults.map((match, i) => (
                  <CommandItem
                    key={`${match.path}:${match.lineNum}:${i}`}
                    value={`${match.path}:${match.lineNum}`}
                    onSelect={() =>
                      handleSelect(
                        `Explain this code in ${match.path} at line ${match.lineNum}: \`${match.line.slice(0, 100)}\``,
                      )
                    }
                    className="flex flex-col items-start gap-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <TextSearch className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                      <span className="text-[11px] font-mono text-muted-foreground truncate">
                        {match.path}
                        <span className="text-primary/60">:{match.lineNum}</span>
                      </span>
                    </div>
                    <div className="pl-5 w-full">
                      <code className="text-[11px] text-secondary-foreground bg-muted px-1.5 py-0.5 rounded block truncate">
                        {highlightMatch(match.line.slice(0, 120), query)}
                      </code>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default CodebaseSearch;
