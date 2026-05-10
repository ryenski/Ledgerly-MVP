import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import type {
  LedgerValidationSummary,
  WorkspaceCreateInput,
  WorkspaceSummary,
} from "./types";

type WorkspaceApi = {
  createWorkspace: (input: WorkspaceCreateInput) => Promise<WorkspaceSummary>;
  openWorkspace: (path: string) => Promise<WorkspaceSummary>;
  validateWorkspace: (path: string) => Promise<LedgerValidationSummary>;
  pickDirectory: () => Promise<string | null>;
  revealWorkspace: (path: string) => Promise<void>;
};

declare global {
  interface Window {
    __LEDGERLY_TEST_API__?: WorkspaceApi;
  }
}

export async function createWorkspace(
  input: WorkspaceCreateInput,
): Promise<WorkspaceSummary> {
  if (window.__LEDGERLY_TEST_API__) {
    return window.__LEDGERLY_TEST_API__.createWorkspace(input);
  }
  return invoke<WorkspaceSummary>("create_workspace", { input });
}

export async function openWorkspace(path: string): Promise<WorkspaceSummary> {
  if (window.__LEDGERLY_TEST_API__) {
    return window.__LEDGERLY_TEST_API__.openWorkspace(path);
  }
  return invoke<WorkspaceSummary>("open_workspace", { path });
}

export async function validateWorkspace(
  path: string,
): Promise<LedgerValidationSummary> {
  if (window.__LEDGERLY_TEST_API__) {
    return window.__LEDGERLY_TEST_API__.validateWorkspace(path);
  }
  return invoke<LedgerValidationSummary>("validate_workspace", { path });
}

export async function pickDirectory(): Promise<string | null> {
  if (window.__LEDGERLY_TEST_API__) {
    return window.__LEDGERLY_TEST_API__.pickDirectory();
  }
  let selected: unknown = null;
  try {
    selected = await openDialog({
      directory: true,
      multiple: false,
    });
  } catch {
    return null;
  }

  return typeof selected === "string" ? selected : null;
}

export async function revealWorkspace(path: string): Promise<void> {
  if (window.__LEDGERLY_TEST_API__) {
    return window.__LEDGERLY_TEST_API__.revealWorkspace(path);
  }
  await openPath(path);
}
