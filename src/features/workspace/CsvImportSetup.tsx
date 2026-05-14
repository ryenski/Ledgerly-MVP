import { useState } from "react";
import type { FormEvent } from "react";
import type { CsvSourceMappingInput } from "../../lib/workspace/types";

type CsvImportSetupProps = {
  onImportStatementRows: (input: {
    sourceAccount: string;
    sourceFileName: string;
    csvContents: string;
    mapping: CsvSourceMappingInput;
  }) => Promise<void> | void;
};

export function CsvImportSetup({ onImportStatementRows }: CsvImportSetupProps) {
  const [sourceAccount, setSourceAccount] = useState("");
  const [sourceFileName, setSourceFileName] = useState("");
  const [csvContents, setCsvContents] = useState("");
  const [postedDateColumn, setPostedDateColumn] = useState("Date");
  const [descriptionColumn, setDescriptionColumn] = useState("Description");
  const [amountColumn, setAmountColumn] = useState("Amount");
  const [debitColumn, setDebitColumn] = useState("");
  const [creditColumn, setCreditColumn] = useState("");
  const [memoColumn, setMemoColumn] = useState("");
  const [referenceIdColumn, setReferenceIdColumn] = useState("");
  const [payeeColumn, setPayeeColumn] = useState("");
  const [categoryColumn, setCategoryColumn] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onImportStatementRows({
        sourceAccount: sourceAccount.trim(),
        sourceFileName: sourceFileName.trim(),
        csvContents,
        mapping: {
          postedDateColumn: postedDateColumn.trim(),
          descriptionColumn: descriptionColumn.trim(),
          amountColumn: optionalColumn(amountColumn),
          debitColumn: optionalColumn(debitColumn),
          creditColumn: optionalColumn(creditColumn),
          memoColumn: optionalColumn(memoColumn),
          referenceIdColumn: optionalColumn(referenceIdColumn),
          payeeColumn: optionalColumn(payeeColumn),
          categoryColumn: optionalColumn(categoryColumn),
        },
      });
      setCsvContents("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="csv-import-setup" aria-labelledby="csv-import-setup-title">
      <div className="section-heading">
        <p className="eyebrow">CSV Import</p>
        <h2 id="csv-import-setup-title">Import Statement Rows</h2>
      </div>

      <form className="workspace-form" onSubmit={handleSubmit}>
        <label>
          Source Account
          <input
            value={sourceAccount}
            onChange={(event) => setSourceAccount(event.target.value)}
            placeholder="Assets:Bank:Operating-Checking"
          />
        </label>

        <label>
          Source file name
          <input
            value={sourceFileName}
            onChange={(event) => setSourceFileName(event.target.value)}
            placeholder="checking.csv"
          />
        </label>

        <label>
          CSV contents
          <textarea
            value={csvContents}
            onChange={(event) => setCsvContents(event.target.value)}
            rows={6}
          />
        </label>

        <div className="mapping-grid">
          <label>
            Posted date column
            <input value={postedDateColumn} onChange={(event) => setPostedDateColumn(event.target.value)} />
          </label>
          <label>
            Description column
            <input value={descriptionColumn} onChange={(event) => setDescriptionColumn(event.target.value)} />
          </label>
          <label>
            Amount column
            <input value={amountColumn} onChange={(event) => setAmountColumn(event.target.value)} />
          </label>
          <label>
            Debit column
            <input value={debitColumn} onChange={(event) => setDebitColumn(event.target.value)} />
          </label>
          <label>
            Credit column
            <input value={creditColumn} onChange={(event) => setCreditColumn(event.target.value)} />
          </label>
          <label>
            Memo column
            <input value={memoColumn} onChange={(event) => setMemoColumn(event.target.value)} />
          </label>
          <label>
            Reference id column
            <input value={referenceIdColumn} onChange={(event) => setReferenceIdColumn(event.target.value)} />
          </label>
          <label>
            Payee column
            <input value={payeeColumn} onChange={(event) => setPayeeColumn(event.target.value)} />
          </label>
          <label>
            Category column
            <input value={categoryColumn} onChange={(event) => setCategoryColumn(event.target.value)} />
          </label>
        </div>

        <button
          className="primary-button"
          type="submit"
          disabled={
            !sourceAccount.trim() ||
            !sourceFileName.trim() ||
            !csvContents.trim() ||
            !postedDateColumn.trim() ||
            !descriptionColumn.trim() ||
            (!amountColumn.trim() && (!debitColumn.trim() || !creditColumn.trim())) ||
            isSubmitting
          }
        >
          Import Statement Rows
        </button>
      </form>
    </section>
  );
}

function optionalColumn(value: string): string | null {
  return value.trim() || null;
}
