import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_CHARS = 200_000;

function encodeGitHubPath(path: string) {
  return path
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { owner, repo, path, githubToken } = await req.json();

    if (!owner || !repo || !path) {
      return new Response(JSON.stringify({ error: "owner, repo and path are required" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "CodeOnboard-AI",
    };
    if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeGitHubPath(path)}`;
    
    // Retry logic for 403/429
    let res = await fetch(url, { headers });
    if (!res.ok && (res.status === 403 || res.status === 429)) {
       console.warn(`Rate limit hit for ${path}, retrying in 1s...`);
       await new Promise(r => setTimeout(r, 1000));
       res = await fetch(url, { headers });
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error(`GitHub API error (${res.status}) for ${path}: ${errText}`);
      return new Response(
        JSON.stringify({ error: `GitHub API error: ${res.status}`, details: errText }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return new Response(JSON.stringify({ error: "Path is a directory, not a file" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (data.encoding !== "base64" || !data.content) {
      return new Response(JSON.stringify({ error: "Unsupported file encoding" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use a more memory-safe decode for large files
    let content = "";
    try {
      content = atob(String(data.content).replace(/\s/g, ""));
    } catch (atobErr) {
      console.error(`atob failure for ${path}:`, atobErr);
      return new Response(JSON.stringify({ error: "Failed to decode file content" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const truncated = content.length > MAX_CHARS;
    const finalContent = truncated ? content.slice(0, MAX_CHARS) : content;

    return new Response(
      JSON.stringify({
        path,
        size: Number(data.size || content.length),
        truncated,
        content: finalContent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("repo-file crash:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Internal Server Error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
