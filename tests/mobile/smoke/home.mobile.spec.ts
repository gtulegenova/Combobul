import { test, expect } from "../../../fixtures/base.fixture";

test.describe("Home experience @mobile @smoke @feature-home", () => {
  test("Mobile-style user can open navigation and verify landing state", async ({ homePage }) => {
    await test.step("Open the home page in a mobile viewport", async () => {
      await homePage.goto();
    });

    await test.step("Confirm landing content is visible before opening navigation", async () => {
      await homePage.expectLandingContent();
    });

    await test.step("Open collapsed mobile navigation menu", async () => {
      await homePage.openMobileMenu();
    });

    await test.step("Confirm the primary action remains visible after menu interaction", async () => {
      await expect(homePage.primaryAction).toBeVisible();
    });
  });
});
