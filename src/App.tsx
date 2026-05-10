import { useState } from "react";
import { AppShell } from "./components/AppShell";
import {
  createWorkspace,
  openWorkspace,
  pickDirectory,
  revealWorkspace,
} from "./lib/workspace/api";
import type { WorkspaceCreateInput, WorkspaceSummary } from "./lib/workspace/types";
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
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(input: WorkspaceCreateInput) {
    setError(null);
    try {
      const created = await createWorkspace(input);
      setWorkspace(created);
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
          onReveal={handleReveal}
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
