# CodebaseGPT CLI

The official command-line interface for CodebaseGPT.

## Installation

```bash
# In packages/cli folder
npm link
```

## Setup

Set the following environment variables or use the `init` command:

```bash
codebasegpt init
```

## Usage

### Index a Repository

```bash
codebasegpt index https://github.com/user/repo
```

### Generate Overview

```bash
codebasegpt overview "your-repo-context-string"
```

### Run Security Scan

```bash
codebasegpt scan "your-repo-context-string"
```

### Open Dashboard

```bash
codebasegpt open "your-repo-id"
```

## Commands

- `init`: Initialize local configuration.
- `index <url>`: Index a GitHub repository.
- `overview <repoContext>`: Generate an overview of an indexed repository.
- `scan <repoContext>`: Run a security scan on an indexed repository.
- `open <repoId>`: Open the repository dashboard in your browser.
- `--help`: Show help.
