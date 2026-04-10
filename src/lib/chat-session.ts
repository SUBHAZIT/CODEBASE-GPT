import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage, RepoMeta } from "@/lib/mock-data";

export interface ChatSession {
  id: string;
  repo_id: string;
  repo_meta: RepoMeta;
  messages: ChatMessage[];
  repo_context: string;
  is_public: boolean;
  created_at: string;
}

export async function createChatSession(
  repoId: string,
  repoMeta: RepoMeta,
  repoContext: string
): Promise<string> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      repo_id: repoId,
      repo_meta: repoMeta as any,
      repo_context: repoContext,
      messages: [] as any,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function updateSessionMessages(
  sessionId: string,
  messages: ChatMessage[]
): Promise<void> {
  const serialized = messages.map((m) => ({
    ...m,
    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
  }));

  await supabase
    .from("chat_sessions")
    .update({ messages: serialized as any, updated_at: new Date().toISOString() })
    .eq("id", sessionId);
}

export async function loadChatSession(sessionId: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    repo_meta: data.repo_meta as unknown as RepoMeta,
    messages: (data.messages as unknown as any[]).map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    })),
  };
}
