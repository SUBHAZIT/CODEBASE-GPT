import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Provider Configuration ──────────────────────────────────────────────────
interface ProviderConfig {
  name: string;
  url: string;
  model: string;
  getKey: () => string | undefined;
}

const PROVIDERS: ProviderConfig[] = [
  {
    name: "gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    model: "gemini-2.0-flash",
    getKey: () => Deno.env.get("GOOGLE_GEMINI_API_KEY"),
  },
  {
    name: "openai",
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    getKey: () => Deno.env.get("OPENAI_API_KEY"),
  },
];

// Lovable gateway as last-resort fallback
const LOVABLE_FALLBACK: ProviderConfig = {
  name: "lovable",
  url: "https://ai.gateway.lovable.dev/v1/chat/completions",
  model: "google/gemini-3-flash-preview",
  getKey: () => Deno.env.get("LOVABLE_API_KEY"),
};

// ── Rate-Limit Tracker (in-memory per isolate) ─────────────────────────────
const COOLDOWN_MS = 60_000; // 60-second cooldown after a 429
const rateLimitState: Record<string, number> = {}; // provider name → blockedUntil timestamp

function isProviderAvailable(provider: ProviderConfig): boolean {
  const key = provider.getKey();
  if (!key) return false;
  const blockedUntil = rateLimitState[provider.name] || 0;
  return Date.now() >= blockedUntil;
}

function markRateLimited(providerName: string) {
  rateLimitState[providerName] = Date.now() + COOLDOWN_MS;
  console.log(`[rate-limit] ${providerName} blocked for ${COOLDOWN_MS / 1000}s`);
}

function getAvailableProviders(): ProviderConfig[] {
  const available = PROVIDERS.filter(isProviderAvailable);
  // If no primary providers available, try Lovable gateway
  if (available.length === 0 && LOVABLE_FALLBACK.getKey()) {
    return [LOVABLE_FALLBACK];
  }
  return available;
}

// ── AI Fetch with Failover ──────────────────────────────────────────────────
async function fetchWithFailover(
  body: Record<string, unknown>,
  isStreaming: boolean,
): Promise<Response> {
  const available = getAvailableProviders();

  if (available.length === 0) {
    return new Response(
      JSON.stringify({
        error: "All AI providers are currently rate-limited. Please try again in ~60 seconds.",
      }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let lastError: Response | null = null;

  for (const provider of available) {
    const apiKey = provider.getKey()!;
    console.log(`[ai] trying provider: ${provider.name} (${provider.model})`);

    try {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          model: provider.model,
          stream: isStreaming,
        }),
      });

      if (response.ok) {
        console.log(`[ai] success with ${provider.name}`);
        return response;
      }

      // Rate limited → mark and try next provider
      if (response.status === 429) {
        markRateLimited(provider.name);
        console.warn(`[ai] 429 from ${provider.name}, trying next provider...`);
        lastError = response;
        continue;
      }

      // Payment / quota error → try next provider
      if (response.status === 402 || response.status === 403) {
        console.warn(`[ai] ${response.status} from ${provider.name}, trying next provider...`);
        lastError = response;
        continue;
      }

      // Other errors (400, 500, etc.) — return directly
      const errorText = await response.text();
      console.error(`[ai] ${provider.name} error ${response.status}:`, errorText.slice(0, 300));
      return new Response(
        JSON.stringify({ error: `AI service error from ${provider.name} (${response.status}): ${errorText.slice(0, 200)}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (fetchErr) {
      console.error(`[ai] fetch error for ${provider.name}:`, fetchErr);
      lastError = new Response(
        JSON.stringify({ error: `Failed to reach ${provider.name}: ${fetchErr}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
      continue;
    }
  }

  // All providers failed (rate-limited cascade)
  if (lastError) {
    return new Response(
      JSON.stringify({
        error: "All AI providers are currently unavailable (rate-limited or unreachable). Please try again in ~60 seconds.",
      }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ error: "No AI API key configured. Please add a Google Gemini or OpenAI API key." }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

// ── Main Server ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, repoContext, action } = await req.json();

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
      // Regular chat - RAG-style with repo context
      systemPrompt = `You are CodebaseGPT, an expert software architect and senior developer. Your job is to provide highly structured, in-depth, and deeply technical answers to questions about the ongoing codebase.

RULES for your responses:
1. USE STRUCTURE: Always use Markdown headers (e.g., ### Overview, ### Architecture) to organize your response cleanly. 
2. BE IN-DEPTH: Do not give superficial summaries. Dive deep into the code, algorithms, patterns, and data flow.
3. USE BULLET POINTS: Use bulleted and numbered lists extensively to break down complex logic step-by-step.
4. SHOW EXAMPLES: Provide precise code snippets from the codebase to back up your points, maintaining original syntax and language hints.
5. CITE SOURCES: Always cite exact file paths and line numbers naturally (e.g., \`[src/index.ts:15-30]\`) so the developer can follow along.
6. BE PROFESSIONAL: Provide rigorous technical documentation and architectural reviews. Forget conversational fluff.
7. ACCURACY IS CRITICAL: Base your analysis strictly on the provided context. If you lack context, clearly state what is missing instead of guessing.

CODEBASE CONTEXT:
\${repoContext || "No specific repo context provided. Answer based on general software engineering knowledge."}`;
    }

    const isStreaming = action !== "overview" && action !== "onboarding" && action !== "security" && action !== "system-design";

    const requestBody = {
      messages: [
        { role: "system", content: systemPrompt },
        ...userMessages,
      ],
    };

    const response = await fetchWithFailover(requestBody, isStreaming);

    // If our failover wrapper already returned an error JSON, pass it through
    if (!response.ok) {
      return new Response(response.body, {
        status: response.status,
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
