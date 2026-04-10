import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { owner, repo, githubToken, state, labels, page, perPage } = await req.json();

    if (!owner || !repo) {
      return new Response(JSON.stringify({ error: "owner and repo are required" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "CodeOnboard-AI",
    };
    if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

    const params = new URLSearchParams({
      state: state || "open",
      per_page: String(perPage || 30),
      page: String(page || 1),
      sort: "updated",
      direction: "desc",
    });
    if (labels) params.set("labels", labels);

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?${params}`,
      { headers }
    );

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: `GitHub API error: ${res.status}`, details: errText }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const issues = await res.json();

    // Filter out pull requests (GitHub API returns PRs as issues too)
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

    return new Response(JSON.stringify({ issues: filtered }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("repo-issues error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
