import { defineConfig } from "@playwright/test";

const port = Number(process.env.QR_TEST_PORT ?? 3107);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: "test-results",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    baseURL,
    browserName: "chromium",
    channel: process.env.QR_BROWSER_CHANNEL,
    trace: "retain-on-failure"
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ],
  webServer: {
    command: `npm run build && npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: `${baseURL}/qr`,
    env: { NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:59999", NEXT_TELEMETRY_DISABLED: "1" },
    reuseExistingServer: false,
    timeout: 120_000
  }
});
