import type {
  AiAdapterConfig,
  AiContextDisclosure,
  CategorizationRule,
  CsvSourceMappingInput,
  BrokenProvenance,
  SuggestedEntry,
  WorkspaceSummary,
} from "../../lib/workspace/types";
import { AiAdapterPanel } from "./AiAdapterPanel";
import {
  CategorizationRulesPanel,
  type CategorizationRuleOffer,
} from "./CategorizationRulesPanel";
import { CsvImportSetup } from "./CsvImportSetup";
import { SourceAccountSetup } from "./SourceAccountSetup";
import type { SourceAccountKind } from "../../lib/workspace/types";
import { SuggestedEntryReview } from "./SuggestedEntryReview";

type WorkspaceOverviewProps = {
  workspace: WorkspaceSummary;
  suggestedEntries?: SuggestedEntry[];
  brokenProvenance?: BrokenProvenance[];
  categorizationRules?: CategorizationRule[];
  categorizationRuleOffer?: CategorizationRuleOffer | null;
  aiAdapterConfig?: AiAdapterConfig;
  aiContextDisclosure?: AiContextDisclosure;
  onReveal: () => void;
  onOpenAnother: () => void;
  onValidate?: () => void | Promise<void>;
  onAddSourceAccount?: (input: {
    kind: SourceAccountKind;
    name: string;
    openingBalance: string | null;
  }) => Promise<void> | void;
  onImportStatementRows?: (input: {
    sourceAccount: string;
    sourceFileName: string;
    csvContents: string;
    mapping: CsvSourceMappingInput;
  }) => Promise<void> | void;
  onApproveSuggestedEntry?: (input: {
    statementRowId: string;
    ledgerAccount: string;
  }) => Promise<void> | void;
  onApproveTransferEntry?: (input: {
    statementRowId: string;
    linkedStatementRowId: string;
  }) => Promise<void> | void;
  onCreateCategorizationRule?: (input: CategorizationRuleOffer) => Promise<void> | void;
  onUpdateCategorizationRule?: (
    input: CategorizationRuleOffer & { id: string },
  ) => Promise<void> | void;
  onDismissCategorizationRuleOffer?: () => void;
  onConfigureAiAdapter?: (command: string | null) => Promise<void> | void;
  error?: string | null;
};

const workspaceFiles = [
  "main.bean",
  "accounts.bean",
  "opening-balances.bean",
  ".ledgerly/workspace.json",
  ".ledgerly/ledgerly.sqlite",
];

export function WorkspaceOverview({
  workspace,
  suggestedEntries = [],
  brokenProvenance = [],
  categorizationRules = [],
  categorizationRuleOffer = null,
  aiAdapterConfig = { command: null },
  aiContextDisclosure = { adapterConfigured: false, fieldsSent: [] },
  onReveal,
  onOpenAnother,
  onValidate,
  onAddSourceAccount,
  onImportStatementRows,
  onApproveSuggestedEntry,
  onApproveTransferEntry,
  onCreateCategorizationRule,
  onUpdateCategorizationRule,
  onDismissCategorizationRuleOffer,
  onConfigureAiAdapter,
  error,
}: WorkspaceOverviewProps) {
  return (
    <section className="overview" aria-labelledby="workspace-overview-title">
      <div className="overview-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1 id="workspace-overview-title">{workspace.businessName}</h1>
        </div>
        <span className={`status-pill status-pill--${workspace.ledgerStatus}`}>
          Ledger {workspace.ledgerStatus}
        </span>
      </div>

      {error ? (
        <div className="error-banner" role="alert">
          {error}
        </div>
      ) : null}

      {workspace.ledgerStatus === "invalid" ? (
        <section className="ledger-alert" role="alert" aria-labelledby="ledger-alert-title">
          <div>
            <p className="eyebrow">Invalid Ledger State</p>
            <h2 id="ledger-alert-title">Ledger Validation needs attention</h2>
            <p>
              Ledgerly found validation errors in the Workspace ledger. You can
              inspect these files and edit them externally, but unsafe accounting
              actions stay blocked until validation passes.
            </p>
          </div>
          <ul>
            {workspace.ledgerValidation.errors.map((validationError) => (
              <li key={validationError}>{validationError}</li>
            ))}
          </ul>
          <div className="blocked-actions" aria-label="Blocked unsafe actions">
            <button className="secondary-button" type="button" disabled>
              Approval blocked
            </button>
            <button className="secondary-button" type="button" disabled>
              MVP Reports blocked
            </button>
          </div>
        </section>
      ) : null}

      {brokenProvenance.length > 0 ? (
        <section
          className="provenance-alert"
          role="status"
          aria-labelledby="provenance-alert-title"
        >
          <div>
            <p className="eyebrow">Broken Provenance</p>
            <h2 id="provenance-alert-title">Ledgerly metadata needs attention</h2>
            <p>
              Ledger validation still passes, but Ledgerly cannot match some
              Accounted Statement Rows back to their approved ledger entries.
            </p>
          </div>
          <ul>
            {brokenProvenance.map((item) => (
              <li key={item.statementRowId}>
                {item.statementRowId}: {item.reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <dl className="detail-grid">
        <div>
          <dt>Base currency</dt>
          <dd>{workspace.baseCurrency}</dd>
        </div>
        <div>
          <dt>Books start date</dt>
          <dd>{workspace.booksStartDate}</dd>
        </div>
        <div className="wide">
          <dt>Workspace path</dt>
          <dd>{workspace.rootPath}</dd>
        </div>
      </dl>

      <section className="file-list" aria-labelledby="workspace-files-title">
        <h2 id="workspace-files-title">Workspace files</h2>
        <ul>
          {workspaceFiles.map((file) => (
            <li key={file}>{file}</li>
          ))}
        </ul>
      </section>

      {onAddSourceAccount ? (
        <SourceAccountSetup onAddSourceAccount={onAddSourceAccount} />
      ) : null}

      {onImportStatementRows ? (
        <CsvImportSetup onImportStatementRows={onImportStatementRows} />
      ) : null}

      {onConfigureAiAdapter ? (
        <AiAdapterPanel
          config={aiAdapterConfig}
          disclosure={aiContextDisclosure}
          onConfigure={onConfigureAiAdapter}
        />
      ) : null}

      {onApproveSuggestedEntry ? (
        <SuggestedEntryReview
          suggestedEntries={suggestedEntries}
          ledgerStatus={workspace.ledgerStatus}
          onApprove={onApproveSuggestedEntry}
          onApproveTransfer={onApproveTransferEntry}
        />
      ) : null}

      <CategorizationRulesPanel
        rules={categorizationRules}
        offer={categorizationRuleOffer}
        onCreateRule={onCreateCategorizationRule}
        onUpdateRule={onUpdateCategorizationRule}
        onDismissOffer={onDismissCategorizationRuleOffer}
      />

      <div className="action-row">
        <button className="primary-button" type="button" onClick={onReveal}>
          Reveal Workspace
        </button>
        {onValidate ? (
          <button className="secondary-button" type="button" onClick={onValidate}>
            Recheck Ledger
          </button>
        ) : null}
        <button className="secondary-button" type="button" onClick={onOpenAnother}>
          Open Another Workspace
        </button>
      </div>
    </section>
  );
}
