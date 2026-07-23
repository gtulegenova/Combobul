import { expect, Locator, Page } from "@playwright/test";

export class HomePage {
  private readonly page: Page;

  readonly mainRegion: Locator;
  readonly appHeader: Locator;
  readonly pageTitle: Locator;
  readonly primaryAction: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainRegion = this.page.getByRole("main");
    this.appHeader = this.page.getByRole("banner");
    this.pageTitle = this.page.getByTestId("home-title");
    this.primaryAction = this.page.getByTestId("primary-action");
    this.mobileMenuButton = this.page.getByRole("button", { name: /menu|navigation/i });
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
    await expect(this.page).toHaveURL(/.+/);
  }

  async expectLandingContent(): Promise<void> {
    await expect(this.appHeader).toBeVisible();
    await expect(this.mainRegion).toBeVisible();
    await expect(this.pageTitle).toBeVisible();
    await expect(this.primaryAction).toBeVisible();
    await expect(this.primaryAction).toBeEnabled();
  }

  async openMobileMenu(): Promise<void> {
    await this.mobileMenuButton.click();
  }
}
