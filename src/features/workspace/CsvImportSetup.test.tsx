import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CsvImportSetup } from "./CsvImportSetup";

describe("CsvImportSetup", () => {
  it("submits CSV import mapping details", async () => {
    const user = userEvent.setup();
    const onImportStatementRows = vi.fn().mockResolvedValue(undefined);

    render(<CsvImportSetup onImportStatementRows={onImportStatementRows} />);

    await user.type(screen.getByLabelText("Source Account"), "Assets:Bank:Operating-Checking");
    await user.type(screen.getByLabelText("Source file name"), "checking.csv");
    await user.type(
      screen.getByLabelText("CSV contents"),
      "Date,Description,Amount\n2026-01-03,Client payment,1500.00",
    );
    await user.click(screen.getByRole("button", { name: "Import Statement Rows" }));

    expect(onImportStatementRows).toHaveBeenCalledWith({
      sourceAccount: "Assets:Bank:Operating-Checking",
      sourceFileName: "checking.csv",
      csvContents: "Date,Description,Amount\n2026-01-03,Client payment,1500.00",
      mapping: {
        postedDateColumn: "Date",
        descriptionColumn: "Description",
        amountColumn: "Amount",
        debitColumn: null,
        creditColumn: null,
        memoColumn: null,
        referenceIdColumn: null,
        payeeColumn: null,
        categoryColumn: null,
      },
    });
  });

  it("submits debit and credit columns when no amount column is mapped", async () => {
    const user = userEvent.setup();
    const onImportStatementRows = vi.fn().mockResolvedValue(undefined);

    render(<CsvImportSetup onImportStatementRows={onImportStatementRows} />);

    await user.type(screen.getByLabelText("Source Account"), "Assets:Bank:Operating-Checking");
    await user.type(screen.getByLabelText("Source file name"), "checking.csv");
    await user.type(
      screen.getByLabelText("CSV contents"),
      "Date,Description,Debit,Credit\n2026-01-03,Client payment,,1500.00",
    );
    await user.clear(screen.getByLabelText("Amount column"));
    await user.type(screen.getByLabelText("Debit column"), "Debit");
    await user.type(screen.getByLabelText("Credit column"), "Credit");
    await user.click(screen.getByRole("button", { name: "Import Statement Rows" }));

    expect(onImportStatementRows).toHaveBeenCalledWith({
      sourceAccount: "Assets:Bank:Operating-Checking",
      sourceFileName: "checking.csv",
      csvContents: "Date,Description,Debit,Credit\n2026-01-03,Client payment,,1500.00",
      mapping: {
        postedDateColumn: "Date",
        descriptionColumn: "Description",
        amountColumn: null,
        debitColumn: "Debit",
        creditColumn: "Credit",
        memoColumn: null,
        referenceIdColumn: null,
        payeeColumn: null,
        categoryColumn: null,
      },
    });
  });
});
