import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FileCode, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileTreeNode } from "@/lib/mock-data";
import { useRepoStore } from "@/lib/store";

interface FileExplorerProps {
  tree: FileTreeNode[];
}

const FileItem: React.FC<{ node: FileTreeNode; depth: number }> = ({ node, depth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeFilePath, openFile, setActiveFile } = useRepoStore();
  const isActive = activeFilePath === node.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === "folder") {
      setIsOpen(!isOpen);
    } else {
      openFile(node.path);
      setActiveFile(node.path);
    }
  };

  const Icon = node.type === "folder" 
    ? (isOpen ? ChevronDown : ChevronRight) 
    : (node.name.endsWith('.ts') || node.name.endsWith('.tsx') ? FileCode : FileText);

  return (
    <div className="select-none">
      <div
        onClick={handleClick}
        className={cn(
          "group flex items-center gap-2 py-1.5 px-3 cursor-pointer transition-all duration-200 border-l-2",
          isActive 
            ? "bg-primary/10 border-primary text-primary" 
            : "border-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        {node.type === "folder" ? (
          <Icon className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <div className={cn("w-1 h-1 rounded-full", isActive ? "bg-primary" : "bg-muted-foreground/40")} />
          </div>
        )}
        
        {node.type === "folder" && <Folder className="h-3.5 w-3.5 text-indigo-400/60 group-hover:text-indigo-400 transition-colors" />}
        <span className={cn(
          "text-[11px] font-medium tracking-tight truncate",
          isActive ? "font-bold" : ""
        )}>
          {node.name}
        </span>
      </div>

      {node.type === "folder" && isOpen && node.children && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <FileItem key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ tree }) => {
  const [search, setSearch] = useState("");

  const filteredTree = search 
    ? tree.filter(n => n.name.toLowerCase().includes(search.toLowerCase())) // Simple filter for demo
    : tree;

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[10px] uppercase font-bold tracking-widest placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mini-scrollbar pb-20">
        <div className="py-2">
          {filteredTree.map((node) => (
            <FileItem key={node.path} node={node} depth={0} />
          ))}
        </div>
      </div>

      {/* Stats overlay */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
           <span>Syncing Core...</span>
           <span className="text-emerald-500">Online</span>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
