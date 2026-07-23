import { expect, Locator, Page } from "@playwright/test";

export type GhostTarget = string | Array<{ selector: string }>;

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

  async click(
    target: GhostTarget,
    options?: { optional?: boolean; preferred?: Locator | Locator[]; stepLabel?: string },
  ): Promise<boolean> {
    const locator = await this.resolveFirstLocator(options?.preferred, target);
    if (!locator) {
      if (options?.optional) {
        return false;
      }
      throw new Error(`Unable to locate element for click: ${this.describeTarget(target, options?.stepLabel)}`);
    }

    await expect(locator).toBeVisible();
    try {
      await locator.click();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const pointerIntercepted =
        message.includes("intercepts pointer events") || message.includes("subtree intercepts pointer events");

      if (!pointerIntercepted) {
        throw error;
      }

      // UI controls like react-switch can expose visible child nodes that intercept
      // pointer events on the container. Fall back to force click, then DOM click.
      try {
        await locator.click({ force: true });
      } catch {
        await locator.evaluate((element) => {
          (element as HTMLElement).click();
        });
      }
    }
    return true;
  }

  async fill(
    target: GhostTarget,
    value: string,
    options?: { optional?: boolean; preferred?: Locator | Locator[]; stepLabel?: string },
  ): Promise<boolean> {
    const locator = await this.resolveFirstLocator(options?.preferred, target);
    if (!locator) {
      if (options?.optional) {
        return false;
      }
      throw new Error(`Unable to locate element for fill: ${this.describeTarget(target, options?.stepLabel)}`);
    }

    await expect(locator).toBeVisible();
    await locator.fill(value);
    return true;
  }

  async assertElementPresent(
    target: GhostTarget,
    options?: { optional?: boolean; preferred?: Locator | Locator[]; stepLabel?: string },
  ): Promise<boolean> {
    const locator = await this.resolveFirstLocator(options?.preferred, target);
    if (!locator) {
      if (options?.optional) {
        return false;
      }
      throw new Error(`Unable to locate element for assertion: ${this.describeTarget(target, options?.stepLabel)}`);
    }

    await expect(locator).toBeVisible();
    return true;
  }

  async assertTextPresent(
    target: GhostTarget,
    text: string,
    options?: { optional?: boolean; preferred?: Locator | Locator[]; stepLabel?: string },
  ): Promise<boolean> {
    const locator = await this.resolveFirstLocator(options?.preferred, target);
    if (!locator) {
      if (options?.optional) {
        return false;
      }
      throw new Error(`Unable to locate element for text assertion: ${this.describeTarget(target, options?.stepLabel)}`);
    }

    await expect(locator).toContainText(text);
    return true;
  }

  async pause(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
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

  private describeTarget(target: GhostTarget, label?: string): string {
    const selectors = this.selectorsFromTarget(target).join(" OR ");
    return label ? `${label} -> ${selectors}` : selectors;
  }

  private selectorsFromTarget(target: GhostTarget): string[] {
    if (typeof target === "string") {
      return [target];
    }
    return target.map((item) => item.selector);
  }

  private toLocator(selector: string): Locator {
    const trimmed = selector.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("(") || trimmed.startsWith("xpath=") || trimmed.startsWith("/")) {
      return this.page.locator(trimmed.startsWith("xpath=") ? trimmed : `xpath=${trimmed}`);
    }
    return this.page.locator(trimmed);
  }

  private async resolveFirstLocator(preferred: Locator | Locator[] | undefined, target: GhostTarget): Promise<Locator | null> {
    const preferredList = Array.isArray(preferred) ? preferred : preferred ? [preferred] : [];
    const targetLocators = this.selectorsFromTarget(target).map((selector) => this.toLocator(selector));
    const candidates = [...preferredList, ...targetLocators];

    for (const locator of candidates) {
      if ((await locator.count()) === 0) {
        continue;
      }
      const first = locator.first();
      if (await first.isVisible().catch(() => false)) {
        return first;
      }
    }

    for (const locator of candidates) {
      if ((await locator.count()) > 0) {
        return locator.first();
      }
    }

    return null;
  }
}
