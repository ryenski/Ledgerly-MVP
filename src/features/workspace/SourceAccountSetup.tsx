import { useState } from "react";
import type { FormEvent } from "react";
import type { SourceAccountKind } from "../../lib/workspace/types";

type SourceAccountSetupProps = {
  onAddSourceAccount: (input: {
    kind: SourceAccountKind;
    name: string;
    openingBalance: string | null;
  }) => Promise<void> | void;
};

export function SourceAccountSetup({ onAddSourceAccount }: SourceAccountSetupProps) {
  const [kind, setKind] = useState<SourceAccountKind>("bank");
  const [name, setName] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddSourceAccount({
        kind,
        name: name.trim(),
        openingBalance: openingBalance.trim() || null,
      });
      setName("");
      setOpeningBalance("");
      setKind("bank");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="source-account-setup" aria-labelledby="source-account-setup-title">
      <div className="section-heading">
        <p className="eyebrow">Source Accounts</p>
        <h2 id="source-account-setup-title">Add Source Account</h2>
      </div>

      <form className="workspace-form" onSubmit={handleSubmit}>
        <label>
          Account kind
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as SourceAccountKind)}
          >
            <option value="bank">Bank</option>
            <option value="creditCard">Credit card</option>
          </select>
        </label>

        <label>
          Source Account name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Operating Checking"
          />
        </label>

        <label>
          Opening Balance
          <input
            inputMode="decimal"
            value={openingBalance}
            onChange={(event) => setOpeningBalance(event.target.value)}
            placeholder="0.00"
          />
        </label>

        <button className="primary-button" type="submit" disabled={!name.trim() || isSubmitting}>
          Add Source Account
        </button>
      </form>
    </section>
  );
}
