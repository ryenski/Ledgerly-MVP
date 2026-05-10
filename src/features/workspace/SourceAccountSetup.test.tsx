import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SourceAccountSetup } from "./SourceAccountSetup";

describe("SourceAccountSetup", () => {
  it("submits a bank Source Account with an opening balance", async () => {
    const user = userEvent.setup();
    const onAddSourceAccount = vi.fn().mockResolvedValue(undefined);

    render(<SourceAccountSetup onAddSourceAccount={onAddSourceAccount} />);

    await user.type(screen.getByLabelText("Source Account name"), "Operating Checking");
    await user.type(screen.getByLabelText("Opening Balance"), "1250.25");
    await user.click(screen.getByRole("button", { name: "Add Source Account" }));

    expect(onAddSourceAccount).toHaveBeenCalledWith({
      kind: "bank",
      name: "Operating Checking",
      openingBalance: "1250.25",
    });
  });

  it("can submit a credit-card Source Account without an opening balance", async () => {
    const user = userEvent.setup();
    const onAddSourceAccount = vi.fn().mockResolvedValue(undefined);

    render(<SourceAccountSetup onAddSourceAccount={onAddSourceAccount} />);

    await user.selectOptions(screen.getByLabelText("Account kind"), "creditCard");
    await user.type(screen.getByLabelText("Source Account name"), "Business Card");
    await user.click(screen.getByRole("button", { name: "Add Source Account" }));

    expect(onAddSourceAccount).toHaveBeenCalledWith({
      kind: "creditCard",
      name: "Business Card",
      openingBalance: null,
    });
  });
});
