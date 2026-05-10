import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceOverview } from "./WorkspaceOverview";
import type { WorkspaceSummary } from "../../lib/workspace/types";

const workspace: WorkspaceSummary = {
  rootPath: "/tmp/Acme Studio",
  businessName: "Acme Studio",
  baseCurrency: "USD",
  booksStartDate: "2026-01-01",
  ledgerStatus: "valid",
};

describe("WorkspaceOverview", () => {
  it("shows Workspace details and required files", () => {
    render(
      <WorkspaceOverview
        workspace={workspace}
        onReveal={vi.fn()}
        onOpenAnother={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Acme Studio" })).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("2026-01-01")).toBeInTheDocument();
    expect(screen.getByText("/tmp/Acme Studio")).toBeInTheDocument();
    expect(screen.getByText("main.bean")).toBeInTheDocument();
    expect(screen.getByText("accounts.bean")).toBeInTheDocument();
    expect(screen.getByText("opening-balances.bean")).toBeInTheDocument();
    expect(screen.getByText(".ledgerly/workspace.json")).toBeInTheDocument();
    expect(screen.getByText(".ledgerly/ledgerly.sqlite")).toBeInTheDocument();
  });

  it("runs reveal and open another callbacks", async () => {
    const user = userEvent.setup();
    const onReveal = vi.fn();
    const onOpenAnother = vi.fn();

    render(
      <WorkspaceOverview
        workspace={workspace}
        onReveal={onReveal}
        onOpenAnother={onOpenAnother}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Reveal Workspace" }));
    await user.click(screen.getByRole("button", { name: "Open Another Workspace" }));

    expect(onReveal).toHaveBeenCalledOnce();
    expect(onOpenAnother).toHaveBeenCalledOnce();
  });

  it("renders errors", () => {
    render(
      <WorkspaceOverview
        workspace={workspace}
        onReveal={vi.fn()}
        onOpenAnother={vi.fn()}
        error="Could not reveal Workspace."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Could not reveal Workspace.");
  });
});
