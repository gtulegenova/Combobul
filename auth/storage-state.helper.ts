import { Browser, Page } from "@playwright/test";
import { loginViaUi } from "./auth.helper";

export async function buildStorageState(
  browser: Browser,
  baseUrl: string,
  email: string,
  password: string,
  outputFile: string,
): Promise<void> {
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  await page.goto(baseUrl);
  await loginViaUi(page, email, password);
  await context.storageState({ path: outputFile });
  await context.close();
}
