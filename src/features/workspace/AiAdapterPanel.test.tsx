import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AiAdapterPanel } from "./AiAdapterPanel";

describe("AiAdapterPanel", () => {
  it("saves local adapter configuration and shows disclosure", async () => {
    const user = userEvent.setup();
    const onConfigure = vi.fn().mockResolvedValue(undefined);

    render(
      <AiAdapterPanel
        config={{ command: null }}
        disclosure={{
          adapterConfigured: false,
          fieldsSent: ["Statement Row", "Chart of Accounts"],
        }}
        onConfigure={onConfigure}
      />,
    );

    await user.type(screen.getByLabelText("Adapter Command"), "/tmp/adapter");
    await user.click(screen.getByRole("button", { name: "Save Adapter" }));

    expect(onConfigure).toHaveBeenCalledWith("/tmp/adapter");
    expect(screen.getByText("AI Context Disclosure")).toBeInTheDocument();
    expect(screen.getByText("Statement Row")).toBeInTheDocument();
  });
});
