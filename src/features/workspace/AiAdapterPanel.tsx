import { useState } from "react";
import type { FormEvent } from "react";
import type { AiAdapterConfig, AiContextDisclosure } from "../../lib/workspace/types";

type AiAdapterPanelProps = {
  config: AiAdapterConfig;
  disclosure: AiContextDisclosure;
  onConfigure: (command: string | null) => Promise<void> | void;
};

export function AiAdapterPanel({
  config,
  disclosure,
  onConfigure,
}: AiAdapterPanelProps) {
  const [command, setCommand] = useState(config.command || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfigure(command.trim() || null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="ai-adapter" aria-labelledby="ai-adapter-title">
      <div className="section-heading">
        <p className="eyebrow">BYO AI Adapter</p>
        <h2 id="ai-adapter-title">Optional local suggestions</h2>
      </div>

      <form className="workspace-form" onSubmit={handleSubmit}>
        <label>
          Adapter Command
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="/path/to/adapter"
          />
        </label>
        <button className="secondary-button" type="submit" disabled={isSubmitting}>
          Save Adapter
        </button>
      </form>

      <div className="ai-disclosure">
        <p className="eyebrow">AI Context Disclosure</p>
        <p>{disclosure.adapterConfigured ? "Adapter configured" : "No adapter configured"}</p>
        <ul>
          {disclosure.fieldsSent.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
