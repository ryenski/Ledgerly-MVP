# Ledgerly Architecture

This document describes the current codebase architecture after the first App-Created Workspace lifecycle slice.

## Current System

```mermaid
flowchart TB
  FounderOperator[Founder-Operator]

  subgraph DesktopApp[Ledgerly Local Desktop App]
    subgraph ReactUI[React + TypeScript UI]
      App[src/App.tsx]
      Shell[src/components/AppShell.tsx]
      WorkspaceScreens[src/features/workspace/*]
      WorkspaceApi[src/lib/workspace/api.ts]
      WorkspaceTypes[src/lib/workspace/types.ts]
    end

    subgraph TauriRuntime[Tauri Runtime]
      Commands[src-tauri/src/commands/workspace.rs]
    end

    subgraph RustCore[Rust Workspace Core]
      Create[src-tauri/src/workspace/create.rs]
      Open[src-tauri/src/workspace/open.rs]
      Validation[src-tauri/src/workspace/validation.rs]
      Beancount[src-tauri/src/workspace/beancount.rs]
      Paths[src-tauri/src/workspace/paths.rs]
      Types[src-tauri/src/workspace/types.rs]
      Errors[src-tauri/src/workspace/errors.rs]
    end
  end

  subgraph WorkspaceFolder[App-Created Workspace Folder]
    MainBean[main.bean]
    AccountsBean[accounts.bean]
    OpeningBalances[opening-balances.bean]
    Transactions[transactions/]
    Documents[documents/]
    Imports[imports/]
    Manifest[.ledgerly/workspace.json]
    Sqlite[.ledgerly/ledgerly.sqlite]
    Cache[.ledgerly/cache/]
  end

  FounderOperator --> App
  App --> Shell
  App --> WorkspaceScreens
  WorkspaceScreens --> WorkspaceApi
  WorkspaceApi --> Commands
  Commands --> Create
  Commands --> Open
  Commands --> Validation
  Create --> Beancount
  Create --> Paths
  Create --> Types
  Create --> Errors
  Open --> Validation
  Open --> Types
  Open --> Errors
  Validation --> Errors
  Create --> WorkspaceFolder
  Open --> WorkspaceFolder
  Validation --> MainBean
  Validation --> AccountsBean
  Validation --> OpeningBalances
```

## Runtime Flow

```mermaid
sequenceDiagram
  actor User as Founder-Operator
  participant UI as React Workspace Screens
  participant API as src/lib/workspace/api.ts
  participant Cmd as Tauri Commands
  participant Core as Rust Workspace Core
  participant Disk as Workspace Folder

  User->>UI: Create Workspace
  UI->>API: createWorkspace(input)
  API->>Cmd: invoke("create_workspace")
  Cmd->>Core: create::create_workspace(input)
  Core->>Disk: write Beancount files
  Core->>Disk: write .ledgerly/workspace.json
  Core->>Disk: initialize .ledgerly/ledgerly.sqlite
  Core-->>Cmd: WorkspaceSummary
  Cmd-->>API: WorkspaceSummary
  API-->>UI: WorkspaceSummary
  UI-->>User: Workspace overview

  User->>UI: Open Workspace
  UI->>API: openWorkspace(path)
  API->>Cmd: invoke("open_workspace")
  Cmd->>Core: open::open_workspace(path)
  Core->>Disk: read manifest and required files
  Core->>Core: validation::validate_workspace(path)
  Core-->>Cmd: WorkspaceSummary
  Cmd-->>API: WorkspaceSummary
  API-->>UI: WorkspaceSummary
  UI-->>User: Workspace overview
```

## Workspace Data Ownership

```mermaid
flowchart LR
  subgraph SourceOfTruth[Accounting Source Of Truth]
    MainBean[main.bean]
    AccountsBean[accounts.bean]
    OpeningBalances[opening-balances.bean]
    FutureMonthly[transactions/*.bean future]
  end

  subgraph LedgerlyManaged[Ledgerly-Managed Local Data]
    Manifest[workspace.json]
    Sqlite[ledgerly.sqlite]
    Cache[cache/]
  end

  subgraph CurrentSqlite[Current SQLite Tables]
    Metadata[workspace_metadata]
    OperationLog[operation_log]
    StagingPlaceholder[staging_area_placeholder]
    MappingPlaceholder[source_mappings_placeholder]
    RulesPlaceholder[categorization_rules_placeholder]
    CacheState[cache_state]
  end

  SourceOfTruth --> Validation[Structural Ledger Validation]
  LedgerlyManaged --> OpenWorkspace[Open App-Created Workspace]
  Sqlite --> CurrentSqlite
```

## Boundaries

- React owns presentation state, forms, error rendering, and Workspace overview screens.
- `src/lib/workspace/api.ts` is the frontend boundary to native Workspace commands.
- Tauri commands translate frontend calls into Rust domain operations.
- `src-tauri/src/workspace/` owns Workspace filesystem layout, manifest handling, Beancount rendering, SQLite initialization, path validation, and structural ledger validation.
- The Workspace folder owns all accounting data needed for this slice. No Ledgerly cloud account is required.

## Current Constraints

- Only App-Created Workspaces are supported.
- `USD` is the only supported MVP currency.
- Validation is structural and local; full Beancount parser validation is deferred.
- The UI includes editable path fields so Workspace create/open works even when native directory picker support is unavailable in development.
- Tauri npm packages and Rust crates are pinned to the same `2.0.x` minor line to avoid dev-time version mismatch errors.
- Native Tauri dialog/opener plugin integration remains a future compatibility task.
