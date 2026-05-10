import { FormEvent, useMemo, useState } from "react";
import type { WorkspaceCreateInput } from "../../lib/workspace/types";

type CreateWorkspaceFormProps = {
  onCancel: () => void;
  onChooseDirectory: () => Promise<string | null>;
  onCreate: (input: WorkspaceCreateInput) => Promise<void>;
  error?: string | null;
};

export function CreateWorkspaceForm({
  onCancel,
  onChooseDirectory,
  onCreate,
  error,
}: CreateWorkspaceFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [booksStartDate, setBooksStartDate] = useState("2026-01-01");
  const [parentDirectory, setParentDirectory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const suggestedFolderName = useMemo(() => {
    return businessName
      .trim()
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, " ");
  }, [businessName]);

  async function chooseDirectory() {
    const selected = await onChooseDirectory();
    if (selected) {
      setParentDirectory(selected);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onCreate({
        businessName,
        baseCurrency: "USD",
        booksStartDate,
        parentDirectory,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    businessName.trim().length > 0 &&
    booksStartDate.trim().length > 0 &&
    parentDirectory.trim().length > 0 &&
    !submitting;

  return (
    <section className="form-wrap" aria-labelledby="create-workspace-title">
      <div className="section-heading">
        <p className="eyebrow">New Workspace</p>
        <h1 id="create-workspace-title">Create an App-Created Workspace</h1>
      </div>

      <form className="workspace-form" onSubmit={submit}>
        {error ? (
          <div className="error-banner" role="alert">
            {error}
          </div>
        ) : null}

        <label>
          <span>Business name</span>
          <input
            name="businessName"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Acme Studio"
          />
        </label>

        <label>
          <span>Books start date</span>
          <input
            name="booksStartDate"
            type="date"
            value={booksStartDate}
            onChange={(event) => setBooksStartDate(event.target.value)}
          />
        </label>

        <label>
          <span>Currency</span>
          <input name="currency" value="USD" readOnly aria-readonly="true" />
        </label>

        <div className="directory-field">
          <label>
            <span>Parent directory</span>
            <input
              name="parentDirectory"
              value={parentDirectory}
              onChange={(event) => setParentDirectory(event.target.value)}
              placeholder="/Users/you/Accounting"
            />
          </label>
          <button type="button" className="secondary-button" onClick={chooseDirectory}>
            Choose
          </button>
        </div>

        <div className="folder-preview" aria-live="polite">
          Workspace folder: {suggestedFolderName || "Business name required"}
        </div>

        <div className="action-row">
          <button type="submit" className="primary-button" disabled={!canSubmit}>
            {submitting ? "Creating..." : "Create Workspace"}
          </button>
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
