import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { AnimatePresence } from "framer-motion";
import type { FileTreeNode } from "@/lib/mock-data";
import NodeContextMenu from "./NodeContextMenu";

interface DependencyGraphProps {
  fileTree: FileTreeNode[];
  expanded?: boolean;
  onShowDetails?: (path: string) => void;
  onExplain?: (path: string) => void;
}

interface GraphNode {
  id: string;
  name: string;
  type: "folder" | "file";
  depth: number;
  parentId?: string;
  childCount: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string;
  target: string;
}

/* ── Color palette ── */
const FOLDER_FILL = "hsl(210, 70%, 55%)";
const FOLDER_FILL_COLLAPSED = "hsl(260, 55%, 55%)";
const FOLDER_STROKE = "hsl(210, 70%, 65%)";
const FOLDER_STROKE_COLLAPSED = "hsl(260, 55%, 65%)";
const FILE_FILL = "hsl(220, 15%, 50%)";
const FILE_STROKE = "hsl(220, 15%, 62%)";
const LINK_COLOR = "hsl(220, 10%, 25%)";
const LABEL_FOLDER = "hsl(220, 12%, 78%)";
const LABEL_FILE = "hsl(220, 12%, 58%)";

/* ── Depth Collapsing Auto Logic ── */
function getInitialCollapsedFolders(tree: FileTreeNode[], maxDepth = 2, currentDepth = 0): Set<string> {
  const result = new Set<string>();
  for (const node of tree) {
    if (node.type === "folder" || node.children) {
      if (currentDepth >= maxDepth) result.add(node.path);
      if (node.children) {
        const childSet = getInitialCollapsedFolders(node.children, maxDepth, currentDepth + 1);
        childSet.forEach(v => result.add(v));
      }
    }
  }
  return result;
}

const DependencyGraph = ({ fileTree, expanded, onShowDetails, onExplain }: DependencyGraphProps) => {
  const fgRef = useRef<ForceGraphMethods>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 600, height: 360 });
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  const clickTimers = useRef<Record<string, NodeJS.Timeout>>({});
  
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; path: string; name: string; type: "file" | "folder";
  } | null>(null);

  // Initialize auto-collapsed folders only once when fileTree is fully available
  useEffect(() => {
    if (!initialized && fileTree.length > 0) {
      setCollapsedFolders(getInitialCollapsedFolders(fileTree, 2));
      setInitialized(true);
    }
  }, [fileTree, initialized]);

  const toggleCollapse = useCallback((folderId: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }, []);

  /* ── Observe container size ── */
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /* ── Extract Graph Data ── */
  const graphData = useMemo(() => {
    if (!initialized) return { nodes: [], links: [] };

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    function traverse(arr: FileTreeNode[], depth = 0, parentPath?: string) {
      for (const node of arr) {
        const childCount = node.children?.length ?? 0;
        nodes.push({ id: node.path, name: node.name, type: node.type, depth, parentId: parentPath, childCount });
        
        if (parentPath) {
          links.push({ source: parentPath, target: node.path });
        }

        if (node.children && !collapsedFolders.has(node.path)) {
          traverse(node.children, depth + 1, node.path);
        }
      }
    }
    
    traverse(fileTree);
    return { nodes, links };
  }, [fileTree, collapsedFolders, initialized]);

  /* ── Canvas Painter ── */
  const drawNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isFolder = node.type === "folder";
    const isCollapsed = collapsedFolders.has(node.id);
    
    const label = node.name.length > 18 ? node.name.slice(0, 17) + "…" : node.name;
    const opacity = Math.max(0.4, 1 - Math.min(node.depth, 4) * 0.15);

    if (isFolder) {
      // Rounded rect
      const size = 20;
      ctx.fillStyle = isCollapsed ? FOLDER_FILL_COLLAPSED : FOLDER_FILL;
      ctx.globalAlpha = opacity;
      
      ctx.beginPath();
      ctx.roundRect(node.x - size/2, node.y - size/2, size, size, 4);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = isCollapsed ? FOLDER_STROKE_COLLAPSED : FOLDER_STROKE;
      ctx.stroke();

      // Badge for collapse state
      ctx.fillStyle = "white";
      ctx.globalAlpha = 1;
      ctx.font = `bold 12px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isCollapsed ? "+" : "-", node.x, node.y);

      // Child count badge
      if (node.childCount > 0) {
        const bx = node.x + size/2;
        const by = node.y - size/2;
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = isCollapsed ? FOLDER_FILL_COLLAPSED : "hsl(210, 60%, 40%)";
        ctx.fill();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "hsl(220, 15%, 12%)";
        ctx.stroke();
        
        ctx.fillStyle = "white";
        ctx.font = `bold 6px sans-serif`;
        ctx.fillText(String(node.childCount), bx, by);
      }

      // Title below
      ctx.font = `600 ${10 / Math.max(1, globalScale * 0.5)}px sans-serif`;
      ctx.fillStyle = LABEL_FOLDER;
      ctx.fillText(label, node.x, node.y + size/2 + (10 / Math.max(1, globalScale * 0.5)));

    } else {
      // File circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
      ctx.fillStyle = FILE_FILL;
      ctx.globalAlpha = opacity;
      ctx.fill();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = FILE_STROKE;
      ctx.stroke();

      // Title right
      ctx.font = `400 ${8 / Math.max(1, globalScale * 0.5)}px monospace`;
      ctx.fillStyle = LABEL_FILE;
      ctx.textAlign = "left";
      ctx.fillText(label, node.x + 6, node.y + 2);
    }
  }, [collapsedFolders]);

  /* ── Interaction ── */
  const handleNodeClick = useCallback((node: GraphNode, event: MouseEvent) => {
    // Basic debounce for double clicks
    if (clickTimers.current[node.id]) {
      clearTimeout(clickTimers.current[node.id]);
      delete clickTimers.current[node.id];
      // Double click logic
      if (node.type === "folder") {
        toggleCollapse(node.id);
      }
      return;
    }

    // Set a timer for single click
    clickTimers.current[node.id] = setTimeout(() => {
      delete clickTimers.current[node.id];
      // Single click logic
      setContextMenu({ 
        x: event.clientX, 
        y: event.clientY, 
        path: node.id, 
        name: node.name, 
        type: node.type 
      });
    }, 250);
  }, [toggleCollapse]);

  // Adjust physics bounds
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge')?.strength(-150);
      fgRef.current.d3Force('link')?.distance(80);
      
      // Attempt zoom to fit on initial graph load
      if (graphData.nodes.length > 0) {
        setTimeout(() => {
          fgRef.current?.zoomToFit(400, 50);
        }, 100);
      }
    }
  }, [graphData.nodes.length]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg border border-border bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative"
      onClick={() => setContextMenu(null)}
    >
      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5 rounded-md bg-card/80 backdrop-blur-sm border border-border/50 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded" style={{ background: FOLDER_FILL }} />
          Folder
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded" style={{ background: FOLDER_FILL_COLLAPSED }} />
          Collapsed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: FILE_FILL }} />
          File
        </span>
        <span className="opacity-60">Double-click folder to collapse/expand</span>
      </div>

      {dimensions.width > 20 && initialized && (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeCanvasObject={drawNode}
          nodeCanvasObjectMode={() => "replace"}
          linkColor={() => LINK_COLOR}
          linkWidth={1}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.2}
          onNodeClick={handleNodeClick}
          onNodeDragEnd={(node) => {
            if (node.x !== undefined && node.y !== undefined) {
               node.fx = node.x;
               node.fy = node.y;
            }
          }}
        />
      )}

      <AnimatePresence>
        {contextMenu && (
          <NodeContextMenu
            x={contextMenu.x} y={contextMenu.y}
            nodePath={contextMenu.path} nodeName={contextMenu.name} nodeType={contextMenu.type}
            onShowDetails={(path) => onShowDetails?.(path)}
            onExplain={(path) => onExplain?.(path)}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DependencyGraph;
