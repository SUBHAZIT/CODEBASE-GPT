import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Send, ChevronLeft, PanelRightOpen, PanelRightClose, Share2, Check, History, Plus, Trash2, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileTree from "@/components/chat/FileTree";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import FileViewer from "@/components/chat/FileViewer";
import { DEMO_REPOS, DEMO_FILE_TREE, type ChatMessage, type Citation } from "@/lib/mock-data";
import { useRepoStore } from "@/lib/store";
import { streamChat } from "@/lib/api";
import { createChatSession, updateSessionMessages, loadChatSession } from "@/lib/chat-session";
import { getChatHistory, saveChatHistoryEntry, removeChatHistoryEntry, type ChatHistoryEntry } from "@/lib/chat-history";
import { toast } from "@/hooks/use-toast";
import { useCompactMode } from "@/hooks/use-compact-mode";
import { useSettingsStore } from "@/lib/settings-store";

const ChatInterface = () => {
  const { repoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const compact = useCompactMode();
  const { settings } = useSettingsStore();
  const { meta: storeMeta, fileTree: storeFileTree, repoContext, githubToken } = useRepoStore();

  const repo = storeMeta || DEMO_REPOS.find((r) => r.id === repoId) || DEMO_REPOS[0];
  const fileTree = storeFileTree.length > 0 ? storeFileTree : DEMO_FILE_TREE;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showFileTree, setShowFileTree] = useState(!compact);
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatHistory(getChatHistory().filter((h) => h.repoId === repoId));
  }, [repoId]);

  useEffect(() => {
    const state = location.state as { initialQuestion?: string } | null;
    if (state?.initialQuestion) {
      handleSend(state.initialQuestion);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const persistToHistory = useCallback(async (msgs: ChatMessage[], sid: string) => {
    if (!settings.autoSaveChatHistory) return;
    
    const lastMsg = msgs.filter((m) => m.role === "assistant").pop();
    saveChatHistoryEntry({
      sessionId: sid,
      repoId: repoId || "unknown",
      repoName: repo.name,
      repoOwner: repo.owner,
      lastMessage: lastMsg?.content?.slice(0, 100) || "New chat",
      messageCount: msgs.length,
      updatedAt: new Date().toISOString(),
    });
    setChatHistory(getChatHistory().filter((h) => h.repoId === repoId));
  }, [repoId, repo, settings.autoSaveChatHistory]);

  const ensureSession = async (): Promise<string> => {
    if (sessionId) return sessionId;
    if (!settings.autoSaveChatHistory) return "local-session-" + Date.now();

    const sid = await createChatSession(
      repoId || "unknown", repo,
      repoContext || `Repository: ${repo.name} by ${repo.owner}`
    );
    setSessionId(sid);
    return sid;
  };

  const handleSend = async (text?: string) => {
    const content = text || inputValue.trim();
    if (!content || isStreaming) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    let fullContent = "";
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", timestamp: new Date() }]);

    try {
      const sid = await ensureSession();
      const chatHist = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

      await streamChat({
        messages: chatHist,
        repoContext: repoContext || `Repository: ${repo.name} by ${repo.owner}`,
        onDelta: (chunk) => {
          fullContent += chunk;
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m)));
        },
        onDone: () => {
          const citations = extractCitations(fullContent);
          setMessages((prev) => {
            const updated = prev.map((m) => m.id === assistantId ? { ...m, content: fullContent, citations } : m);
            if (settings.autoSaveChatHistory) {
              updateSessionMessages(sid, updated);
              persistToHistory(updated, sid);
            }
            return updated;
          });
          setIsStreaming(false);
        },
        onError: (error) => {
          toast({ title: "Error", description: error, variant: "destructive" });
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setIsStreaming(false);
        },
      });
    } catch (e) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Failed to send", variant: "destructive" });
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      setIsStreaming(false);
    }
  };

  const handleCitationClick = (citation: Citation) => {
    setActiveCitation(citation);
    setSelectedFile(citation.filePath);
  };

  const handleFileSelect = (filePath: string | undefined) => {
    setSelectedFile(filePath);
    if (filePath) {
      setActiveCitation({
        filePath,
        startLine: 1,
        endLine: 999999, // Show entire file
        snippet: "Full file"
      });
    } else {
      setActiveCitation(null);
    }
  };

  const handleShare = useCallback(async () => {
    try {
      const sid = await ensureSession();
      await updateSessionMessages(sid, messages);
      const url = `${window.location.origin}/shared/${sid}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link copied!", description: "Anyone with the link can view this chat." });
    } catch {
      toast({ title: "Error", description: "Failed to create share link.", variant: "destructive" });
    }
  }, [sessionId, messages, repoId, repo, repoContext]);

  const loadSession = async (entry: ChatHistoryEntry) => {
    try {
      const session = await loadChatSession(entry.sessionId);
      if (session) {
        setSessionId(session.id);
        setMessages(session.messages);
        setShowHistory(false);
      } else {
        toast({ title: "Session not found", variant: "destructive" });
        removeChatHistoryEntry(entry.sessionId);
        setChatHistory(getChatHistory().filter((h) => h.repoId === repoId));
      }
    } catch {
      toast({ title: "Error", description: "Failed to load session.", variant: "destructive" });
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setActiveCitation(null);
    setShowHistory(false);
  };

  const deleteHistoryEntry = (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    removeChatHistoryEntry(sid);
    setChatHistory(getChatHistory().filter((h) => h.repoId === repoId));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <nav className="shrink-0 flex items-center justify-between h-10 px-3 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          {!compact && (
            <button onClick={() => navigate(`/repo/${repoId}`)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
          <Code2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] text-muted-foreground">
            {repo.owner}/<span className="text-foreground font-medium">{repo.name}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={startNewChat} className="h-6 px-2 text-[11px] text-muted-foreground gap-1">
            <Plus className="h-3 w-3" /> New
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}
            className={`h-6 px-2 text-[11px] gap-1 ${showHistory ? "text-primary" : "text-muted-foreground"}`}>
            <History className="h-3 w-3" /> History
          </Button>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleShare} className="h-6 px-2 text-[11px] text-muted-foreground gap-1">
              {copied ? <Check className="h-3 w-3 text-success" /> : <Share2 className="h-3 w-3" />}
              {copied ? "Copied" : "Share"}
            </Button>
          )}
          {!compact && (
            <Button variant="ghost" size="sm" onClick={() => setShowFileTree(!showFileTree)} className="h-6 w-6 p-0 text-muted-foreground">
              {showFileTree ? <PanelRightClose className="h-3 w-3" /> : <PanelRightOpen className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </nav>

      <div className="flex-1 flex min-h-0">
        <AnimatePresence>
          {showFileTree && !compact && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="shrink-0 overflow-hidden">
              <FileTree tree={fileTree} onFileSelect={handleFileSelect} selectedFile={selectedFile} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0">
          {/* History */}
          <AnimatePresence>
            {showHistory && chatHistory.length > 0 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
                className="overflow-hidden border-b border-border">
                <div className="p-2.5 max-h-40 overflow-y-auto space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Previous Sessions</p>
                  {chatHistory.map((entry) => (
                    <button key={entry.sessionId} onClick={() => loadSession(entry)}
                      className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-accent/30 transition-colors group ${entry.sessionId === sessionId ? "bg-accent/20" : ""
                        }`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-foreground truncate">{entry.lastMessage || "Empty chat"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {entry.messageCount} messages · {new Date(entry.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button onClick={(e) => deleteHistoryEntry(e, entry.sessionId)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center pt-16">
                <p className="text-sm text-muted-foreground">Ask anything about this codebase</p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessageComponent key={msg.id} message={msg} onCitationClick={handleCitationClick} />
            ))}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-9">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 p-3 border-t border-border">
            <div className="flex gap-2 max-w-2xl mx-auto">
              <Input placeholder="Ask about this codebase..." value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={isStreaming}
                className="text-sm bg-card border-border h-9" />
              <Button onClick={() => handleSend()} disabled={!inputValue.trim() || isStreaming}
                size="icon" className="h-9 w-9 shrink-0">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {activeCitation && !compact && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "40%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="shrink-0 overflow-hidden">
              <FileViewer
                citation={activeCitation}
                repoOwner={repo.owner}
                repoName={repo.name}
                githubToken={githubToken}
                onClose={() => {
                  setActiveCitation(null);
                  setSelectedFile(undefined);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

function extractCitations(text: string): Citation[] {
  const citations: Citation[] = [];
  const regex = /`?([a-zA-Z0-9_/.-]+\.[a-zA-Z]+):(\d+)[-–](\d+)`?/g;
  let match;
  const seen = new Set<string>();
  while ((match = regex.exec(text)) !== null) {
    const key = `${match[1]}:${match[2]}-${match[3]}`;
    if (!seen.has(key)) {
      seen.add(key);
      citations.push({ filePath: match[1], startLine: parseInt(match[2]), endLine: parseInt(match[3]), snippet: `Lines ${match[2]}-${match[3]}` });
    }
    if (citations.length >= 5) break;
  }
  return citations;
}

export default ChatInterface;