import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Terminal, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import { loadChatSession, type ChatSession } from "@/lib/chat-session";
import type { Citation } from "@/lib/mock-data";
import FileViewer from "@/components/chat/FileViewer";
import { AnimatePresence } from "framer-motion";

const SharedChat = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    loadChatSession(sessionId)
      .then((s) => {
        if (!s) setError("Session not found or is no longer available.");
        else setSession(s);
      })
      .catch(() => setError("Failed to load session."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Terminal className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-mono">{error || "Session not found."}</p>
        <button onClick={() => navigate("/")} className="text-xs text-primary hover:underline font-mono">
          Go to Home
        </button>
      </div>
    );
  }

  const meta = session.repo_meta;

  return (
    <div className="h-screen flex flex-col bg-background">
      <nav className="shrink-0 flex items-center justify-between h-11 px-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs text-muted-foreground">
            {meta.owner}/<span className="text-foreground font-semibold">{meta.name}</span>
            <span className="text-muted-foreground"> · Shared Chat</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">Read-only</span>
          <button onClick={() => navigate("/")} className="text-xs text-primary hover:underline font-mono flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> Try CodebaseGPT
          </button>
        </div>
      </nav>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {session.messages.map((msg) => (
              <ChatMessageComponent
                key={msg.id}
                message={msg}
                onCitationClick={(c) => setActiveCitation(c)}
              />
            ))}
            {session.messages.length === 0 && (
              <div className="text-center pt-20">
                <p className="text-muted-foreground text-sm font-mono">This shared session has no messages yet.</p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {activeCitation && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "40%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden"
            >
              <FileViewer
                citation={activeCitation}
                repoOwner={meta.owner}
                repoName={meta.name}
                onClose={() => setActiveCitation(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default SharedChat;
