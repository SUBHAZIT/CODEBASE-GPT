export interface ChangelogEntry {
  version: string;
  date: string;
  type: "Major Update" | "Performance" | "Security" | "Refinement";
  changes: string[];
  isLatest?: boolean;
}

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "v2.5.0-stable",
    date: "March 21, 2026",
    type: "Major Update",
    isLatest: true,
    changes: [
      "Global HUD Theme Expansion: Standardized 'cool and classic' aesthetics with blueprint grids and teal glows across all sub-pages.",
      "Seamless Private Repo Indexing: Automated GitHub provider token detection from login session, eliminating manual PAT requirements.",
      "Real-time Analytics: Integrated unique visitor tracking with Supabase and dynamic 'CountUp' statistics on the landing page.",
      "Robust Resource Diagnostics: Enhanced Edge Function error handling with descriptive feedback for private repository access issues.",
      "Typography & Brand Polish: Unified premium serif typography and wide-tracked all-caps metadata for a cohesive system experience."
    ]
  },
  {
    version: "v2.3.0-stable",
    date: "March 20, 2026",
    type: "Major Update",
    isLatest: false,
    changes: [
      "Released 'Architectural Suite': 8 new high-fidelity sub-pages with professional technical content.",
      "Optimized rendering engine: 60FPS scrolling achieved by refining backdrop-blur and pruning heavy animations.",
      "Synchronized system backgrounds: Unified sub-page aesthetics with the main landing environment.",
      "Streamlined navigation: Removed global navbar in favor of a dedicated 'Back to Homepage' gesture.",
      "Enhanced glassmorphism: Refined surface layering for improved readability and premium feel."
    ]
  },
  {
    version: "v2.2.0-stable",
    date: "March 18, 2026",
    type: "Major Update",
    changes: [
      "Implemented Advanced System Design Visualization using Mermaid.js integration.",
      "Introduced hyper-realistic glassmorphism across the entire landing suite.",
      "Optimized global vector search with 45% lower latency on large repositories."
    ]
  },
  {
    version: "v2.1.4-patch",
    date: "March 05, 2026",
    type: "Security",
    changes: [
      "Enhanced secret detection algorithm to identify complex JWT and OAuth patterns.",
      "Resolved token expiration issues during deep background indexing.",
      "Added manual refresh trigger for incremental repository sync."
    ]
  }
];
