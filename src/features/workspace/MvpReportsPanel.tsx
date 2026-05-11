import { useState } from "react";
import type { FormEvent } from "react";
import type { ReactNode } from "react";
import type { AccountAmount, LedgerStatus, MvpReports } from "../../lib/workspace/types";

type MvpReportsPanelProps = {
  ledgerStatus: LedgerStatus;
  reports: MvpReports | null;
  defaultPeriodStart: string;
  defaultPeriodEnd: string;
  onLoadReports: (input: {
    periodStart: string;
    periodEnd: string;
  }) => Promise<void> | void;
};

export function MvpReportsPanel({
  ledgerStatus,
  reports,
  defaultPeriodStart,
  defaultPeriodEnd,
  onLoadReports,
}: MvpReportsPanelProps) {
  const [periodStart, setPeriodStart] = useState(defaultPeriodStart);
  const [periodEnd, setPeriodEnd] = useState(defaultPeriodEnd);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const blocked = ledgerStatus === "invalid";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked) return;

    setIsSubmitting(true);
    try {
      await onLoadReports({ periodStart, periodEnd });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mvp-reports" aria-labelledby="mvp-reports-title">
      <div className="section-heading">
        <p className="eyebrow">MVP Reports</p>
        <h2 id="mvp-reports-title">Validated ledger reports</h2>
      </div>

      <form className="report-period-form" onSubmit={handleSubmit}>
        <label>
          Period Start
          <input
            type="date"
            value={periodStart}
            onChange={(event) => setPeriodStart(event.target.value)}
          />
        </label>
        <label>
          Period End
          <input
            type="date"
            value={periodEnd}
            onChange={(event) => setPeriodEnd(event.target.value)}
          />
        </label>
        <button
          className="secondary-button"
          type="submit"
          disabled={blocked || isSubmitting}
        >
          {blocked ? "Reports blocked" : "Run Reports"}
        </button>
      </form>

      {reports ? (
        <div className="reports-grid">
          <ReportCard title="Income Statement">
            <ReportRows rows={reports.incomeStatement.income} emptyLabel="No income" />
            <ReportRows rows={reports.incomeStatement.expenses} emptyLabel="No expenses" />
            <ReportTotal label="Total Income" amount={reports.incomeStatement.totalIncome} />
            <ReportTotal label="Total Expenses" amount={reports.incomeStatement.totalExpenses} />
            <ReportTotal label="Net Income" amount={reports.incomeStatement.netIncome} />
          </ReportCard>

          <ReportCard title="Expense Breakdown">
            <ReportRows rows={reports.expenseBreakdown} emptyLabel="No expenses" />
          </ReportCard>

          <ReportCard title="Source Account Balances">
            <ReportRows
              rows={reports.sourceAccountBalances}
              emptyLabel="No source account balances"
            />
          </ReportCard>

          <ReportCard title="Balance Sheet">
            <ReportRows rows={reports.balanceSheet.assets} emptyLabel="No assets" />
            <ReportRows rows={reports.balanceSheet.liabilities} emptyLabel="No liabilities" />
            <ReportRows rows={reports.balanceSheet.equity} emptyLabel="No equity" />
            <ReportTotal label="Retained Earnings" amount={reports.balanceSheet.retainedEarnings} />
            <ReportTotal label="Total Assets" amount={reports.balanceSheet.totalAssets} />
            <ReportTotal
              label="Total Liabilities"
              amount={reports.balanceSheet.totalLiabilities}
            />
            <ReportTotal label="Total Equity" amount={reports.balanceSheet.totalEquity} />
          </ReportCard>
        </div>
      ) : null}
    </section>
  );
}

function ReportCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="report-card">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function ReportRows({
  rows,
  emptyLabel,
}: {
  rows: AccountAmount[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="empty-note">{emptyLabel}</p>;
  }

  return (
    <dl className="report-rows">
      {rows.map((row) => (
        <div key={row.account}>
          <dt>{row.account}</dt>
          <dd>{formatCurrency(row.amount)}</dd>
        </div>
      ))}
    </dl>
  );
}

function ReportTotal({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="report-total">
      <span>{label}</span>
      <strong>{formatCurrency(amount)}</strong>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
