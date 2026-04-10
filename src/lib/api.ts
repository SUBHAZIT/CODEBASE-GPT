import { CodebaseGPTClient } from "../../packages/sdk/src/index";
import type { FileTreeNode, ChatMessage, OverviewData, RepoMeta } from "@/lib/mock-data";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const client = new CodebaseGPTClient({
  supabaseUrl: SUPABASE_URL,
  supabaseKey: SUPABASE_KEY,
});

export type { IndexedRepo, SecurityFinding, GitHubIssue, RepoFileContent } from "../../packages/sdk/src/index";

export async function indexRepository(
  githubUrl: string,
  githubToken?: string,
  onProgress?: (stage: number, message: string) => void
) {
  return client.indexRepository(githubUrl, githubToken, onProgress);
}

export async function generateOverview(repoContext: string) {
  return client.generateOverview(repoContext);
}

export async function generateSecurityScan(repoContext: string) {
  return client.generateSecurityScan(repoContext);
}

export async function generateSystemDesign(repoContext: string) {
  return client.generateSystemDesign(repoContext);
}

export async function fetchIssues(
  owner: string,
  repo: string,
  state: "open" | "closed" = "open",
  githubToken?: string
) {
  return client.fetchIssues(owner, repo, state, githubToken);
}

export async function fetchFileContent(params: {
  owner: string;
  repo: string;
  path: string;
  githubToken?: string;
}) {
  return client.fetchFileContent(params);
}

export async function generateOnboardingDoc(repoContext: string) {
  return client.generateOnboardingDoc(repoContext);
}

export async function streamChat(params: any) {
  return client.streamChat(params);
}
