import { expect, Locator, Page } from "@playwright/test";

export class TargetAudiencePage {
  private readonly page: Page;

  readonly createButton: Locator;
  readonly nameInput: Locator;
  readonly saveButton: Locator;
  readonly audienceTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = this.page
      .getByRole("button", { name: /add|new|create/i })
      .or(this.page.locator('[data-testid="add-target-audience"]'));
    this.nameInput = this.page
      .getByLabel(/name/i)
      .or(this.page.getByPlaceholder(/name/i))
      .or(this.page.locator('input[name*="name" i]').first());
    this.saveButton = this.page
      .getByRole("button", { name: /save|create|submit|apply/i })
      .or(this.page.locator('button[type="submit"]').first());
    this.audienceTable = this.page
      .getByRole("table")
      .or(this.page.locator('[role="grid"]'))
      .or(this.page.locator("table").first());
  }

  async gotoDefaultTargetAudienceList(): Promise<void> {
    await this.page.goto("/main/plugin/target-audience/default/", {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await expect(this.page).toHaveURL(/target-audience/i);
  }

  async expectListLoaded(): Promise<void> {
    await expect(this.audienceTable).toBeVisible();
  }

  async createAudience(name: string): Promise<void> {
    await this.createButton.click();
    await expect(this.nameInput).toBeVisible();
    await this.nameInput.fill(name);
    await this.saveButton.click();
  }

  async editAudienceName(existingName: string, newName: string): Promise<void> {
    const row = this.rowByName(existingName);
    await expect(row).toBeVisible();
    await this.openRowActions(row);
    await this.page.getByRole("menuitem", { name: /edit/i }).click();
    await expect(this.nameInput).toBeVisible();
    await this.nameInput.fill(newName);
    await this.saveButton.click();
  }

  async duplicateAudience(name: string): Promise<void> {
    const row = this.rowByName(name);
    await expect(row).toBeVisible();
    await this.openRowActions(row);
    await this.page.getByRole("menuitem", { name: /duplicate|copy/i }).click();
  }

  async archiveAudience(name: string): Promise<void> {
    const row = this.rowByName(name);
    await expect(row).toBeVisible();
    await this.openRowActions(row);
    await this.page.getByRole("menuitem", { name: /archive/i }).click();

    const confirmButton = this.page
      .getByRole("button", { name: /archive|confirm|yes/i })
      .or(this.page.getByRole("menuitem", { name: /archive|confirm|yes/i }));
    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }
  }

  async expectAudienceVisible(name: string): Promise<void> {
    await expect(this.rowByName(name)).toBeVisible();
  }

  async expectAudienceNotVisible(name: string): Promise<void> {
    await expect(this.rowByName(name)).toHaveCount(0);
  }

  private rowByName(name: string): Locator {
    return this.page
      .locator("tr, [role='row'], .MuiDataGrid-row")
      .filter({ hasText: name })
      .first();
  }

  private async openRowActions(row: Locator): Promise<void> {
    const actionButton = row
      .getByRole("button", { name: /more|actions|options|menu/i })
      .or(row.locator("button[aria-label*='more' i], button[aria-label*='action' i]").first())
      .or(row.locator("button").last());

    await expect(actionButton).toBeVisible();
    await actionButton.click();
  }
}
