import { useState } from "react";
import { ChevronRight, ChevronDown, FileCode, Folder, FolderOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { FileTreeNode } from "@/lib/mock-data";

interface FileTreeProps {
  tree: FileTreeNode[];
  onFileSelect: (path: string) => void;
  selectedFile?: string;
}

const FileTreeItem = ({
  node, depth, onFileSelect, selectedFile, filter,
}: {
  node: FileTreeNode; depth: number; onFileSelect: (path: string) => void;
  selectedFile?: string; filter: string;
}) => {
  const [expanded, setExpanded] = useState(depth < 2);

  const matchesFilter = filter
    ? node.name.toLowerCase().includes(filter.toLowerCase()) ||
      (node.children?.some((c) => c.name.toLowerCase().includes(filter.toLowerCase())))
    : true;

  if (!matchesFilter && !filter) return null;

  if (node.type === "folder") {
    return (
      <div>
        <button onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 w-full py-0.5 px-1.5 text-[11px] hover:bg-accent/30 rounded transition-colors text-muted-foreground hover:text-foreground"
          style={{ paddingLeft: `${depth * 12 + 6}px` }}>
          {expanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
          {expanded ? <FolderOpen className="h-3 w-3 text-primary shrink-0" /> : <Folder className="h-3 w-3 text-muted-foreground shrink-0" />}
          <span className="truncate">{node.name}</span>
        </button>
        {expanded && node.children?.map((child) => (
          <FileTreeItem key={child.path} node={child} depth={depth + 1} onFileSelect={onFileSelect} selectedFile={selectedFile} filter={filter} />
        ))}
      </div>
    );
  }

  return (
    <button onClick={() => onFileSelect(node.path)}
      className={`flex items-center gap-1.5 w-full py-0.5 px-1.5 text-[11px] rounded transition-colors ${
        selectedFile === node.path ? "bg-accent/40 text-primary" : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
      }`}
      style={{ paddingLeft: `${depth * 12 + 6}px` }}>
      <FileCode className="h-3 w-3 shrink-0" />
      <span className="truncate">{node.name}</span>
    </button>
  );
};

const FileTree = ({ tree, onFileSelect, selectedFile }: FileTreeProps) => {
  const [filter, setFilter] = useState("");

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      <div className="p-1.5 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input placeholder="Filter..." value={filter} onChange={(e) => setFilter(e.target.value)}
            className="h-7 pl-7 text-[11px] bg-card border-border" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {tree.map((node) => (
          <FileTreeItem key={node.path} node={node} depth={0} onFileSelect={onFileSelect} selectedFile={selectedFile} filter={filter} />
        ))}
      </div>
    </div>
  );
};

export default FileTree;
