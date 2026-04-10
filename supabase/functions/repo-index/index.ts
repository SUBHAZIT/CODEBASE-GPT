import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// File extensions to include
const SOURCE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java", ".rb",
  ".vue", ".svelte", ".css", ".scss", ".html", ".json", ".yaml", ".yml",
  ".toml", ".md", ".sql", ".graphql", ".prisma", ".env.example",
]);

// Directories to exclude
const EXCLUDED_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", "__pycache__",
  ".cache", "coverage", ".turbo", ".vercel", "vendor", "target",
]);

function shouldIncludeFile(path: string): boolean {
  // Check excluded dirs
  const parts = path.split("/");
  for (const part of parts) {
    if (EXCLUDED_DIRS.has(part)) return false;
  }
  // Check file extension
  const ext = "." + path.split(".").pop()?.toLowerCase();
  if (SOURCE_EXTENSIONS.has(ext)) return true;
  // Include specific files
  const fileName = parts[parts.length - 1];
  if (["package.json", "README.md", "Dockerfile", "Makefile", "Cargo.toml", "go.mod"].includes(fileName)) return true;
  return false;
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { githubUrl, githubToken } = await req.json();
    console.log(`Indexing repository: ${githubUrl}`);

    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      return new Response(JSON.stringify({ error: "Invalid GitHub URL" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { owner, repo } = parsed;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "CodeOnboard-AI",
    };
    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
      console.log("Using provided GitHub token (starts with: " + githubToken.substring(0, 4) + ")");
    } else {
      console.log("No GitHub token provided to Edge Function");
    }

    // Step 1: Get repo info
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      const errText = await repoRes.text();
      let errorMsg = `GitHub API error: ${repoRes.status}`;
      if (repoRes.status === 404) errorMsg = "Repository not found or private (access denied)";
      if (repoRes.status === 401 || repoRes.status === 403) errorMsg = "GitHub API authorization failed or rate limit exceeded";

      console.error(`GitHub API error (Repo Info): ${repoRes.status}`, errText);
      return new Response(JSON.stringify({ error: errorMsg, details: errText }), {
        status: 200, // Return 200 so the client can read the error message
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const repoInfo = await repoRes.json();

    // Step 2: Get file tree (recursive)
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoInfo.default_branch}?recursive=1`,
      { headers }
    );
    if (!treeRes.ok) {
      const errText = await treeRes.text();
      return new Response(JSON.stringify({ error: "Failed to fetch file tree", details: errText }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const treeData = await treeRes.json();

    // Filter source files
    const sourceFiles = (treeData.tree || [])
      .filter((item: any) => item.type === "blob" && shouldIncludeFile(item.path))
    // Step 3: Download file contents (low-concurrency ordered fetch to avoid rate limits)
    const filesToFetch = sourceFiles.slice(0, 200);
    const fileContents: { path: string; content: string; size: number }[] = new Array(filesToFetch.length);
    const CONCURRENCY = 3;

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchFile = async (idx: number, retry = false) => {
      const file = filesToFetch[idx];
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
          { headers }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.encoding === "base64" && data.content) {
            const decoded = atob(data.content.replace(/\n/g, ""));
            fileContents[idx] = {
              path: file.path,
              content: decoded.slice(0, 3000),
              size: data.size,
            };
          }
        } else if ((res.status === 403 || res.status === 429) && !retry) {
          // Automatic retry once for rate limit errors
          console.warn(`Rate limit hit for ${file.path}, retrying in 1s...`);
          await delay(1000);
          return fetchFile(idx, true);
        } else {
          const errText = await res.text();
          console.error(`Failed to fetch ${file.path} (HTTP ${res.status}): ${errText}`);
          fileContents[idx] = {
            path: file.path,
            content: `// Warning: Failed to fetch (HTTP ${res.status}).`,
            size: 0,
          };
        }
      } catch (e) {
        console.error(`Network error fetching ${file.path}:`, e);
        fileContents[idx] = {
          path: file.path,
          content: `// Warning: Fetch Error: ${e instanceof Error ? e.message : "Unknown"}.`,
          size: 0,
        };
      }
    };

    // Process in small groups to maintain concurrency limit
    for (let i = 0; i < filesToFetch.length; i += CONCURRENCY) {
      const group = [];
      for (let j = 0; j < CONCURRENCY && (i + j) < filesToFetch.length; j++) {
        group.push(fetchFile(i + j));
      }
      await Promise.all(group);
      await delay(50); // Tiny pause between groups
    }

    // Filter out any undefineds if some failed catastrophically
    const validContents = fileContents.filter(f => f !== undefined);

    // Build file tree structure
    const fileTree = buildFileTree(sourceFiles.map((f: any) => f.path));

    // Build context string for AI
    const repoContext = validContents
      .map((f) => `--- ${f.path} ---\n${f.content}`)
      .join("\n\n");

    return new Response(
      JSON.stringify({
        repoId: `gh-${owner}-${repo}-${Date.now().toString(36)}`,
        meta: {
          id: `gh-${owner}-${repo}`,
          name: repo,
          owner,
          description: repoInfo.description || "",
          stars: repoInfo.stargazers_count,
          language: repoInfo.language || "Unknown",
          fileCount: sourceFiles.length,
          framework: "Detected",
          complexity: sourceFiles.length > 1000 ? "Enterprise" : sourceFiles.length > 500 ? "High" : sourceFiles.length > 100 ? "Medium" : "Low",
        },
        fileTree,
        fileContents: validContents,
        repoContext,
        totalFiles: sourceFiles.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("repo-index error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildFileTree(paths: string[]): any[] {
  const root: any[] = [];
  const map = new Map<string, any>();

  for (const path of paths) {
    const parts = path.split("/");
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!map.has(currentPath)) {
        const isFile = i === parts.length - 1;
        const node: any = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "folder",
        };
        if (!isFile) node.children = [];
        if (isFile) {
          const ext = part.split(".").pop()?.toLowerCase() || "";
          const langMap: Record<string, string> = {
            ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
            py: "python", go: "go", rs: "rust", java: "java", rb: "ruby",
            css: "css", html: "html", json: "json", md: "markdown", sql: "sql",
          };
          node.language = langMap[ext] || ext;
        }

        map.set(currentPath, node);

        if (parentPath && map.has(parentPath)) {
          map.get(parentPath).children.push(node);
        } else if (!parentPath) {
          root.push(node);
        }
      }
    }
  }

  return root;
}
