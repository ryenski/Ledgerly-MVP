import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MvpReportsPanel } from "./MvpReportsPanel";

const reports = {
  periodStart: "2026-01-01",
  periodEnd: "2026-01-31",
  incomeStatement: {
    income: [{ account: "Income:Services", amount: 1200 }],
    expenses: [{ account: "Expenses:Software", amount: 29.99 }],
    totalIncome: 1200,
    totalExpenses: 29.99,
    netIncome: 1170.01,
  },
  expenseBreakdown: [{ account: "Expenses:Software", amount: 29.99 }],
  sourceAccountBalances: [
    { account: "Assets:Bank:Operating-Checking", amount: 1570.01 },
  ],
  balanceSheet: {
    assets: [{ account: "Assets:Bank:Operating-Checking", amount: 1570.01 }],
    liabilities: [],
    equity: [],
    retainedEarnings: 1170.01,
    totalAssets: 1570.01,
    totalLiabilities: 0,
    totalEquity: 1170.01,
  },
};

describe("MvpReportsPanel", () => {
  it("loads and renders MVP report sections", async () => {
    const user = userEvent.setup();
    const onLoadReports = vi.fn().mockResolvedValue(undefined);

    render(
      <MvpReportsPanel
        ledgerStatus="valid"
        reports={reports}
        defaultPeriodStart="2026-01-01"
        defaultPeriodEnd="2026-01-31"
        onLoadReports={onLoadReports}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Run Reports" }));

    expect(onLoadReports).toHaveBeenCalledWith({
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
    });
    expect(screen.getByText("Income Statement")).toBeInTheDocument();
    expect(screen.getByText("Expense Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Source Account Balances")).toBeInTheDocument();
    expect(screen.getByText("Balance Sheet")).toBeInTheDocument();
    expect(screen.getByText("Income:Services")).toBeInTheDocument();
  });

  it("blocks reports during Invalid Ledger State", () => {
    render(
      <MvpReportsPanel
        ledgerStatus="invalid"
        reports={null}
        defaultPeriodStart="2026-01-01"
        defaultPeriodEnd="2026-01-31"
        onLoadReports={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Reports blocked" })).toBeDisabled();
  });
});
