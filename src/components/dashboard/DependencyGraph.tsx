import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { AnimatePresence } from "framer-motion";
import type { FileTreeNode } from "@/lib/mock-data";
import NodeContextMenu from "./NodeContextMenu";

interface DependencyGraphProps {
  fileTree: FileTreeNode[];
  expanded?: boolean;
  onShowDetails?: (path: string) => void;
  onExplain?: (path: string) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: "folder" | "file";
  depth: number;
  parentId?: string;
  childCount: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

/* ── Extract nodes from tree, respecting collapsed folders ── */
function extractNodes(
  tree: FileTreeNode[],
  collapsedFolders: Set<string>,
  depth = 0,
  parentId?: string
): GraphNode[] {
  const nodes: GraphNode[] = [];
  for (const node of tree) {
    const childCount = node.children?.length ?? 0;
    nodes.push({ id: node.path, name: node.name, type: node.type, depth, parentId, childCount });
    // only recurse if this folder is NOT collapsed
    if (node.children && !collapsedFolders.has(node.path)) {
      nodes.push(...extractNodes(node.children, collapsedFolders, depth + 1, node.path));
    }
  }
  return nodes;
}

/* ── Extract links, respecting collapsed folders ── */
function extractLinks(
  tree: FileTreeNode[],
  collapsedFolders: Set<string>,
  parentPath?: string
): GraphLink[] {
  const links: GraphLink[] = [];
  for (const node of tree) {
    if (parentPath) links.push({ source: parentPath, target: node.path });
    if (node.children && !collapsedFolders.has(node.path)) {
      links.push(...extractLinks(node.children, collapsedFolders, node.path));
    }
  }
  return links;
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

const DependencyGraph = ({ fileTree, expanded, onShowDetails, onExplain }: DependencyGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 360 });
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; path: string; name: string; type: "file" | "folder";
  } | null>(null);

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

  /* ── D3 render ── */
  useEffect(() => {
    if (!svgRef.current || !fileTree.length) return;
    const { width, height } = dimensions;
    if (width < 10 || height < 10) return;

    const nodes = extractNodes(fileTree, collapsedFolders);
    const links = extractLinks(fileTree, collapsedFolders);
    const nodeIds = new Set(nodes.map((n) => n.id));

    // Filter out dangling links
    const validLinks = links.filter(
      (l) => nodeIds.has(typeof l.source === "string" ? l.source : l.source.id)
        && nodeIds.has(typeof l.target === "string" ? l.target : l.target.id)
    );

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Defs for arrowhead
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -3 6 6")
      .attr("refX", 14).attr("refY", 0)
      .attr("markerWidth", 5).attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-3L6,0L0,3")
      .attr("fill", LINK_COLOR);

    const g = svg.append("g");

    // Zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoomBehavior);

    // Initial fit: center everything
    const initialScale = Math.min(1, width / 800, height / 500);
    svg.call(
      zoomBehavior.transform as (sel: d3.Selection<SVGSVGElement, unknown, null, undefined>, ...a: unknown[]) => void,
      d3.zoomIdentity.translate(width / 2 * (1 - initialScale), height / 2 * (1 - initialScale)).scale(initialScale)
    );

    // Position nodes in a tree-ish layout as starting point
    const depthGroups: Record<number, GraphNode[]> = {};
    nodes.forEach((n) => {
      (depthGroups[n.depth] ??= []).push(n);
    });
    const maxDepth = Math.max(...Object.keys(depthGroups).map(Number), 0);
    const xSpacing = width / (maxDepth + 2);

    Object.entries(depthGroups).forEach(([d, group]) => {
      const depth = Number(d);
      const ySpacing = height / (group.length + 1);
      group.forEach((node, i) => {
        node.x = xSpacing * (depth + 1);
        node.y = ySpacing * (i + 1);
      });
    });

    // Collision radius based on node type — generous to avoid overlap
    const collisionRadius = (d: GraphNode) => d.type === "folder" ? 55 : 45;

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(validLinks).id((d) => d.id).distance(130).strength(0.6))
      .force("charge", d3.forceManyBody().strength(-350))
      .force("centerX", d3.forceX(width / 2).strength(0.05))
      .force("centerY", d3.forceY(height / 2).strength(0.05))
      .force("collision", d3.forceCollide<GraphNode>().radius(collisionRadius).strength(1).iterations(3));

    // Links — curved paths
    const linkGroup = g.append("g").attr("class", "links");
    const link = linkGroup.selectAll("path").data(validLinks).join("path")
      .attr("fill", "none")
      .attr("stroke", LINK_COLOR)
      .attr("stroke-width", 1.2)
      .attr("stroke-opacity", 0.4)
      .attr("marker-end", "url(#arrow)");

    // Node groups
    const nodeGroup = g.append("g").attr("class", "nodes");
    const node = nodeGroup.selectAll("g").data(nodes).join("g")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        setContextMenu({ x: event.clientX, y: event.clientY, path: d.id, name: d.name, type: d.type });
      })
      .on("dblclick", (event, d) => {
        event.stopPropagation();
        event.preventDefault();
        if (d.type === "folder") {
          toggleCollapse(d.id);
        }
      })
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Folder nodes — rounded rects with collapse indicator
    node.filter((d) => d.type === "folder").each(function (d) {
      const g = d3.select(this);
      const isCollapsed = collapsedFolders.has(d.id);

      // Rounded rect background
      g.append("rect")
        .attr("x", -14).attr("y", -14)
        .attr("width", 28).attr("height", 28)
        .attr("rx", 6).attr("ry", 6)
        .attr("fill", isCollapsed ? FOLDER_FILL_COLLAPSED : FOLDER_FILL)
        .attr("stroke", isCollapsed ? FOLDER_STROKE_COLLAPSED : FOLDER_STROKE)
        .attr("stroke-width", 1.5)
        .attr("opacity", Math.max(0.6, 1 - d.depth * 0.12));

      // Collapse/expand indicator
      g.append("text")
        .text(isCollapsed ? "+" : "−")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("pointer-events", "none");

      // Label below
      g.append("text")
        .text(d.name.length > 16 ? d.name.slice(0, 15) + "…" : d.name)
        .attr("x", 0).attr("y", 26)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-family", "Inter, system-ui, sans-serif")
        .attr("font-weight", "600")
        .attr("fill", LABEL_FOLDER)
        .attr("pointer-events", "none");

      // Child count badge
      if (d.childCount > 0) {
        g.append("circle")
          .attr("cx", 14).attr("cy", -14)
          .attr("r", 7)
          .attr("fill", isCollapsed ? FOLDER_FILL_COLLAPSED : "hsl(210, 60%, 40%)")
          .attr("stroke", "hsl(220, 15%, 12%)")
          .attr("stroke-width", 1);
        g.append("text")
          .text(d.childCount)
          .attr("x", 14).attr("y", -14)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("font-size", "8px")
          .attr("font-weight", "bold")
          .attr("fill", "white")
          .attr("pointer-events", "none");
      }
    });

    // File nodes — circles
    node.filter((d) => d.type === "file").each(function (d) {
      const g = d3.select(this);
      g.append("circle")
        .attr("r", 5)
        .attr("fill", FILE_FILL)
        .attr("stroke", FILE_STROKE)
        .attr("stroke-width", 1)
        .attr("opacity", Math.max(0.5, 1 - d.depth * 0.15));

      g.append("text")
        .text(d.name.length > 18 ? d.name.slice(0, 17) + "…" : d.name)
        .attr("x", 10).attr("y", 3)
        .attr("font-size", "9px")
        .attr("font-family", "'JetBrains Mono', 'Fira Code', monospace")
        .attr("fill", LABEL_FILE)
        .attr("opacity", Math.max(0.4, 1 - d.depth * 0.2))
        .attr("pointer-events", "none");
    });

    // Warm up simulation
    simulation.tick(80);

    // Tick handler
    simulation.on("tick", () => {
      // Curved links
      link.attr("d", (d: unknown) => {
        const l = d as GraphLink;
        const s = l.source as GraphNode;
        const t = l.target as GraphNode;
        const dx = t.x! - s.x!;
        const dy = t.y! - s.y!;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        return `M${s.x},${s.y}A${dr},${dr} 0 0,1 ${t.x},${t.y}`;
      });

      node.attr("transform", (d: unknown) => {
        const n = d as GraphNode;
        return `translate(${n.x},${n.y})`;
      });
    });

    // Click on background closes context menu
    svg.on("click", () => setContextMenu(null));

    return () => { simulation.stop(); };
  }, [fileTree, dimensions, collapsedFolders, toggleCollapse]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg border border-border bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative"
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

      <svg ref={svgRef} className="w-full h-full" />

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
