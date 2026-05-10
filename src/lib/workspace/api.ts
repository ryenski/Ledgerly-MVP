import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import type {
  AddSourceAccountInput,
  CsvImportInput,
  CsvImportResult,
  LedgerValidationSummary,
  WorkspaceCreateInput,
  WorkspaceSummary,
} from "./types";

type WorkspaceApi = {
  createWorkspace: (input: WorkspaceCreateInput) => Promise<WorkspaceSummary>;
  openWorkspace: (path: string) => Promise<WorkspaceSummary>;
  validateWorkspace: (path: string) => Promise<LedgerValidationSummary>;
  addSourceAccount: (input: AddSourceAccountInput) => Promise<WorkspaceSummary>;
  importStatementRows: (input: CsvImportInput) => Promise<CsvImportResult>;
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

export async function addSourceAccount(
  input: AddSourceAccountInput,
): Promise<WorkspaceSummary> {
  if (window.__LEDGERLY_TEST_API__) {
    return window.__LEDGERLY_TEST_API__.addSourceAccount(input);
  }
  return invoke<WorkspaceSummary>("add_source_account", { input });
}

export async function importStatementRows(
  input: CsvImportInput,
): Promise<CsvImportResult> {
  if (window.__LEDGERLY_TEST_API__) {
    return window.__LEDGERLY_TEST_API__.importStatementRows(input);
  }
  return invoke<CsvImportResult>("import_statement_rows", { input });
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
