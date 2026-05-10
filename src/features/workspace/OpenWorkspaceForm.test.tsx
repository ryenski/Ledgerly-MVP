import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OpenWorkspaceForm } from "./OpenWorkspaceForm";

describe("OpenWorkspaceForm", () => {
  it("requires a Workspace path", () => {
    render(
      <OpenWorkspaceForm
        onCancel={vi.fn()}
        onChooseDirectory={async () => null}
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Open Workspace" })).toBeDisabled();
  });

  it("opens the selected Workspace path", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn().mockResolvedValue(undefined);

    render(
      <OpenWorkspaceForm
        onCancel={vi.fn()}
        onChooseDirectory={async () => "/tmp/Acme Studio"}
        onOpen={onOpen}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Choose" }));
    await user.click(screen.getByRole("button", { name: "Open Workspace" }));

    expect(onOpen).toHaveBeenCalledWith("/tmp/Acme Studio");
  });

  it("renders errors", () => {
    render(
      <OpenWorkspaceForm
        onCancel={vi.fn()}
        onChooseDirectory={async () => null}
        onOpen={vi.fn()}
        error="This folder is not an App-Created Workspace."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "This folder is not an App-Created Workspace.",
    );
  });
});
