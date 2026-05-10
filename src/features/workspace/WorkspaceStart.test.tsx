import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WorkspaceStart } from "./WorkspaceStart";

describe("WorkspaceStart", () => {
  it("offers create and open Workspace actions", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onOpen = vi.fn();

    render(<WorkspaceStart onCreate={onCreate} onOpen={onOpen} />);

    await user.click(screen.getByRole("button", { name: "Create Workspace" }));
    await user.click(screen.getByRole("button", { name: "Open Workspace" }));

    expect(onCreate).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("renders errors", () => {
    render(
      <WorkspaceStart
        onCreate={vi.fn()}
        onOpen={vi.fn()}
        error="This folder is not an App-Created Workspace."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This folder is not an App-Created Workspace.",
    );
  });
});
