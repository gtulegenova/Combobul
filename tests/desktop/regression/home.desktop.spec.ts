import { test, expect } from "../../../fixtures/base.fixture";

test.describe("Home resilience @desktop @regression @feature-home", () => {
  test("Desktop user still sees a valid landing state after reloading the page", async ({
    homePage,
    page,
  }) => {
    await test.step("Open the application home page", async () => {
      await homePage.goto();
    });

    await test.step("Validate landing content is present on first load", async () => {
      await homePage.expectLandingContent();
    });

    await test.step("Reload the page to simulate a returning session", async () => {
      await page.reload();
    });

    await test.step("Validate landing content is still intact after reload", async () => {
      await homePage.expectLandingContent();
    });

    await test.step("Validate the primary action remains actionable after reload", async () => {
      await expect(homePage.primaryAction).toBeVisible();
      await expect(homePage.primaryAction).toBeEnabled();
    });
  });
});
