import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  children?: FileTreeNode[];
}

export interface RepoMeta {
  owner: string;
  name: string;
  description?: string;
  stars?: number;
  forks?: number;
  language?: string;
}

export interface IndexedRepo {
  repoId: string;
  meta: RepoMeta;
  fileTree: FileTreeNode[];
  fileContents: { path: string; content: string; size: number }[];
  repoContext: string;
  totalFiles: number;
}

export interface OverviewData {
  narrative: string;
  framework: string;
  complexity: string;
  suggestedQs: string[];
  keyFiles: string[];
  keyPatterns: string[];
  mainDeps: string[];
  languages: string[];
}

export interface SecurityFinding {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  file: string;
  line: string | null;
  recommendation: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  labels: { name: string; color: string }[];
  user: { login: string; avatar_url: string };
  comments: number;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface RepoFileContent {
  path: string;
  content: string;
  size: number;
  truncated?: boolean;
}

export interface CodebaseGPTConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export class CodebaseGPTClient {
  private supabase: SupabaseClient;
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(config: CodebaseGPTConfig) {
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseKey = config.supabaseKey;
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  async indexRepository(
    githubUrl: string,
    githubToken?: string,
    onProgress?: (stage: number, message: string) => void
  ): Promise<IndexedRepo> {
    onProgress?.(0, "Validating GitHub URL...");

    const { data, error } = await this.supabase.functions.invoke("repo-index", {
      body: { githubUrl, githubToken },
    });

    if (error) throw new Error(error.message || "Failed to index repository");
    if (data?.error) throw new Error(data.error);

    onProgress?.(4, "Complete!");
    return data as IndexedRepo;
  }

  async generateOverview(repoContext: string): Promise<OverviewData> {
    const { data, error } = await this.supabase.functions.invoke("chat", {
      body: { action: "overview", repoContext },
    });

    if (error) throw new Error(error.message || "Failed to generate overview");
    if (data?.error) throw new Error(data.error);

    try {
      let content = data.content || "";
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      return JSON.parse(content);
    } catch {
      return {
        narrative: data.content || "Unable to generate overview.",
        framework: "Unknown",
        complexity: "Medium",
        suggestedQs: [
          "How is the project structured?",
          "What are the main entry points?",
          "How does authentication work?",
        ],
        keyFiles: [],
        keyPatterns: [],
        mainDeps: [],
        languages: [],
      };
    }
  }

  async generateSecurityScan(repoContext: string): Promise<SecurityFinding[]> {
    const { data, error } = await this.supabase.functions.invoke("chat", {
      body: { action: "security", repoContext },
    });

    if (error) throw new Error(error.message || "Failed to run security scan");
    if (data?.error) throw new Error(data.error);

    try {
      let content = data.content || "";
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  async generateSystemDesign(repoContext: string): Promise<string> {
    const { data, error } = await this.supabase.functions.invoke("chat", {
      body: { action: "system-design", repoContext },
    });

    if (error) throw new Error(error.message || "Failed to generate system design");
    if (data?.error) throw new Error(data.error);
    return data.content || "";
  }

  async fetchIssues(
    owner: string,
    repo: string,
    state: "open" | "closed" = "open",
    githubToken?: string
  ): Promise<GitHubIssue[]> {
    const { data, error } = await this.supabase.functions.invoke("repo-issues", {
      body: { owner, repo, state, githubToken },
    });
    if (error) throw new Error(error.message || "Failed to fetch issues");
    if (data?.error) throw new Error(data.error);
    return data.issues || [];
  }

  async fetchFileContent(params: {
    owner: string;
    repo: string;
    path: string;
    githubToken?: string;
  }): Promise<RepoFileContent> {
    const { data, error } = await this.supabase.functions.invoke("repo-file", {
      body: params,
    });

    if (error) throw new Error(error.message || "Failed to fetch file content");
    if (data?.error) throw new Error(data.error);
    return data as RepoFileContent;
  }

  async generateOnboardingDoc(repoContext: string): Promise<string> {
    const { data, error } = await this.supabase.functions.invoke("chat", {
      body: { action: "onboarding", repoContext },
    });

    if (error) throw new Error(error.message || "Failed to generate onboarding doc");
    if (data?.error) throw new Error(data.error);
    return data.content || "";
  }

  async streamChat({
    messages,
    repoContext,
    onDelta,
    onDone,
    onError,
  }: {
    messages: { role: string; content: string }[];
    repoContext: string;
    onDelta: (text: string) => void;
    onDone: () => void;
    onError?: (error: string) => void;
  }) {
    const resp = await fetch(`${this.supabaseUrl}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.supabaseKey}`,
      },
      body: JSON.stringify({ messages, repoContext, action: "chat" }),
    });

    if (!resp.ok || !resp.body) {
      if (resp.status === 429) {
        onError?.("Rate limit exceeded. Please wait a moment and try again.");
        return;
      }
      if (resp.status === 402) {
        onError?.("Usage limit reached. Please add credits to continue.");
        return;
      }
      onError?.("Failed to start AI chat stream");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  }
}
