import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import {
  addSourceAccount,
  approveSuggestedEntry,
  createWorkspace,
  getBrokenProvenance,
  getSuggestedEntries,
  importStatementRows,
  openWorkspace,
  pickDirectory,
  revealWorkspace,
  validateWorkspace,
} from "./lib/workspace/api";
import type {
  CsvSourceMappingInput,
  BrokenProvenance,
  SourceAccountKind,
  SuggestedEntry,
  WorkspaceCreateInput,
  WorkspaceSummary,
} from "./lib/workspace/types";
import { CreateWorkspaceForm } from "./features/workspace/CreateWorkspaceForm";
import { OpenWorkspaceForm } from "./features/workspace/OpenWorkspaceForm";
import { WorkspaceOverview } from "./features/workspace/WorkspaceOverview";
import { WorkspaceStart } from "./features/workspace/WorkspaceStart";

type View = "start" | "create" | "open" | "overview";

function userFacingError(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Ledgerly could not complete that Workspace action.";
}

export default function App() {
  const [view, setView] = useState<View>("start");
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [suggestedEntries, setSuggestedEntries] = useState<SuggestedEntry[]>([]);
  const [brokenProvenance, setBrokenProvenance] = useState<BrokenProvenance[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(input: WorkspaceCreateInput) {
    setError(null);
    try {
      const created = await createWorkspace(input);
      setWorkspace(created);
      setSuggestedEntries([]);
      setBrokenProvenance([]);
      setView("overview");
    } catch (caught) {
      setError(userFacingError(caught));
    }
  }

  async function handleOpenWorkspace(path: string) {
    setError(null);
    try {
      const opened = await openWorkspace(path);
      setWorkspace(opened);
      setSuggestedEntries(await getSuggestedEntries(opened.rootPath));
      setBrokenProvenance(await getBrokenProvenance(opened.rootPath));
      setView("overview");
    } catch (caught) {
      setError(userFacingError(caught));
    }
  }

  async function handleReveal() {
    if (!workspace) return;
    setError(null);
    try {
      await revealWorkspace(workspace.rootPath);
    } catch (caught) {
      setError(userFacingError(caught));
    }
  }

  async function handleValidateWorkspace() {
    if (!workspace) return;
    setError(null);
    try {
      const ledgerValidation = await validateWorkspace(workspace.rootPath);
      setWorkspace({
        ...workspace,
        ledgerStatus: ledgerValidation.status,
        ledgerValidation,
      });
      setBrokenProvenance(await getBrokenProvenance(workspace.rootPath));
    } catch (caught) {
      setError(userFacingError(caught));
    }
  }

  async function handleAddSourceAccount(input: {
    kind: SourceAccountKind;
    name: string;
    openingBalance: string | null;
  }) {
    if (!workspace) return;
    setError(null);
    try {
      const updated = await addSourceAccount({
        workspaceRootPath: workspace.rootPath,
        ...input,
      });
      setWorkspace(updated);
      setSuggestedEntries(await getSuggestedEntries(updated.rootPath));
      setBrokenProvenance(await getBrokenProvenance(updated.rootPath));
    } catch (caught) {
      setError(userFacingError(caught));
    }
  }

  async function handleImportStatementRows(input: {
    sourceAccount: string;
    sourceFileName: string;
    csvContents: string;
    mapping: CsvSourceMappingInput;
  }) {
    if (!workspace) return;
    setError(null);
    try {
      await importStatementRows({
        workspaceRootPath: workspace.rootPath,
        ...input,
      });
      await handleValidateWorkspace();
      setSuggestedEntries(await getSuggestedEntries(workspace.rootPath));
      setBrokenProvenance(await getBrokenProvenance(workspace.rootPath));
    } catch (caught) {
      setError(userFacingError(caught));
    }
  }

  async function handleApproveSuggestedEntry(input: {
    statementRowId: string;
    ledgerAccount: string;
  }) {
    if (!workspace) return;
    setError(null);
    try {
      const updated = await approveSuggestedEntry({
        workspaceRootPath: workspace.rootPath,
        ...input,
      });
      setWorkspace(updated);
      setSuggestedEntries(await getSuggestedEntries(updated.rootPath));
      setBrokenProvenance(await getBrokenProvenance(updated.rootPath));
    } catch (caught) {
      setError(userFacingError(caught));
    }
  }

  useEffect(() => {
    if (view !== "overview" || !workspace) return;

    function revalidateOnFocus() {
      void handleValidateWorkspace();
    }

    window.addEventListener("focus", revalidateOnFocus);
    return () => window.removeEventListener("focus", revalidateOnFocus);
  }, [view, workspace?.rootPath]);

  return (
    <AppShell>
      {view === "start" ? (
        <WorkspaceStart
          onCreate={() => {
            setError(null);
            setView("create");
          }}
          onOpen={() => {
            setError(null);
            setView("open");
          }}
          error={error}
        />
      ) : null}

      {view === "create" ? (
        <CreateWorkspaceForm
          onCancel={() => {
            setError(null);
            setView("start");
          }}
          onChooseDirectory={pickDirectory}
          onCreate={handleCreate}
          error={error}
        />
      ) : null}

      {view === "open" ? (
        <OpenWorkspaceForm
          onCancel={() => {
            setError(null);
            setView("start");
          }}
          onChooseDirectory={pickDirectory}
          onOpen={handleOpenWorkspace}
          error={error}
        />
      ) : null}

      {view === "overview" && workspace ? (
        <WorkspaceOverview
          workspace={workspace}
          suggestedEntries={suggestedEntries}
          brokenProvenance={brokenProvenance}
          onReveal={handleReveal}
          onValidate={handleValidateWorkspace}
          onAddSourceAccount={handleAddSourceAccount}
          onImportStatementRows={handleImportStatementRows}
          onApproveSuggestedEntry={handleApproveSuggestedEntry}
          onOpenAnother={() => {
            setError(null);
            setView("open");
          }}
          error={error}
        />
      ) : null}
    </AppShell>
  );
}
