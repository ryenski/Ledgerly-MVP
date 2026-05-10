# App-Created Workspace Layout

Issue 1 creates the first local Workspace lifecycle for Ledgerly. A Founder-Operator can create an App-Created Workspace for an MVP Business, close the app, and reopen that Workspace from disk.

```text
Acme Studio/
  main.bean
  accounts.bean
  opening-balances.bean
  transactions/
    .gitkeep
  documents/
    .gitkeep
  imports/
    .gitkeep
  .ledgerly/
    workspace.json
    ledgerly.sqlite
    cache/
      .gitkeep
```

## Beancount Files

The Beancount files are the accounting source of truth. `main.bean` includes the generated Starter Chart of Accounts in `accounts.bean` and the editable opening balance notes in `opening-balances.bean`.

The Starter Chart of Accounts is intentionally small and editable. It targets one cash-basis US service MVP Business using `USD`.

## Ledgerly-Managed Local Data

`.ledgerly/` stores Ledgerly-managed local data:

- `workspace.json` identifies the folder as an App-Created Workspace.
- `ledgerly.sqlite` stores local workflow and cache state.
- `.ledgerly/cache/` is reserved for rebuildable cache files.

SQLite does not replace the ledger. It exists so later slices can add staging, source mappings, categorization rules, operation logs, and cache state while keeping the Workspace local-first.

## Validation Scope

Issue 1 uses structural validation:

- required files exist
- `main.bean` includes the expected files
- account open directives have valid dates, account names, and `USD` currency

Full Beancount parser validation is deferred until later ledger validation, approval, and reporting slices.

## Folder Selection

The create and open screens include editable path fields so the Workspace lifecycle works even when native directory picker support is unavailable in development. The frontend keeps a directory-picker API seam for a future compatible Tauri dialog plugin.

## Out Of Scope

The MVP currently supports App-Created Workspaces only. Importing arbitrary external Beancount folders is out of scope for Issue 1.
