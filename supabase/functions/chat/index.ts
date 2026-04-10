import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-2.0-flash";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, repoContext, action } = await req.json();

    // Prefer user's own Gemini key, fall back to Lovable AI gateway
    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const useGeminiDirect = !!GOOGLE_GEMINI_API_KEY;
    const apiUrl = useGeminiDirect ? GEMINI_API_URL : "https://ai.gateway.lovable.dev/v1/chat/completions";
    const apiKey = useGeminiDirect ? GOOGLE_GEMINI_API_KEY : LOVABLE_API_KEY;
    const model = useGeminiDirect ? GEMINI_MODEL : "google/gemini-3-flash-preview";

    if (!apiKey) throw new Error("No AI API key configured. Please add a Google Gemini API key.");

    let systemPrompt = "";
    let userMessages = messages || [];

    if (action === "overview") {
      systemPrompt = `You are CodebaseGPT, an expert code analyst. Analyze the provided codebase context and return a JSON object with these fields:
{
  "narrative": "A 2-3 sentence plain-English description of the architecture",
  "framework": "Primary framework detected (e.g. Next.js 14, FastAPI, Rails)",
  "complexity": "Low | Medium | High | Enterprise",
  "suggestedQs": ["array of exactly 8 insightful questions about this codebase"],
  "keyFiles": ["top 5 most important files to read first"],
  "keyPatterns": ["3-5 architectural patterns used"],
  "mainDeps": ["top 8 dependencies"],
  "languages": [{"name": "TypeScript", "percentage": 78}]
}
Return ONLY valid JSON, no markdown.`;
      userMessages = [{ role: "user", content: `Analyze this codebase:\n\n${repoContext}` }];
    } else if (action === "onboarding") {
      systemPrompt = `You are CodebaseGPT. Generate a comprehensive onboarding guide in markdown format for a developer joining this project. Include:
# Onboarding Guide

## 🚀 Quick Start
- 3 commands to get running

## 📁 Files to Read First
- Top 5 files with explanations of why they matter

## 🏗️ Architecture Patterns
- Key patterns used and where to find them

## ⚠️ Gotchas & Tips
- 3-5 common pitfalls new developers face

## 🔧 Key Tools & Dependencies
- Important tools and what they do

Make it practical, actionable, and welcoming.`;
      userMessages = [{ role: "user", content: `Generate an onboarding guide for this codebase:\n\n${repoContext}` }];
    } else if (action === "security") {
      systemPrompt = `You are CodebaseGPT Security Auditor. You must produce DETERMINISTIC, CONSISTENT results. Analyze the codebase methodically using this exact checklist in this exact order. For each category, check if the issue exists. Only report REAL findings backed by evidence in the code.

CHECKLIST (check in this exact order):
1. SEC-001: Hardcoded secrets or API keys in source code
2. SEC-002: Missing or permissive CORS configuration
3. SEC-003: SQL injection or NoSQL injection risks
4. SEC-004: Cross-site scripting (XSS) vulnerabilities
5. SEC-005: Missing input validation on user-facing endpoints
6. SEC-006: Insecure authentication patterns (e.g., no token validation)
7. SEC-007: Missing rate limiting on public endpoints
8. SEC-008: Sensitive data exposure in client-side code
9. SEC-009: Insecure dependency usage or known vulnerable packages
10. SEC-010: Missing CSRF protection
11. SEC-011: Insecure file upload/handling
12. SEC-012: Missing or weak RLS/authorization policies

For each finding, return this exact JSON shape:
{
  "id": "SEC-XXX (from checklist above)",
  "severity": "critical" | "high" | "medium" | "low" | "info",
  "title": "Short title",
  "description": "1-2 sentence explanation with specific evidence from the code",
  "file": "exact file path or 'General'",
  "line": "line number/range or null",
  "recommendation": "Specific actionable fix"
}

RULES:
- Only report issues you can PROVE from the code context. Do not speculate.
- Use the exact SEC-XXX IDs from the checklist.
- Assign severity consistently: hardcoded secrets = critical, missing auth = high, missing validation = medium, missing rate limiting = low, best practice suggestions = info.
- Return ONLY a valid JSON array, no markdown, no wrapping text.`;
      userMessages = [{ role: "user", content: `Perform a security audit of this codebase:\n\n${repoContext}` }];
    } else if (action === "system-design") {
      systemPrompt = `You are CodebaseGPT System Architect. Generate a comprehensive system design document for this codebase. Use markdown format with these sections:

# System Design Document

## 1. System Overview
A high-level description of what this system does.

## 2. Architecture Diagram (Text)
An ASCII-art or text-based architecture diagram showing major components and their relationships. Use boxes and arrows.

## 3. Component Breakdown
For each major component/module: name, responsibility, key files, and interfaces.

## 4. Data Flow
How data moves through the system from user input to storage and back.

## 5. Database Schema
Tables, relationships, and key fields (if applicable).

## 6. API Design
Key API endpoints or function interfaces.

## 7. Technology Stack
All technologies, frameworks, and tools used.

## 8. Scalability & Performance
Current bottlenecks, caching strategies, and scaling recommendations.

## 9. Security Architecture
Auth flow, data protection, and security boundaries.

## 10. Deployment Architecture
How the system is deployed and infrastructure requirements.

Be thorough, technical, and precise. Reference actual files and code patterns from the codebase.`;
      userMessages = [{ role: "user", content: `Generate a complete system design document for this codebase:\n\n${repoContext}` }];
    } else {
      // Regular chat - RAG-style with repo context
      systemPrompt = `You are CodebaseGPT, a friendly and knowledgeable codebase assistant. You help developers understand codebases by answering their questions in a natural, conversational tone.

RULES:
1. NEVER use markdown headers (no #, ##, ###, etc.). Write in plain conversational paragraphs.
2. NEVER use bullet point lists with - or *. Instead, explain things naturally in flowing sentences or short paragraphs.
3. You CAN use code blocks with language hints for code snippets — that's fine.
4. You CAN use bold (**text**) and inline code (\`text\`) for emphasis.
5. Cite file paths and line numbers naturally in your text, e.g., "you can find this in \`lib/auth.ts:42-67\`"
6. Keep your tone casual and helpful — like a senior dev explaining things to a teammate.
7. If asked "what happens when X?", walk through the code step by step using numbered sentences (1. First... 2. Then...).
8. Reference specific functions, classes, and patterns by name.
9. If you don't know something from the context, say so honestly.
10. Keep responses concise and direct. Don't over-explain.

CODEBASE CONTEXT:
${repoContext || "No specific repo context provided. Answer based on general software engineering knowledge."}`;
    }

    const isStreaming = action !== "overview" && action !== "onboarding" && action !== "security" && action !== "system-design";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...userMessages,
        ],
        stream: isStreaming,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI API error:", response.status, text);
      return new Response(JSON.stringify({ error: `AI service error (${response.status}): ${text.slice(0, 200)}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Non-streaming responses
    if (!isStreaming) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Streaming response for chat
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
