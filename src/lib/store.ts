import { create } from "zustand";
import type { RepoMeta, OverviewData, FileTreeNode } from "@/lib/mock-data";

interface RepoFile {
  path: string;
  content: string;
  size: number;
}

interface RepoStore {
  repoId: string | null;
  meta: RepoMeta | null;
  overview: OverviewData | null;
  fileTree: FileTreeNode[];
  fileContents: RepoFile[];
  repoContext: string;
  githubToken: string | null;
  isIndexing: boolean;
  indexingStage: number;
  indexingMessage: string;
  
  // IDE State
  openedFiles: string[]; // Paths of currently open tabs
  activeFilePath: string | null;
  dirtyFiles: Set<string>;
  terminalLogs: { type: 'info' | 'error' | 'success' | 'command'; message: string; timestamp: Date }[];

  setRepoData: (data: {
    repoId: string;
    meta: RepoMeta;
    fileTree: FileTreeNode[];
    fileContents: RepoFile[];
    repoContext: string;
    githubToken?: string;
  }) => void;
  setOverview: (overview: OverviewData) => void;
  setIndexing: (isIndexing: boolean, stage?: number, message?: string) => void;
  upsertFileContent: (file: RepoFile) => void;
  
  // IDE Actions
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  addTerminalLog: (log: { type: 'info' | 'error' | 'success' | 'command'; message: string }) => void;
  clearTerminal: () => void;
  setFileDirty: (path: string, isDirty: boolean) => void;
  
  reset: () => void;
}

export const useRepoStore = create<RepoStore>((set) => ({
  repoId: null,
  meta: null,
  overview: null,
  fileTree: [],
  fileContents: [],
  repoContext: "",
  githubToken: null,
  isIndexing: false,
  indexingStage: 0,
  indexingMessage: "",

  openedFiles: [],
  activeFilePath: null,
  dirtyFiles: new Set(),
  terminalLogs: [
    { type: 'info', message: 'IDE Neural Core Initialized.', timestamp: new Date() },
    { type: 'info', message: 'Ready for repository interaction.', timestamp: new Date() }
  ],

  setRepoData: (data) =>
    set({
      repoId: data.repoId,
      meta: data.meta,
      fileTree: data.fileTree,
      fileContents: data.fileContents,
      repoContext: data.repoContext,
      githubToken: data.githubToken || null,
    }),

  setOverview: (overview) => set({ overview }),

  setIndexing: (isIndexing, stage = 0, message = "") =>
    set({ isIndexing, indexingStage: stage, indexingMessage: message }),

  openFile: (path) => set((state) => {
    if (state.openedFiles.includes(path)) return { activeFilePath: path };
    return { 
      openedFiles: [...state.openedFiles, path],
      activeFilePath: path
    };
  }),

  closeFile: (path) => set((state) => {
    const nextOpened = state.openedFiles.filter(f => f !== path);
    let nextActive = state.activeFilePath;
    if (nextActive === path) {
      nextActive = nextOpened.length > 0 ? nextOpened[nextOpened.length - 1] : null;
    }
    return { openedFiles: nextOpened, activeFilePath: nextActive };
  }),

  setActiveFile: (path) => set({ activeFilePath: path }),

  addTerminalLog: (log) => set((state) => ({
    terminalLogs: [...state.terminalLogs, { ...log, timestamp: new Date() }].slice(-100)
  })),

  clearTerminal: () => set({ terminalLogs: [] }),

  setFileDirty: (path, isDirty) => set((state) => {
    const next = new Set(state.dirtyFiles);
    if (isDirty) next.add(path);
    else next.delete(path);
    return { dirtyFiles: next };
  }),

  upsertFileContent: (file) =>
    set((state) => {
      const idx = state.fileContents.findIndex((f) => f.path === file.path);
      const nextDirty = new Set(state.dirtyFiles);
      nextDirty.add(file.path);

      if (idx === -1) return { 
        fileContents: [...state.fileContents, file],
        dirtyFiles: nextDirty
      };
      
      const nextContents = [...state.fileContents];
      nextContents[idx] = { ...nextContents[idx], ...file };
      return { 
        fileContents: nextContents,
        dirtyFiles: nextDirty
      };
    }),

  reset: () =>
    set({
      repoId: null,
      meta: null,
      overview: null,
      fileTree: [],
      fileContents: [],
      repoContext: "",
      githubToken: null,
      isIndexing: false,
      indexingStage: 0,
      indexingMessage: "",
      openedFiles: [],
      activeFilePath: null,
      dirtyFiles: new Set(),
      terminalLogs: [],
    }),
}));
