import { FileCode } from "lucide-react";
import type { Citation } from "@/lib/mock-data";

interface CitationChipProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
}

const CitationChip = ({ citation, onClick }: CitationChipProps) => {
  const fileName = citation.filePath.split("/").pop();

  return (
    <button
      onClick={() => onClick(citation)}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-primary border border-border hover:bg-accent/30 transition-colors"
    >
      <FileCode className="h-2.5 w-2.5" />
      {fileName}:{citation.startLine}–{citation.endLine}
    </button>
  );
};

export default CitationChip;
