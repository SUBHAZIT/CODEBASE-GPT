#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { CodebaseGPTClient } from "@codebasegpt/sdk";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Load .env from CWD first, then override with CLI package's own .env
dotenv.config(); // loads from CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

const program = new Command();

// --- Local cache helpers ---
const CACHE_DIR = path.join(process.cwd(), ".codebasegpt");

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function saveRepoContext(repoId: string, repoContext: string) {
  ensureCacheDir();
  fs.writeFileSync(path.join(CACHE_DIR, `${repoId}.ctx`), repoContext, "utf-8");
}

function loadRepoContext(repoId: string): string | null {
  const ctxPath = path.join(CACHE_DIR, `${repoId}.ctx`);
  if (fs.existsSync(ctxPath)) {
    return fs.readFileSync(ctxPath, "utf-8");
  }
  return null;
}

function getLatestRepoId(): string | null {
  ensureCacheDir();
  const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".ctx"));
  if (files.length === 0) return null;
  // Return the most recently modified
  const sorted = files
    .map((f) => ({ name: f, mtime: fs.statSync(path.join(CACHE_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return sorted[0].name.replace(".ctx", "");
}

// --- Supabase client ---
const getClient = () => {
  const supabaseUrl = process.env.CODEBASEGPT_SUPABASE_URL || "";
  const supabaseKey = process.env.CODEBASEGPT_SUPABASE_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      chalk.red(
        "Error: CODEBASEGPT_SUPABASE_URL and CODEBASEGPT_SUPABASE_KEY environment variables are required."
      )
    );
    process.exit(1);
  }

  return new CodebaseGPTClient({
    supabaseUrl,
    supabaseKey,
  });
};

/**
 * Resolve repoContext from a repo ID argument, or use the latest indexed repo.
 */
function resolveRepoContext(repoIdArg?: string): { repoId: string; repoContext: string } {
  const repoId = repoIdArg || getLatestRepoId();
  if (!repoId) {
    console.error(chalk.red("Error: No repo ID provided and no previously indexed repos found."));
    console.error(chalk.yellow("Run: codebasegpt index <github-url> first."));
    process.exit(1);
  }

  const ctx = loadRepoContext(repoId);
  if (!ctx) {
    console.error(chalk.red(`Error: No cached context found for repo "${repoId}".`));
    console.error(chalk.yellow("Run: codebasegpt index <github-url> to re-index the repo."));
    process.exit(1);
  }

  return { repoId, repoContext: ctx };
}

program
  .name("codebasegpt")
  .description("Official CLI for CodebaseGPT")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize CodebaseGPT configuration")
  .action(async () => {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      console.log(chalk.yellow("Note: .env file already exists."));
    } else {
      const template = `CODEBASEGPT_SUPABASE_URL=\nCODEBASEGPT_SUPABASE_KEY=\nCODEBASEGPT_DASHBOARD_URL=http://localhost:8080\n`;
      fs.writeFileSync(envPath, template);
      console.log(chalk.green("Created .env template. Please fill in your Supabase credentials."));
    }
  });

program
  .command("version")
  .description("Show the current CLI version")
  .action(() => {
    console.log(chalk.blue(`CodebaseGPT CLI v${program.version()}`));
  });

program
  .command("index")
  .description("Index a GitHub repository")
  .argument("<url>", "GitHub repository URL")
  .option("-t, --token <token>", "GitHub Personal Access Token")
  .action(async (url: string, options: { token?: string }) => {
    const client = getClient();
    const spinner = ora("Indexing repository...").start();
    try {
      const repo = await client.indexRepository(url, options.token, (stage: number, message: string) => {
        spinner.text = `[Stage ${stage}] ${message}`;
      });
      spinner.succeed(chalk.green(`Successfully indexed ${repo.meta.owner}/${repo.meta.name}`));
      console.log(chalk.blue(`Repo ID: ${repo.repoId}`));
      console.log(chalk.blue(`Total Files: ${repo.totalFiles}`));

      // Cache the repo context locally for scan/overview commands
      saveRepoContext(repo.repoId, repo.repoContext);
      console.log(chalk.dim(`Cached repo context to .codebasegpt/${repo.repoId}.ctx`));

      // Auto-open the dashboard after successful indexing
      const { default: open } = await import("open");
      const dashboardUrl = process.env.CODEBASEGPT_DASHBOARD_URL || "http://localhost:8080";
      const dashUrl = `${dashboardUrl}/repo/${repo.repoId}`;
      console.log(chalk.blue(`\nOpening dashboard: ${dashUrl}`));
      try {
        await open(dashUrl);
      } catch {
        console.log(chalk.yellow(`Could not open browser automatically. Please visit: ${dashUrl}`));
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to index repository: ${error.message}`));
    }
  });

program
  .command("overview")
  .description("Generate an overview of an indexed repository")
  .argument("[repoId]", "Repository ID (uses last indexed repo if omitted)")
  .action(async (repoIdArg?: string) => {
    const { repoId, repoContext } = resolveRepoContext(repoIdArg);
    console.log(chalk.dim(`Using repo: ${repoId}`));

    const client = getClient();
    const spinner = ora("Generating overview...").start();
    try {
      const overview = await client.generateOverview(repoContext);
      spinner.succeed(chalk.green("Overview generated!"));
      console.log("\n" + chalk.bold(overview.narrative) + "\n");
      console.log(chalk.blue("Framework:"), overview.framework);
      console.log(chalk.blue("Complexity:"), overview.complexity);
      console.log(chalk.blue("Languages:"), overview.languages.join(", "));
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to generate overview: ${error.message}`));
    }
  });

program
  .command("scan")
  .description("Run a security scan on an indexed repository")
  .argument("[repoId]", "Repository ID (uses last indexed repo if omitted)")
  .action(async (repoIdArg?: string) => {
    const { repoId, repoContext } = resolveRepoContext(repoIdArg);
    console.log(chalk.dim(`Using repo: ${repoId}`));

    const client = getClient();
    const spinner = ora("Running security scan...").start();
    try {
      const findings = await client.generateSecurityScan(repoContext);
      spinner.succeed(chalk.green(`Scan complete! Found ${findings.length} findings.`));
      
      findings.forEach((f: any, i: number) => {
        console.log(`\n${i + 1}. ${chalk.bold(f.title)} [${chalk.yellow(f.severity.toUpperCase())}]`);
        console.log(chalk.dim(`File: ${f.file}${f.line ? `:${f.line}` : ""}`));
        console.log(f.description);
        console.log(chalk.blue("Recommendation:"), f.recommendation);
      });
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to run security scan: ${error.message}`));
    }
  });

program
  .command("open")
  .description("Open the repository dashboard in your browser")
  .argument("[repoId]", "Repository ID (uses last indexed repo if omitted)")
  .action(async (repoIdArg?: string) => {
    const repoId = repoIdArg || getLatestRepoId();
    if (!repoId) {
      console.error(chalk.red("Error: No repo ID provided and no previously indexed repos found."));
      process.exit(1);
    }

    const { default: open } = await import("open");
    const dashboardUrl = process.env.CODEBASEGPT_DASHBOARD_URL || "http://localhost:8080";
    
    const url = `${dashboardUrl}/repo/${repoId}`;
    console.log(chalk.blue(`Opening dashboard: ${url}`));
    try {
      await open(url);
    } catch (error: any) {
      console.log(chalk.yellow(`Could not open browser automatically. Please visit: ${url}`));
    }
  });

program.parse(process.argv);
