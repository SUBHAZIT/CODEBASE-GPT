import { motion } from "framer-motion";
import { Eye, MessageSquare } from "lucide-react";

interface NodeContextMenuProps {
  x: number; y: number;
  nodePath: string; nodeName: string; nodeType: "file" | "folder";
  onShowDetails: (path: string) => void;
  onExplain: (path: string) => void;
  onClose: () => void;
}

const NodeContextMenu = ({ x, y, nodePath, onShowDetails, onExplain, onClose }: NodeContextMenuProps) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.1 }}
        className="fixed z-50 min-w-[160px] rounded border border-border bg-card shadow-lg overflow-hidden"
        style={{ left: x, top: y }}
      >
        <div className="px-2.5 py-1.5 border-b border-border">
          <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{nodePath}</p>
        </div>
        <button
          onClick={() => { onShowDetails(nodePath); onClose(); }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-foreground hover:bg-accent/30 transition-colors"
        >
          <Eye className="h-3 w-3 text-muted-foreground" /> Show Details
        </button>
        <button
          onClick={() => { onExplain(nodePath); onClose(); }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-foreground hover:bg-accent/30 transition-colors"
        >
          <MessageSquare className="h-3 w-3 text-muted-foreground" /> Explain It
        </button>
      </motion.div>
    </>
  );
};

export default NodeContextMenu;
