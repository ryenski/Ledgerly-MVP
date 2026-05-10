import { FormEvent, useState } from "react";

type OpenWorkspaceFormProps = {
  onCancel: () => void;
  onChooseDirectory: () => Promise<string | null>;
  onOpen: (path: string) => Promise<void>;
  error?: string | null;
};

export function OpenWorkspaceForm({
  onCancel,
  onChooseDirectory,
  onOpen,
  error,
}: OpenWorkspaceFormProps) {
  const [workspacePath, setWorkspacePath] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function chooseDirectory() {
    const selected = await onChooseDirectory();
    if (selected) {
      setWorkspacePath(selected);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onOpen(workspacePath);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="form-wrap" aria-labelledby="open-workspace-title">
      <div className="section-heading">
        <p className="eyebrow">Existing Workspace</p>
        <h1 id="open-workspace-title">Open an App-Created Workspace</h1>
      </div>

      <form className="workspace-form" onSubmit={submit}>
        {error ? (
          <div className="error-banner" role="alert">
            {error}
          </div>
        ) : null}

        <div className="directory-field">
          <label>
            <span>Workspace path</span>
            <input
              name="workspacePath"
              value={workspacePath}
              onChange={(event) => setWorkspacePath(event.target.value)}
              placeholder="/Users/you/Accounting/Acme Studio"
            />
          </label>
          <button type="button" className="secondary-button" onClick={chooseDirectory}>
            Choose
          </button>
        </div>

        <div className="action-row">
          <button
            type="submit"
            className="primary-button"
            disabled={workspacePath.trim().length === 0 || submitting}
          >
            {submitting ? "Opening..." : "Open Workspace"}
          </button>
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
