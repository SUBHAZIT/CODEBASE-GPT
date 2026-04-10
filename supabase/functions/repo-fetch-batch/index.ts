import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_BATCH_SIZE = 10;
const MAX_CHARS_PER_FILE = 200_000;

function encodeGitHubPath(path: string) {
  return path
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { owner, repo, paths, githubToken } = await req.json();

    if (!owner || !repo || !Array.isArray(paths) || paths.length === 0) {
      return new Response(
        JSON.stringify({ error: "owner, repo, and paths[] are required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enforce batch size limit
    const batchPaths = paths.slice(0, MAX_BATCH_SIZE);

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "CodeOnboard-AI",
    };
    if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchFile = async (
      filePath: string
    ): Promise<{ path: string; content: string; size: number; error?: string }> => {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(filePath)}`;

      let res = await fetch(url, { headers });

      // Retry once on rate limit
      if (!res.ok && (res.status === 403 || res.status === 429)) {
        console.warn(`Rate limit hit for ${filePath}, retrying in 1s...`);
        await delay(1000);
        res = await fetch(url, { headers });
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Failed to fetch ${filePath} (HTTP ${res.status}): ${errText}`);
        return { path: filePath, content: "", size: 0, error: `HTTP ${res.status}` };
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        return { path: filePath, content: "", size: 0, error: "Path is a directory" };
      }

      if (data.encoding !== "base64" || !data.content) {
        return { path: filePath, content: "", size: 0, error: "Unsupported encoding" };
      }

      let content = "";
      try {
        content = atob(String(data.content).replace(/\s/g, ""));
      } catch {
        return { path: filePath, content: "", size: 0, error: "Decode failed" };
      }

      const truncated = content.length > MAX_CHARS_PER_FILE;
      return {
        path: filePath,
        content: truncated ? content.slice(0, MAX_CHARS_PER_FILE) : content,
        size: Number(data.size || content.length),
      };
    };

    // Fetch files with concurrency of 3
    const CONCURRENCY = 3;
    const results: { path: string; content: string; size: number; error?: string }[] = [];

    for (let i = 0; i < batchPaths.length; i += CONCURRENCY) {
      const group = batchPaths.slice(i, i + CONCURRENCY).map(fetchFile);
      const groupResults = await Promise.all(group);
      results.push(...groupResults);
      if (i + CONCURRENCY < batchPaths.length) await delay(50);
    }

    return new Response(
      JSON.stringify({
        files: results,
        fetched: results.filter((r) => !r.error).length,
        errors: results.filter((r) => r.error).length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("repo-fetch-batch error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal Server Error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
