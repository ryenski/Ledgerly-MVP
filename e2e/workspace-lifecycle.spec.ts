import { expect, test } from "@playwright/test";

test("creates and reopens a Workspace through the app shell", async ({ page }) => {
  await page.addInitScript(() => {
    const workspace = {
      rootPath: "/tmp/Acme Studio",
      businessName: "Acme Studio",
      baseCurrency: "USD" as const,
      booksStartDate: "2026-01-01",
      ledgerStatus: "valid" as const,
      ledgerValidation: {
        status: "valid" as const,
        errors: [],
      },
    };

    window.__LEDGERLY_TEST_API__ = {
      async createWorkspace() {
        return workspace;
      },
      async openWorkspace() {
        return workspace;
      },
      async validateWorkspace() {
        return { status: "valid", errors: [] };
      },
      async addSourceAccount() {
        return workspace;
      },
      async pickDirectory() {
        return "/tmp";
      },
      async revealWorkspace() {},
    };
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Create Workspace" }).click();
  await page.getByLabel("Business name").fill("Acme Studio");
  await page.getByLabel("Books start date").fill("2026-01-01");
  await page.getByRole("button", { name: "Choose" }).click();
  await page.getByRole("button", { name: "Create Workspace" }).click();

  await expect(page.getByRole("heading", { name: "Acme Studio" })).toBeVisible();
  await expect(page.getByText("USD")).toBeVisible();
  await expect(page.getByText("2026-01-01")).toBeVisible();
  await expect(page.getByText("main.bean")).toBeVisible();

  await page.getByRole("button", { name: "Open Another Workspace" }).click();
  await page.getByRole("button", { name: "Choose" }).click();
  await page.getByRole("button", { name: "Open Workspace" }).click();
  await expect(page.getByRole("heading", { name: "Acme Studio" })).toBeVisible();
});
