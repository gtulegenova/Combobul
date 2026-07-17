import { test, expect } from "../../../fixtures/base.fixture";

test.describe("Home experience @desktop @smoke @feature-home", () => {
  test("Desktop user can validate the landing page entry flow", async ({ homePage }) => {
    await test.step("Open the application home page", async () => {
      await homePage.goto();
    });

    await test.step("Validate that key landing content is visible", async () => {
      await homePage.expectLandingContent();
    });

    await test.step("Validate primary action is available for the user", async () => {
      await expect(homePage.primaryAction).toBeVisible();
      await expect(homePage.primaryAction).toBeEnabled();
    });
  });
});
