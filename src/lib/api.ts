import { CodebaseGPTClient } from "../../packages/sdk/src/index";
import type { FileTreeNode, ChatMessage, OverviewData, RepoMeta } from "@/lib/mock-data";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const client = new CodebaseGPTClient({
  supabaseUrl: SUPABASE_URL,
  supabaseKey: SUPABASE_KEY,
});

export type { IndexedRepo, SecurityFinding, GitHubIssue, GitHubPullRequest, GitHubCommit, RepoFileContent, BatchFetchResult } from "../../packages/sdk/src/index";

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

export async function fetchPullRequests(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
  githubToken?: string
) {
  return client.fetchPullRequests(owner, repo, state, githubToken);
}

export async function fetchCommits(
  owner: string,
  repo: string,
  githubToken?: string
) {
  return client.fetchCommits(owner, repo, githubToken);
}

export async function fetchPullRequestDiff(
  owner: string,
  repo: string,
  prNumber: number,
  githubToken?: string
) {
  return client.fetchPullRequestDiff(owner, repo, prNumber, githubToken);
}

export async function fetchFileContent(params: {
  owner: string;
  repo: string;
  path: string;
  githubToken?: string;
}) {
  return client.fetchFileContent(params);
}

export async function fetchFileBatch(params: {
  owner: string;
  repo: string;
  paths: string[];
  githubToken?: string;
}) {
  return client.fetchFileBatch(params);
}

export async function generateOnboardingDoc(repoContext: string) {
  return client.generateOnboardingDoc(repoContext);
}

export async function streamChat(params: any) {
  return client.streamChat(params);
}
