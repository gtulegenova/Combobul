import { defineConfig, devices, PlaywrightTestConfig, Project } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const isCI = Boolean(process.env.CI);
const baseURL = process.env.BASE_URL;

if (!baseURL) {
  // Keep this warning visible so missing env setup is obvious.
  // eslint-disable-next-line no-console
  console.warn("BASE_URL is not set. Tests that rely on navigation will fail until .env is configured.");
}

const tagPattern = process.env.TAGS
  ? new RegExp(
      process.env.TAGS
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .join("|"),
    )
  : undefined;

const browserProjectFilter = new Set(
  (process.env.BROWSERS ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean),
);

const allProjects: Project[] = [
  {
    name: "desktop-chromium",
    testMatch: ["**/*.desktop.spec.ts"],
    use: {
      ...devices["Desktop Chrome"],
    },
  },
  {
    name: "desktop-firefox",
    testMatch: ["**/*.desktop.spec.ts"],
    use: {
      ...devices["Desktop Firefox"],
    },
  },
  {
    name: "desktop-webkit",
    testMatch: ["**/*.desktop.spec.ts"],
    use: {
      ...devices["Desktop Safari"],
    },
  },
  {
    name: "desktop-edge",
    testMatch: ["**/*.desktop.spec.ts"],
    use: {
      ...devices["Desktop Chrome"],
      channel: "msedge",
    },
  },
  {
    name: "mobile-chromium",
    testMatch: ["**/*.mobile.spec.ts"],
    use: {
      ...devices["Pixel 7"],
    },
  },
  {
    name: "mobile-webkit",
    testMatch: ["**/*.mobile.spec.ts"],
    use: {
      ...devices["iPhone 13"],
    },
  },
];

const projects =
  browserProjectFilter.size === 0
    ? allProjects
    : allProjects.filter((project) => browserProjectFilter.has(project.name));

const config: PlaywrightTestConfig = defineConfig({
  testDir: "./tests",
  timeout: Number(process.env.TEST_TIMEOUT_MS ?? 60_000),
  expect: {
    timeout: Number(process.env.EXPECT_TIMEOUT_MS ?? 10_000),
  },
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  grep: tagPattern,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  outputDir: "test-results/artifacts",
  use: {
    baseURL,
    headless: process.env.HEADLESS !== "false",
    actionTimeout: Number(process.env.ACTION_TIMEOUT_MS ?? 15_000),
    navigationTimeout: Number(process.env.NAV_TIMEOUT_MS ?? 30_000),
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
    timezoneId: process.env.TIMEZONE ?? "UTC",
  },
  projects,
});

export default config;
