import { memo } from "react";
import { User, Bot } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import CitationChip from "./CitationChip";
import type { ChatMessage as ChatMessageType, Citation } from "@/lib/mock-data";

interface ChatMessageProps {
  message: ChatMessageType;
  onCitationClick: (citation: Citation) => void;
}

const renderContent = (content: string) => {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    const codeMatch = part.match(/```(\w+)?\n?([\s\S]*?)```/);
    if (codeMatch) {
      const lang = codeMatch[1] || "typescript";
      const code = codeMatch[2].trim();
      return (
        <div key={i} className="my-2 rounded overflow-hidden border border-border">
          <div className="flex items-center px-3 py-1 bg-muted border-b border-border">
            <span className="text-[10px] text-muted-foreground uppercase">{lang}</span>
          </div>
          <SyntaxHighlighter language={lang} style={vscDarkPlus}
            customStyle={{ margin: 0, padding: "10px 14px", background: "hsl(220, 14%, 9%)", fontSize: "11px", lineHeight: "1.5" }}>
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <span key={i}>
        {part.split(/(\*\*.*?\*\*|`[^`]+`)/g).map((segment, j) => {
          if (segment.startsWith("**") && segment.endsWith("**")) {
            return <strong key={j} className="text-foreground font-medium">{segment.slice(2, -2)}</strong>;
          }
          if (segment.startsWith("`") && segment.endsWith("`")) {
            return (
              <code key={j} className="px-1 py-0.5 rounded text-[11px] font-mono bg-muted text-primary">
                {segment.slice(1, -1)}
              </code>
            );
          }
          return segment.split("\n").map((line, k) => (
            <span key={`${j}-${k}`}>
              {k > 0 && <br />}
              {line}
            </span>
          ));
        })}
      </span>
    );
  });
};

const ChatMessageComponent = memo(({ message, onCitationClick }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
        isUser ? "bg-muted" : "bg-primary/10"
      }`}>
        {isUser ? <User className="h-3 w-3 text-muted-foreground" /> : <Bot className="h-3 w-3 text-primary" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? "text-right" : ""}`}>
        <div className={`inline-block text-left px-3 py-2.5 rounded text-sm leading-relaxed ${
          isUser
            ? "bg-primary/8 border border-primary/15 text-foreground"
            : "bg-card border border-border text-secondary-foreground"
        }`}>
          {renderContent(message.content)}
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {message.citations.map((citation, i) => (
              <CitationChip key={i} citation={citation} onClick={onCitationClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ChatMessageComponent.displayName = "ChatMessage";

export default ChatMessageComponent;
