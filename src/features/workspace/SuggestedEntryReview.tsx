import { useState } from "react";
import type { FormEvent } from "react";
import type { LedgerStatus, SuggestedEntry } from "../../lib/workspace/types";

type SuggestedEntryReviewProps = {
  suggestedEntries: SuggestedEntry[];
  ledgerStatus: LedgerStatus;
  onApprove: (input: {
    statementRowId: string;
    ledgerAccount: string;
  }) => Promise<void> | void;
};

export function SuggestedEntryReview({
  suggestedEntries,
  ledgerStatus,
  onApprove,
}: SuggestedEntryReviewProps) {
  if (suggestedEntries.length === 0) {
    return null;
  }

  return (
    <section className="suggested-entry-review" aria-labelledby="suggested-entry-review-title">
      <div className="section-heading">
        <p className="eyebrow">Suggested Entries</p>
        <h2 id="suggested-entry-review-title">Review and Approve</h2>
      </div>

      <div className="suggested-entry-list">
        {suggestedEntries.map((entry) => (
          <SuggestedEntryCard
            key={entry.statementRowId}
            entry={entry}
            ledgerStatus={ledgerStatus}
            onApprove={onApprove}
          />
        ))}
      </div>
    </section>
  );
}

function SuggestedEntryCard({
  entry,
  ledgerStatus,
  onApprove,
}: {
  entry: SuggestedEntry;
  ledgerStatus: LedgerStatus;
  onApprove: (input: {
    statementRowId: string;
    ledgerAccount: string;
  }) => Promise<void> | void;
}) {
  const [ledgerAccount, setLedgerAccount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const balancingAmount = invertAmount(entry.sourceAmount);
  const approvalBlocked = ledgerStatus === "invalid";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (approvalBlocked) return;

    setIsSubmitting(true);
    try {
      await onApprove({
        statementRowId: entry.statementRowId,
        ledgerAccount: ledgerAccount.trim(),
      });
      setLedgerAccount("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="suggested-entry-card">
      <div>
        <p className="eyebrow">Entry Preview</p>
        <h3>{entry.description}</h3>
        <p>{entry.postedDate}</p>
      </div>

      <div className="journal-detail">
        <p className="eyebrow">Journal Detail</p>
        <dl>
          <div>
            <dt>{entry.sourceAccount}</dt>
            <dd>{entry.sourceAmount} USD</dd>
          </div>
          <div>
            <dt>{ledgerAccount || "Selected Ledger Account"}</dt>
            <dd>{balancingAmount} USD</dd>
          </div>
        </dl>
      </div>

      <form className="workspace-form" onSubmit={handleSubmit}>
        <label>
          Ledger Account
          <input
            value={ledgerAccount}
            onChange={(event) => setLedgerAccount(event.target.value)}
            placeholder="Expenses:Software"
          />
        </label>

        <button
          className="primary-button"
          type="submit"
          disabled={approvalBlocked || !ledgerAccount.trim() || isSubmitting}
        >
          {approvalBlocked ? "Approval blocked" : "Approve Entry"}
        </button>
      </form>
    </article>
  );
}

function invertAmount(value: string): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "0.00";
  }
  return (-parsed).toFixed(2);
}
