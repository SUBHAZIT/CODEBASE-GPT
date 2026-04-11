# CodebaseGPT

**CodebaseGPT** is a powerful full-stack toolset designed to help developers understand, navigate, and maintain large codebases using AI. It provides an interactive dashboard, automated security scans, AI-powered PR reviews, and a command-line interface to streamline technical onboarding and repository analysis.

---

## 🚀 Key Features

- **🔍 Intelligent Repository Indexing**: Automatically fetch and analyze GitHub repositories. Supports "on-demand" indexing for massive codebases (skeleton-first lazy loading).
- **💬 AI Chat Interface**: Ask deep questions about your codebase, from architectural patterns to specific bug hunting.
- **📄 Architecture Narratives**: Get high-level, AI-generated overviews of how your project is structured and what technologies it uses.
- **🛡️ Security Scanning**: Automated identification of potential vulnerabilities and security best practices tailored to your code.
- **🤖 PRGPT (AI Code Review)**: Seamlessly integrate AI code reviews into your GitHub Workflows to catch issues before they merge.
- **💻 Developer CLI**: A powerful terminal tool (`codebasegpt`) to index, scan, and generate overviews directly from your workspace.
- **📊 Codebase Visualization**: (In progress) Interactive dependency graphs and file relationship visualizations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [Radix UI](https://www.radix-ui.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Visualization**: [D3.js](https://d3js.org/) + [react-force-graph-2d](https://github.com/vasturiano/react-force-graph)

### Backend
- **Platform**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL
- **Edge Functions**: Deno-based Supabase Edge Functions for indexing, chat, and analytics.
- **Authentication**: Supabase Auth (GitHub/Email).

### CLI / SDK
- **Runtime**: [Node.js](https://nodejs.org/)
- **CLI Framework**: [Commander.js](https://github.com/tj/commander.js)
- **Styling**: [Chalk](https://github.com/chalk/chalk) + [Ora](https://github.com/sindresorhus/ora)

---

## 🏗️ Architecture

The system follows a modular architecture:

1.  **CLI/SDK**: The `codebasegpt` CLI communicates with the **CodebaseGPT SDK**.
2.  **Edge Functions**: The SDK triggers Supabase Edge Functions (`repo-index`, `chat`, etc.).
3.  **Indexing Engine**: The `repo-index` function fetches repo trees and contents from the GitHub API, handling rate limits and large repository optimizations.
4.  **AI Layer**: Repo context is passed to AI models (via Supabase/OpenAI) to generate narratives, scans, and chat responses.
5.  **Frontend Dashboard**: Connects to Supabase to visualize the indexed data, providing a rich UI for developers.

---

## 🛠️ Getting Started

### Local Development

1.  **Clone the Repo**:
    ```bash
    git clone <repo-url>
    cd codebasegpt
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root and in `packages/cli`:
    ```env
    VITE_SUPABASE_URL=your-supabase-url
    VITE_SUPABASE_ANON_KEY=your-supabase-key
    ```

4.  **Run Dev Server**:
    ```bash
    npm run dev
    ```

### Using the CLI

1.  **Install the CLI**:
    ```bash
    npm install -g ./packages/cli
    ```

2.  **Index a Repository**:
    ```bash
    codebasegpt index https://github.com/user/repo
    ```

---

## 🔮 Future Improvements

- **Interactive Dependency Graphs**: Full Canvas-based visualization for massive repositories.
- **Multi-Repo Context**: Chat across multiple related repositories simultaneously.
- **Deep Integrations**: VSC extension for in-editor AI insights.
- **Automated Refactoring Tools**: AI-assisted migration and cleanup suggestions.
- **Advanced Performance Analytics**: Deep analysis of bundle sizes and runtime performance from code.

---

## 📄 License
MIT
