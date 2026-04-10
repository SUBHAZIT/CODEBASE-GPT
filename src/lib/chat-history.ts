// Local chat history persistence using localStorage

export interface ChatHistoryEntry {
  sessionId: string;
  repoId: string;
  repoName: string;
  repoOwner: string;
  lastMessage: string;
  messageCount: number;
  updatedAt: string;
}

const STORAGE_KEY = "codebasegpt_chat_history";

export function getChatHistory(): ChatHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatHistoryEntry(entry: ChatHistoryEntry): void {
  const history = getChatHistory();
  const idx = history.findIndex((h) => h.sessionId === entry.sessionId);
  if (idx >= 0) {
    history[idx] = entry;
  } else {
    history.unshift(entry);
  }
  // Keep max 50 entries
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

export function removeChatHistoryEntry(sessionId: string): void {
  const history = getChatHistory().filter((h) => h.sessionId !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
