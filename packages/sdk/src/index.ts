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
  // On-demand mode fields
  indexMode: "full" | "on-demand";
  totalSourceFiles: number;
  skeletonFilesFetched: number;
  unfetchedFiles: { path: string; size: number }[];
}

export interface BatchFetchResult {
  files: { path: string; content: string; size: number; error?: string }[];
  fetched: number;
  errors: number;
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

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string;
  state: string;
  user: { login: string; avatar_url: string };
  created_at: string;
  updated_at: string;
  html_url: string;
  draft: boolean;
  merged_at: string | null;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  author: { login: string; avatar_url: string } | null;
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
    const resp = await fetch(`${this.supabaseUrl}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.supabaseKey}`,
      },
      body: JSON.stringify({ action: "overview", repoContext }),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => "");
      let errorMsg = `Overview generation failed (HTTP ${resp.status})`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error) errorMsg = parsed.error;
      } catch {
        if (errBody) errorMsg += `: ${errBody.slice(0, 300)}`;
      }
      throw new Error(errorMsg);
    }

    const data = await resp.json();
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
    const resp = await fetch(`${this.supabaseUrl}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.supabaseKey}`,
      },
      body: JSON.stringify({ action: "security", repoContext }),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => "");
      let errorMsg = `Security scan failed (HTTP ${resp.status})`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error) errorMsg = parsed.error;
      } catch {
        if (errBody) errorMsg += `: ${errBody.slice(0, 300)}`;
      }
      throw new Error(errorMsg);
    }

    const data = await resp.json();
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
    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };
      if (githubToken) {
        headers.Authorization = `Bearer ${githubToken}`;
      }

      const params = new URLSearchParams({
        state: state,
        per_page: "30",
        sort: "updated",
        direction: "desc",
      });

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?${params}`,
        { headers }
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Repository ${owner}/${repo} not found. Check the repo name or add a GitHub token for private repos.`);
        }
        if (res.status === 403) {
          throw new Error("GitHub API rate limit reached. Add a GitHub Personal Access Token to increase your limit.");
        }
        throw new Error(`GitHub API error: ${res.status}`);
      }

      const issues = await res.json();
      
      const filtered = issues
        .filter((i: any) => !i.pull_request)
        .map((i: any) => ({
          number: i.number,
          title: i.title,
          body: (i.body || "").slice(0, 2000),
          state: i.state,
          labels: i.labels.map((l: any) => ({ name: l.name, color: l.color })),
          user: { login: i.user.login, avatar_url: i.user.avatar_url },
          comments: i.comments,
          created_at: i.created_at,
          updated_at: i.updated_at,
          html_url: i.html_url,
        }));

      return filtered;
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error("Something went wrong while fetching issues. Please try again.");
    }
  }

  async fetchPullRequests(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "open",
    githubToken?: string
  ): Promise<GitHubPullRequest[]> {
    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };
      if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

      const params = new URLSearchParams({
        state: state,
        per_page: "30",
        sort: "updated",
        direction: "desc",
      });

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls?${params}`,
        { headers }
      );

      if (!res.ok) {
        if (res.status === 404) throw new Error(`Repository ${owner}/${repo} not found.`);
        if (res.status === 403) throw new Error("GitHub API rate limit reached.");
        throw new Error(`GitHub API error: ${res.status}`);
      }

      const pulls = await res.json();
      return pulls.map((p: any) => ({
        number: p.number,
        title: p.title,
        body: (p.body || "").slice(0, 2000),
        state: p.state,
        user: { login: p.user.login, avatar_url: p.user.avatar_url },
        created_at: p.created_at,
        updated_at: p.updated_at,
        html_url: p.html_url,
        draft: p.draft,
        merged_at: p.merged_at,
      }));
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error("Something went wrong while fetching pull requests.");
    }
  }

  async fetchCommits(
    owner: string,
    repo: string,
    githubToken?: string
  ): Promise<GitHubCommit[]> {
    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };
      if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`,
        { headers }
      );

      if (!res.ok) {
        if (res.status === 404) throw new Error(`Repository ${owner}/${repo} not found.`);
        if (res.status === 403) throw new Error("GitHub API rate limit reached.");
        throw new Error(`GitHub API error: ${res.status}`);
      }

      const commits = await res.json();
      return commits.map((c: any) => ({
        sha: c.sha,
        commit: {
          message: c.commit.message,
          author: { name: c.commit.author.name, date: c.commit.author.date },
        },
        author: c.author ? { login: c.author.login, avatar_url: c.author.avatar_url } : null,
        html_url: c.html_url,
      }));
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error("Something went wrong while fetching commits.");
    }
  }

  async fetchPullRequestDiff(
    owner: string,
    repo: string,
    prNumber: number,
    githubToken?: string
  ): Promise<string> {
    try {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3.diff",
      };
      if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`,
        { headers }
      );

      if (!res.ok) {
        if (res.status === 404) throw new Error(`Pull Request #${prNumber} not found.`);
        if (res.status === 403) throw new Error("GitHub API rate limit reached.");
        throw new Error(`GitHub API error: ${res.status}`);
      }

      return await res.text();
    } catch (e) {
      if (e instanceof Error) throw e;
      throw new Error("Something went wrong while fetching PR diff.");
    }
  }

  async fetchFileContent(params: {
    owner: string;
    repo: string;
    path: string;
    githubToken?: string;
  }): Promise<RepoFileContent> {
    const url = `${this.supabaseUrl}/functions/v1/repo-file`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.supabaseKey}`
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
    }

    const data = await res.json();
    if (data?.error) {
      throw new Error(data.error);
    }
    return data as RepoFileContent;
  }

  /**
   * Fetch multiple files in a single batch request (for on-demand mode).
   * Max 10 files per batch.
   */
  async fetchFileBatch(params: {
    owner: string;
    repo: string;
    paths: string[];
    githubToken?: string;
  }): Promise<BatchFetchResult> {
    const url = `${this.supabaseUrl}/functions/v1/repo-fetch-batch`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.supabaseKey}`
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
    }

    const data = await res.json();
    if (data?.error) {
      throw new Error(data.error);
    }
    return data as BatchFetchResult;
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
