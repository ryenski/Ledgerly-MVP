import type { WorkspaceSummary } from "../../lib/workspace/types";

type WorkspaceOverviewProps = {
  workspace: WorkspaceSummary;
  onReveal: () => void;
  onOpenAnother: () => void;
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
  onReveal,
  onOpenAnother,
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

      <div className="action-row">
        <button className="primary-button" type="button" onClick={onReveal}>
          Reveal Workspace
        </button>
        <button className="secondary-button" type="button" onClick={onOpenAnother}>
          Open Another Workspace
        </button>
      </div>
    </section>
  );
}
