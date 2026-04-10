// src/index.ts
import { createClient } from "@supabase/supabase-js";
var CodebaseGPTClient = class {
  supabase;
  supabaseUrl;
  supabaseKey;
  constructor(config) {
    this.supabaseUrl = config.supabaseUrl;
    this.supabaseKey = config.supabaseKey;
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }
  async indexRepository(githubUrl, githubToken, onProgress) {
    onProgress?.(0, "Validating GitHub URL...");
    const { data, error } = await this.supabase.functions.invoke("repo-index", {
      body: { githubUrl, githubToken }
    });
    if (error) throw new Error(error.message || "Failed to index repository");
    if (data?.error) throw new Error(data.error);
    onProgress?.(4, "Complete!");
    return data;
  }
  async generateOverview(repoContext) {
    const { data, error } = await this.supabase.functions.invoke("chat", {
      body: { action: "overview", repoContext }
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
          "How does authentication work?"
        ],
        keyFiles: [],
        keyPatterns: [],
        mainDeps: [],
        languages: []
      };
    }
  }
  async generateSecurityScan(repoContext) {
    const { data, error } = await this.supabase.functions.invoke("chat", {
      body: { action: "security", repoContext }
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
  async generateSystemDesign(repoContext) {
    const { data, error } = await this.supabase.functions.invoke("chat", {
      body: { action: "system-design", repoContext }
    });
    if (error) throw new Error(error.message || "Failed to generate system design");
    if (data?.error) throw new Error(data.error);
    return data.content || "";
  }
  async fetchIssues(owner, repo, state = "open", githubToken) {
    const { data, error } = await this.supabase.functions.invoke("repo-issues", {
      body: { owner, repo, state, githubToken }
    });
    if (error) throw new Error(error.message || "Failed to fetch issues");
    if (data?.error) throw new Error(data.error);
    return data.issues || [];
  }
  async fetchFileContent(params) {
    const { data, error } = await this.supabase.functions.invoke("repo-file", {
      body: params
    });
    if (error) throw new Error(error.message || "Failed to fetch file content");
    if (data?.error) throw new Error(data.error);
    return data;
  }
  async generateOnboardingDoc(repoContext) {
    const { data, error } = await this.supabase.functions.invoke("chat", {
      body: { action: "onboarding", repoContext }
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
    onError
  }) {
    const resp = await fetch(`${this.supabaseUrl}/functions/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.supabaseKey}`
      },
      body: JSON.stringify({ messages, repoContext, action: "chat" })
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
      let newlineIndex;
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
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
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
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
        }
      }
    }
    onDone();
  }
};
export {
  CodebaseGPTClient
};
