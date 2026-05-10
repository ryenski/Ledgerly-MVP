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

Source Accounts are added as normal Beancount accounts under the Starter Chart:

- bank Source Accounts are appended under `Assets:Bank`
- credit-card Source Accounts are appended under `Liabilities:CreditCards`

When the Founder-Operator records a known Opening Balance, Ledgerly appends a Beancount `balance` directive to `opening-balances.bean` using the Workspace books start date.

## Ledgerly-Managed Local Data

`.ledgerly/` stores Ledgerly-managed local data:

- `workspace.json` identifies the folder as an App-Created Workspace.
- `ledgerly.sqlite` stores local workflow and cache state.
- `.ledgerly/cache/` is reserved for rebuildable cache files.

SQLite does not replace the ledger. It exists so later slices can add staging, source mappings, categorization rules, operation logs, and cache state while keeping the Workspace local-first.

## Validation Scope

Ledgerly uses structural Ledger Validation for the current MVP slices:

- required files exist
- `main.bean` includes the expected files
- account open directives have valid dates, account names, and `USD` currency
- opening balance directives have valid dates, account names, numeric amounts, and `USD` currency

Validation returns file-aware errors when available, for example `accounts.bean:1 Invalid currency EUR.` The app runs validation after creating a Workspace, when opening a Workspace, and when a Founder-Operator returns to the app or chooses **Recheck Ledger** after External Ledger Edits.

Full balance validation grows with the Approval and reporting slices once Ledgerly writes Monthly Transaction Files.

## Folder Selection

The create and open screens include editable path fields so the Workspace lifecycle works even when native directory picker support is unavailable in development. The frontend keeps a directory-picker API seam for a future compatible Tauri dialog plugin.

## Out Of Scope

The MVP currently supports App-Created Workspaces only. Importing arbitrary external Beancount folders is out of scope for Issue 1.
