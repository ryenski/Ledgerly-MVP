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

The CSV Import slice creates durable local Staging Area tables:

- `source_mappings` stores the CSV column mapping per Source Account and can reuse it on later imports for that Source Account.
- `statement_rows` stores normalized Statement Rows tied to one Source Account, including posted date, description, Source Amount, Import Fingerprint, optional supporting fields, raw row JSON, source file name, pending/accounted status, and the approved Ledgerly entry id/file when accounted.

Each imported Statement Row gets an Import Fingerprint derived from normalized row identity within the Source Account. Re-importing the same CSV or an overlapping CSV skips rows where `(source_account, import_fingerprint)` already exists. Accounted Statement Rows remain in the Staging Area so future imports can still deduplicate against them.

Imported Statement Rows are not Beancount ledger entries. Approval remains the later step that writes accounting data to the readable ledger files.

## Monthly Transaction Files

Approval writes non-transfer Suggested Entries to `transactions/YYYY-MM.bean` based on the Statement Row posted date and ensures `main.bean` includes that Monthly Transaction File. Each approved entry includes the Source Account posting from the Statement Row and a balancing posting to the Founder-Operator selected Ledger Account.

Transfer Match approval writes one balanced Transfer Entry between two Source Accounts when Ledgerly finds opposite-signed same-date Statement Rows across different Source Accounts and the Founder-Operator explicitly approves the match. Both linked Statement Rows are marked `accounted` with the same Ledgerly entry id and monthly ledger file path.

One-sided transfer hints can appear when an unmatched Statement Row looks like a transfer or payment, but those hints do not claim another row and cannot write a Transfer Entry until a linked Statement Row exists.

After Approval, the source Statement Row status changes from `pending` to `accounted` in the Staging Area. Ledgerly also stores the approved `ledgerly_entry_id` and monthly ledger file path with the Statement Row so the Staging Area can link back to the readable Beancount entry.

Ledgerly-written entries include minimal Beancount metadata:

- `ledgerly_entry_id`
- `import_fingerprint`
- `source_account`
- `source_file_name`

Raw CSV row JSON, future AI explanations, and confidence scores stay in Ledgerly-managed local data rather than being copied into the ledger.

Approval is blocked while Ledger Validation reports Invalid Ledger State. Broken Provenance is separate: if a Manual Ledger Edit removes or changes Ledgerly Entry Metadata while the Beancount files still validate, Ledgerly surfaces Broken Provenance without marking the ledger invalid.

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
