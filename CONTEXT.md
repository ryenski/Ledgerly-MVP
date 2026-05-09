# Ledgerly

Ledgerly is a local-first accounting workspace built around a portable Beancount ledger, with reviewable automation layered on top.

## Language

**MVP**:
The first local accounting loop: create or reopen a Ledgerly-created workspace, import CSV transactions, review suggestions, approve ledger changes, and view basic reports.
_Avoid_: Sync, collaboration, payroll, invoicing, tax, external-ledger import

**Founder-Operator**:
A financially literate solo business owner who runs their own books and wants transparent, local accounting records.
_Avoid_: Generic small-business owner, bookkeeper, accountant, firm user

**MVP Business**:
A single cash-basis US service business with one legal entity, no inventory, no sales tax, no payroll, no accounts receivable or accounts payable workflows, and no multi-currency.
_Avoid_: SaaS billing system, ecommerce business, payroll workflow, invoicing workflow, multi-entity books

**Workspace**:
A local folder that contains a business's Beancount ledger plus Ledgerly metadata and rebuildable cache data.
_Avoid_: Project, company, file, cloud account

**App-Created Workspace**:
A Workspace created by Ledgerly using Ledgerly's expected file layout and chart-of-accounts assumptions.
_Avoid_: Imported ledger, arbitrary Beancount project, external workspace

**Statement Row**:
A raw transaction-like row imported from a bank-downloaded CSV statement before Ledgerly turns it into accounting data.
_Avoid_: Transaction, ledger transaction, entry

**Source Amount**:
The normalized amount for a Statement Row expressed as the eventual Beancount posting amount for its Source Account.
_Avoid_: Bank display amount, debit column, credit column, balance direction

**Entry Preview**:
The user-facing preview of the Beancount entry that Ledgerly will write on Approval.
_Avoid_: Category-only review, hidden ledger change

**Journal Detail**:
The low-level accounting view of an entry's debits, credits, and postings.
_Avoid_: Primary review UI, hidden expert mode

**Manual Ledger Edit**:
A direct user edit to the Workspace's Beancount files outside Ledgerly's approval flow.
_Avoid_: Unsupported edit, hidden database edit

**External Ledger Edit**:
A Manual Ledger Edit made in the user's external text editor rather than inside Ledgerly.
_Avoid_: Embedded editor, in-app IDE

**Ledger Validation**:
The workspace-level check that the Beancount ledger parses and balances after Ledgerly writes or detects file changes.
_Avoid_: Row-level validation, silent failure, cache-only correctness

**Invalid Ledger State**:
A Workspace state where the Beancount ledger fails parsing, balancing, or validation and Ledgerly cannot trust derived accounting data.
_Avoid_: Warning-only error, partial report state

**Staging Area**:
Ledgerly-managed Workspace data that stores Statement Rows, review state, fingerprints, source metadata, and suggestion details before Approval.
_Avoid_: Ledger, canonical accounting record, Beancount annotations

**Accounted Statement Row**:
A Statement Row retained in the Staging Area after Approval and linked to the approved ledger entry it produced.
_Avoid_: Deleted import row, duplicate review item

**Ledgerly Entry Metadata**:
Beancount transaction metadata written by Ledgerly to link an approved ledger entry back to its Staging Area provenance, including Ledgerly entry id, import fingerprint, source account, and source file name.
_Avoid_: Comment-only provenance, line-number link

**Broken Provenance**:
A state where a valid ledger entry can no longer be reliably linked to its Staging Area record because Ledgerly Entry Metadata was edited or removed.
_Avoid_: Invalid ledger, automatic repair

**Transfer Entry**:
A Suggested Entry or approved ledger entry that moves value between two Ledger Accounts without income or expense.
_Avoid_: Duplicate payment entries, ignored transfer

**Transfer Match**:
A user-approved link between Statement Rows from different Source Accounts that belong to the same Transfer Entry.
_Avoid_: Automatic transfer approval, duplicate transfer

**Opening Balance**:
The starting balance for a Ledger Account as of the Workspace books start date.
_Avoid_: Imported transaction, reconciliation adjustment

**MVP Report**:
One of the first supported reports: income statement, expense breakdown, source account balances, or balance sheet.
_Avoid_: Cash flow statement, tax report, runway analysis, variance analysis, AI narrative report

**AI Suggestion**:
An AI-assisted proposal for the non-source Ledger Account, payee or narration cleanup, or explanation on a Suggested Entry.
_Avoid_: AI ledger write, AI reconciliation, AI report, autonomous bookkeeping

**BYO AI Adapter**:
A user-configured local integration that accepts Ledgerly's bounded suggestion request and returns structured AI Suggestions.
_Avoid_: Ledgerly-hosted AI service, embedded agent harness, arbitrary harness integration, autonomous file editing

**Curated Ledger Context**:
The limited ledger-derived context Ledgerly sends to a BYO AI Adapter, such as chart of accounts, Source Account, Statement Row, relevant rules, similar approved entries, and business profile.
_Avoid_: Raw workspace access, direct file access, full ledger dump by default

**AI Context Disclosure**:
The user-visible explanation of what Curated Ledger Context Ledgerly sends to the configured BYO AI Adapter.
_Avoid_: Hidden AI data sharing, unclear adapter permissions

**Categorization Rule**:
A user-confirmed rule that proposes a Ledger Account for future Statement Rows matching known patterns, scoped to a Source Account by default.
_Avoid_: Hidden learning, automatic rule creation, global rule by default

**Starter Chart of Accounts**:
The small editable set of Ledger Accounts Ledgerly creates for an MVP Business.
_Avoid_: Universal chart of accounts, locked account list

**Local Desktop App**:
The product form for Ledgerly: a locally running desktop application that manages Workspace folders and should preserve a path to cross-platform V1.0.
_Avoid_: Hosted SaaS app, browser-first local web app, Mac-only architecture

**Local-First MVP**:
An MVP where all accounting data needed to use Ledgerly lives in the Workspace folder and the app can run without a Ledgerly cloud account.
_Avoid_: Cloud-stored ledger, hosted auth requirement, server-required bank feed, cloud-only staging data

**Golden Path**:
The canonical MVP workflow from Workspace creation through CSV import, review, Approval, Ledger Validation, and MVP Reports.
_Avoid_: Edge-case workflow, full accounting suite, onboarding wizard for every business type

**MVP Validation**:
The proof that a Founder-Operator can trust Ledgerly to turn bank CSV rows into valid, inspectable Beancount and basic reports without hiding the accounting mechanics.
_Avoid_: Feature checklist, demo-only flow, opaque AI bookkeeping

**Suggested Entry**:
Ledgerly's proposed Beancount transaction for one or more Statement Rows before the Founder-Operator approves it.
_Avoid_: Suggested transaction, AI transaction, draft ledger entry

**Approval**:
The action that writes a Suggested Entry into the Beancount ledger and marks its source Statement Rows as accounted for.
_Avoid_: Accept category, stage, save draft

**Split Entry**:
A future non-MVP ledger entry where one Statement Row is allocated across multiple accounting categories.
_Avoid_: MVP split, payout decomposition

**Monthly Transaction File**:
A Ledgerly-owned Beancount file that stores approved entries for one calendar month.
_Avoid_: Import batch file, arbitrary ledger file

**Ledger Account**:
A Beancount account in the Workspace chart of accounts.
_Avoid_: Bank account, user account

**Source Account**:
The Ledger Account selected by the Founder-Operator as the account represented by a CSV import.
_Avoid_: Inferred account, per-row account

**CSV Import**:
The act of bringing Statement Rows from one bank-downloaded CSV file into a Workspace for one Source Account.
_Avoid_: Bank feed, ledger import, statement sync

**Import Fingerprint**:
A stable identity for a Statement Row within a Source Account, derived from normalized CSV fields to prevent repeated imports from creating duplicate review items.
_Avoid_: Ledger duplicate check, global transaction id

**Source Mapping**:
The saved CSV column mapping used to import Statement Rows for a Source Account.
_Avoid_: Global CSV schema, automatic bank detection

## Relationships

- The **MVP** proves the local accounting loop before adding cloud or collaboration workflows.
- The **Founder-Operator** is the primary user of the **MVP**.
- The **MVP** is designed around an **MVP Business**.
- A **Founder-Operator** creates or opens one **Workspace** for an **MVP Business**.
- The **MVP** supports **App-Created Workspaces** only.
- The **MVP** imports **Statement Rows** from bank-downloaded CSV files.
- Ledgerly creates **Suggested Entries** from **Statement Rows**.
- An **Approval** turns a **Suggested Entry** into canonical ledger data.
- In the **MVP**, each non-transfer **Statement Row** maps to exactly one **Suggested Entry**.
- A **Transfer Entry** may link two **Statement Rows** from different **Source Accounts** to one **Suggested Entry**.
- Ledgerly may suggest a **Transfer Match** by date, amount, and description, but the Founder-Operator approves it.
- **Split Entries** are outside the **MVP**.
- Workspace setup records **Opening Balances** for Source Accounts when the Founder-Operator knows them.
- **MVP Reports** are unavailable during **Invalid Ledger State**.
- **AI Suggestions** can help create **Suggested Entries**, but **Approval** remains required.
- **AI Suggestions** come from a **BYO AI Adapter** in the MVP.
- A **BYO AI Adapter** receives **Curated Ledger Context**, not required direct Workspace file access.
- **Curated Ledger Context** may include full details for relevant prior entries, and Ledgerly provides **AI Context Disclosure**.
- The **MVP** core loop works without a configured **BYO AI Adapter**.
- A **Categorization Rule** can be created from an Approval only when the Founder-Operator confirms it.
- Ledgerly creates a **Starter Chart of Accounts** that the Founder-Operator can edit through Beancount files.
- The **MVP** should be a **Local Desktop App** architecture that can survive cross-platform V1.0, even if the first build targets macOS.
- The **MVP** is a **Local-First MVP**: ledger, staging data, mappings, rules, reports, and validation live locally.
- The **Golden Path** is the primary acceptance path for MVP scope.
- **MVP Validation** requires readable ledger files, Beancount validation, retained provenance, import deduplication, transfer handling, invalid-ledger blocking, optional AI, and reports that agree with the ledger.
- An **Approval** immediately writes the approved entry to the **Monthly Transaction File** for the entry date.
- Each **CSV Import** has exactly one **Source Account**.
- Each **Suggested Entry** includes a posting to the **Source Account**.
- A **Statement Row** is deduplicated by its **Import Fingerprint** within a **Source Account**.
- A **Source Account** may have one saved **Source Mapping** for repeated CSV Imports.
- A normalized **Statement Row** requires posted date, description, and amount, with optional supporting fields.
- A **Statement Row** amount is normalized as a **Source Amount** before Ledgerly creates a Suggested Entry.
- A **Suggested Entry** is reviewed through an **Entry Preview**, with **Journal Detail** available when needed.
- A **Manual Ledger Edit** is allowed because the Beancount ledger is the source of truth.
- The **MVP** supports **External Ledger Edits**, not an embedded Beancount editor.
- **Ledger Validation** alerts the Founder-Operator when a **Manual Ledger Edit** or Approval leaves the ledger invalid.
- An **Invalid Ledger State** blocks Approval and reports while still allowing the Founder-Operator to view validation errors and edit ledger files.
- The **Staging Area** stores **Statement Rows** and review state outside the Beancount ledger.
- **Approval** writes accounting data to the ledger while preserving import provenance in the **Staging Area**.
- An **Approval** turns each source **Statement Row** into an **Accounted Statement Row**.
- Ledgerly writes **Ledgerly Entry Metadata** on approved entries so the ledger can be linked back to the **Staging Area**.
- **Broken Provenance** does not make the ledger invalid when Beancount validation still passes.

## Example dialogue

> **Dev:** "Should the MVP include shared workspaces?"
> **Domain expert:** "No. The MVP proves that one user can turn imported transactions into a trustworthy local ledger and basic reports."
>
> **Dev:** "Should we optimize setup for a bookkeeping firm managing many clients?"
> **Domain expert:** "No. The first user is a Founder-Operator doing their own books."
>
> **Dev:** "Do we need payroll, invoices, or sales tax in the first ledger model?"
> **Domain expert:** "No. The MVP Business is a simple cash-basis service business."
>
> **Dev:** "Is the app opening a company record or a file?"
> **Domain expert:** "It opens a Workspace: a local folder containing the ledger and Ledgerly's supporting data."
>
> **Dev:** "Can users import any existing Beancount project into the MVP?"
> **Domain expert:** "No. The MVP only supports App-Created Workspaces."
>
> **Dev:** "Is an imported CSV line already a ledger transaction?"
> **Domain expert:** "No. It is a Statement Row until Ledgerly creates and approves accounting data from it."
>
> **Dev:** "What does the user approve in the review queue?"
> **Domain expert:** "They approve a Suggested Entry, which is Ledgerly's proposed accounting treatment for the Statement Row."
>
> **Dev:** "Does approval merely accept the suggested category?"
> **Domain expert:** "No. Approval writes the Suggested Entry into the ledger and marks the source Statement Row as accounted for."
>
> **Dev:** "Can one imported Amazon row be split across office supplies and meals in the MVP?"
> **Domain expert:** "No. Split Entries are needed later, but the MVP keeps non-transfer Statement Rows mapped to one Suggested Entry."
>
> **Dev:** "Should a checking payment row and credit-card payment row create two ledger entries?"
> **Domain expert:** "No. They should be linked to one Transfer Entry when both sides are present."
>
> **Dev:** "Can Ledgerly automatically approve a transfer because two amounts match?"
> **Domain expert:** "No. Ledgerly can suggest a Transfer Match, but the Founder-Operator approves it."
>
> **Dev:** "Can the Workspace show trustworthy balances without a starting point?"
> **Domain expert:** "No. Source Accounts need Opening Balances when available."
>
> **Dev:** "Should MVP reporting include cash flow and tax reports?"
> **Domain expert:** "No. MVP Reports are income statement, expense breakdown, source account balances, and balance sheet."
>
> **Dev:** "Can AI write directly to the ledger?"
> **Domain expert:** "No. AI can help produce a Suggested Entry, but Approval writes to the ledger."
>
> **Dev:** "Does the MVP call a Ledgerly-hosted AI service?"
> **Domain expert:** "No. The MVP uses a BYO AI Adapter with a bounded local integration contract."
>
> **Dev:** "Can the user complete bookkeeping if no AI adapter is configured?"
> **Domain expert:** "Yes. AI is optional; manual review, rules, and deterministic matching still work."
>
> **Dev:** "Does the AI adapter need direct access to the ledger folder?"
> **Domain expert:** "No. Ledgerly sends Curated Ledger Context for the suggestion task."
>
> **Dev:** "Can AI receive prior entry descriptions and amounts?"
> **Domain expert:** "Yes, for relevant prior entries, with AI Context Disclosure in settings."
>
> **Dev:** "Should every approval silently train future categorization?"
> **Domain expert:** "No. Ledgerly can offer a Categorization Rule, but the Founder-Operator confirms it."
>
> **Dev:** "Is the chart of accounts locked behind app UI?"
> **Domain expert:** "No. Ledgerly creates a Starter Chart of Accounts that can be edited in the Beancount files."
>
> **Dev:** "Is it okay if the MVP architecture only works on macOS?"
> **Domain expert:** "No. The first build can target macOS, but the Local Desktop App architecture should preserve a cross-platform V1.0 path."
>
> **Dev:** "Does the MVP require a Ledgerly cloud account to use the books?"
> **Domain expert:** "No. The Local-First MVP keeps required accounting data in the Workspace folder."
>
> **Dev:** "How do we know whether a feature belongs in the MVP?"
> **Domain expert:** "It should support the Golden Path from Workspace creation to approved entries and MVP Reports."
>
> **Dev:** "What does success look like after the MVP is built?"
> **Domain expert:** "MVP Validation proves that CSV rows become valid, inspectable Beancount and trustworthy reports without hiding the accounting mechanics."
>
> **Dev:** "If a February statement row is imported in May, where does approval write it?"
> **Domain expert:** "Approval writes immediately to the February Monthly Transaction File."
>
> **Dev:** "Should Ledgerly infer a different bank or credit-card account for each imported row?"
> **Domain expert:** "No. The Founder-Operator selects one Source Account for the CSV Import."
>
> **Dev:** "Should importing the same Chase CSV twice create duplicate review items?"
> **Domain expert:** "No. Ledgerly should use Import Fingerprints to recognize repeated Statement Rows for the same Source Account."
>
> **Dev:** "Does every CSV need a global bank-format detector?"
> **Domain expert:** "No. The MVP uses a Source Mapping saved for each Source Account."
>
> **Dev:** "What fields must a mapped CSV row provide?"
> **Domain expert:** "A Statement Row needs posted date, description, and amount; other fields are optional support."
>
> **Dev:** "For a credit-card charge, should the imported amount be positive because the card balance went up?"
> **Domain expert:** "No. The Source Amount is the Beancount posting amount for the Source Account, so the liability posting is negative."
>
> **Dev:** "Should review show only a suggested category?"
> **Domain expert:** "No. The primary surface is an Entry Preview, with Journal Detail available for debit and credit inspection."
>
> **Dev:** "What happens if the user edits a .bean file and creates an unbalanced entry?"
> **Domain expert:** "Ledgerly should run Ledger Validation and alert them that the Workspace ledger is invalid."
>
> **Dev:** "Does Ledgerly need an embedded Beancount editor in the MVP?"
> **Domain expert:** "No. MVP users edit ledger files externally, and Ledgerly surfaces validation errors in the app."
>
> **Dev:** "Can the user keep approving imports while the ledger is out of balance?"
> **Domain expert:** "No. Invalid Ledger State blocks Approval and reports until the ledger is fixed."
>
> **Dev:** "Should raw imported bank rows be written into Beancount before approval?"
> **Domain expert:** "No. Statement Rows and review state live in the Staging Area until Approval writes accounting entries to the ledger."
>
> **Dev:** "Should Ledgerly delete the imported row after approval?"
> **Domain expert:** "No. Ledgerly keeps it as an Accounted Statement Row for provenance and deduplication."
>
> **Dev:** "Should Ledgerly provenance be written as Beancount comments?"
> **Domain expert:** "No. Ledgerly writes valid Beancount metadata on approved entries."
>
> **Dev:** "If the user deletes ledgerly_id from a valid entry, should the ledger be blocked?"
> **Domain expert:** "No. The ledger remains valid, but Ledgerly treats the entry as Broken Provenance."

## Flagged ambiguities

- "MVP" was used near broader product ideas such as sync, collaboration, payroll, invoicing, tax, and external-ledger import; resolved: those are outside the MVP.
- "User" could mean a founder, bookkeeper, accountant, or firm member; resolved: the MVP user is a **Founder-Operator**.
- "Business" could imply many accounting shapes; resolved: the MVP assumes an **MVP Business**.
- "Project", "company", and "file" could all describe what the app opens; resolved: the canonical term is **Workspace**.
- "Transaction" could mean a raw bank CSV row or a Beancount transaction; resolved: imported raw data is a **Statement Row**.
- "Suggestion" could mean a category, rule, or complete ledger change; resolved: the review unit is a **Suggested Entry**.
- "Approve" could mean accepting only a categorization; resolved: **Approval** commits a Suggested Entry to the ledger.
- Split transactions are needed after the MVP; resolved: **Split Entries** are outside the MVP, while **Transfer Entries** and approved **Transfer Matches** are an MVP exception to the one-row default.
- Account balances need a starting point; resolved: Workspace setup supports **Opening Balances**.
- Reporting scope could expand into cash flow, tax, variance, runway, or AI narratives; resolved: **MVP Reports** are limited to income statement, expense breakdown, source account balances, and balance sheet.
- AI could be framed as autonomous accounting; resolved: **AI Suggestions** are bounded suggestion assistance behind Approval.
- AI integration could mean hosted AI, embedded harness, or generic agent support; resolved: the MVP uses a **BYO AI Adapter**.
- AI could be required for the accounting loop; resolved: the **BYO AI Adapter** is optional for the MVP.
- AI context could mean direct ledger access or a full ledger dump; resolved: the MVP sends **Curated Ledger Context**.
- AI data sharing could be hidden or over-sanitized; resolved: relevant prior-entry details may be sent with **AI Context Disclosure**.
- Categorization could be hidden learning or explicit rules; resolved: the MVP uses user-confirmed **Categorization Rules**.
- The chart of accounts could be universal or locked; resolved: Ledgerly creates an editable **Starter Chart of Accounts** for the MVP Business.
- The app target could drift toward hosted web or Mac-only native; resolved: Ledgerly is a **Local Desktop App** with a cross-platform path.
- "Local-first" could still hide cloud dependencies; resolved: the **Local-First MVP** requires no Ledgerly cloud account for accounting data.
- MVP scope could sprawl into adjacent accounting workflows; resolved: use the **Golden Path** as the acceptance path.
- MVP success could be measured as a feature checklist; resolved: use **MVP Validation** as the trust-oriented success statement.
- Approved entries could be grouped by import batch or by accounting month; resolved: the MVP writes to **Monthly Transaction Files** by entry date.
- "Account" could mean a Beancount account, bank account, workspace account, or user account; resolved: accounting accounts are **Ledger Accounts**, and imports choose one **Source Account**.
- Deduplication could mean repeated CSV rows or duplicate ledger detection; resolved: the MVP deduplicates **Statement Rows** by **Import Fingerprint** within a **Source Account**.
- CSV mapping could be global, automatic, or per account; resolved: the MVP uses a per-**Source Account** **Source Mapping**.
- CSV amount signs could follow bank UI conventions or Beancount posting signs; resolved: the MVP normalizes to **Source Amount**.
- Debit and credit language is useful for low-level accounting but not the default review surface; resolved: use **Entry Preview** first and expose **Journal Detail** one click away.
- Manual edits could be blocked, ignored, or treated as authoritative; resolved: **Manual Ledger Edits** are essential and supported, while **Ledger Validation** reports ledger-level problems.
- Embedded ledger editing is a rabbit hole; resolved: the MVP supports **External Ledger Edits** and app-level validation errors only.
- Statement Rows could be stored in Beancount metadata or outside the ledger; resolved: they live in the **Staging Area** until Approval.
- Approved import rows could be deleted or retained; resolved: retain them as **Accounted Statement Rows**.
- Approved entries could be linked by file line number, comments, or metadata; resolved: use **Ledgerly Entry Metadata**.
- Manual metadata edits can break Ledgerly's link to Staging Area records; resolved: this creates **Broken Provenance**, not an invalid ledger.
