import { expect, Page } from "@playwright/test";

export async function loginViaUi(page: Page, email: string, password: string): Promise<void> {
  await page.getByLabel(/email|username/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();

  // Replace this assertion with a domain-specific "logged-in" signal.
  await expect(page.getByRole("main")).toBeVisible();
}
