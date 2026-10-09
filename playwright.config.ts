import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: "test/scratch/playwright-results",
  use: {
    baseURL: process.env.PREVIEW_URL || "http://127.0.0.1:4173/preview/",
    browserName: "chromium",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : undefined,
    viewport: { width: 1440, height: 1000 },
    trace: "off",
  },
  webServer: process.env.PREVIEW_URL
    ? undefined
    : {
        command: "node tests/serve.mjs",
        url: "http://127.0.0.1:4173/preview/",
        reuseExistingServer: false,
      },
});
