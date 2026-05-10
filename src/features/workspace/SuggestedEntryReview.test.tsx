import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SuggestedEntryReview } from "./SuggestedEntryReview";
import type { SuggestedEntry } from "../../lib/workspace/types";

const suggestedEntries: SuggestedEntry[] = [
  {
    statementRowId: "row-1",
    postedDate: "2026-01-04",
    description: "Software",
    sourceAccount: "Assets:Bank:Operating-Checking",
    sourceAmount: "-29.99",
    sourceFileName: "checking.csv",
    importFingerprint: "fingerprint-1",
  },
];

describe("SuggestedEntryReview", () => {
  it("shows Entry Preview, Journal Detail, and approves selected Ledger Account", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn().mockResolvedValue(undefined);

    render(
      <SuggestedEntryReview
        suggestedEntries={suggestedEntries}
        ledgerStatus="valid"
        onApprove={onApprove}
      />,
    );

    expect(screen.getByText("Entry Preview")).toBeInTheDocument();
    expect(screen.getByText("Journal Detail")).toBeInTheDocument();
    expect(screen.getByText("Assets:Bank:Operating-Checking")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Ledger Account"), "Expenses:Software");
    await user.click(screen.getByRole("button", { name: "Approve Entry" }));

    expect(onApprove).toHaveBeenCalledWith({
      statementRowId: "row-1",
      ledgerAccount: "Expenses:Software",
    });
  });

  it("blocks approval during Invalid Ledger State", () => {
    render(
      <SuggestedEntryReview
        suggestedEntries={suggestedEntries}
        ledgerStatus="invalid"
        onApprove={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Approval blocked" })).toBeDisabled();
  });
});
