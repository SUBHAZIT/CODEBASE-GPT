interface FileTreeNode {
    name: string;
    path: string;
    type: "file" | "directory";
    size?: number;
    children?: FileTreeNode[];
}
interface RepoMeta {
    owner: string;
    name: string;
    description?: string;
    stars?: number;
    forks?: number;
    language?: string;
}
interface IndexedRepo {
    repoId: string;
    meta: RepoMeta;
    fileTree: FileTreeNode[];
    fileContents: {
        path: string;
        content: string;
        size: number;
    }[];
    repoContext: string;
    totalFiles: number;
}
interface OverviewData {
    narrative: string;
    framework: string;
    complexity: string;
    suggestedQs: string[];
    keyFiles: string[];
    keyPatterns: string[];
    mainDeps: string[];
    languages: string[];
}
interface SecurityFinding {
    id: string;
    severity: "critical" | "high" | "medium" | "low" | "info";
    title: string;
    description: string;
    file: string;
    line: string | null;
    recommendation: string;
}
interface GitHubIssue {
    number: number;
    title: string;
    body: string;
    state: string;
    labels: {
        name: string;
        color: string;
    }[];
    user: {
        login: string;
        avatar_url: string;
    };
    comments: number;
    created_at: string;
    updated_at: string;
    html_url: string;
}
interface RepoFileContent {
    path: string;
    content: string;
    size: number;
    truncated?: boolean;
}
interface CodebaseGPTConfig {
    supabaseUrl: string;
    supabaseKey: string;
}
declare class CodebaseGPTClient {
    private supabase;
    private supabaseUrl;
    private supabaseKey;
    constructor(config: CodebaseGPTConfig);
    indexRepository(githubUrl: string, githubToken?: string, onProgress?: (stage: number, message: string) => void): Promise<IndexedRepo>;
    generateOverview(repoContext: string): Promise<OverviewData>;
    generateSecurityScan(repoContext: string): Promise<SecurityFinding[]>;
    generateSystemDesign(repoContext: string): Promise<string>;
    fetchIssues(owner: string, repo: string, state?: "open" | "closed", githubToken?: string): Promise<GitHubIssue[]>;
    fetchFileContent(params: {
        owner: string;
        repo: string;
        path: string;
        githubToken?: string;
    }): Promise<RepoFileContent>;
    generateOnboardingDoc(repoContext: string): Promise<string>;
    streamChat({ messages, repoContext, onDelta, onDone, onError, }: {
        messages: {
            role: string;
            content: string;
        }[];
        repoContext: string;
        onDelta: (text: string) => void;
        onDone: () => void;
        onError?: (error: string) => void;
    }): Promise<void>;
}

export { CodebaseGPTClient, type CodebaseGPTConfig, type FileTreeNode, type GitHubIssue, type IndexedRepo, type OverviewData, type RepoFileContent, type RepoMeta, type SecurityFinding };
