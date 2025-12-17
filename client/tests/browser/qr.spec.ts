import { readFile } from "node:fs/promises";
import { test as base, expect, type Page } from "@playwright/test";
import jsQR from "jsqr";
import sharp from "sharp";

const test = base.extend<{ networkGuard: void }>({
  networkGuard: [async ({ page, baseURL }, use) => {
    const unexpectedRequests: string[] = [];
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.origin === baseURL || ["data:", "blob:"].includes(url.protocol)) {
        return route.continue();
      }
      unexpectedRequests.push(url.toString());
      return route.abort();
    });
    await use();
    expect(errors, "browser runtime errors").toEqual([]);
    expect(unexpectedRequests, "no backend or third-party requests from the generator").toEqual([]);
  }, { auto: true }]
});

async function generate(page: Page, payload: string, color = "Classic") {
  await page.getByLabel("Destination URL", { exact: true }).fill(payload);
  await page.getByText(color, { exact: true }).click();
  await expect(page.getByRole("radio", { name: color, exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Generate QR code", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("QR ready. Scan it once before you print.");
}

async function download(page: Page, format: "PNG" | "SVG") {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: `Download ${format}`, exact: true }).click();
  const artifact = await pending;
  expect(artifact.suggestedFilename()).toBe(`static-qr.${format.toLowerCase()}`);
  const path = await artifact.path();
  if (!path) throw new Error("Download did not produce a local file");
  return readFile(path);
}

async function decodedPayload(artifact: Buffer) {
  const { data, info } = await sharp(artifact)
    .resize(512, 512, { kernel: "nearest" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  expect(decoded, "independent scanner must recognize the exported QR").not.toBeNull();
  return decoded?.data;
}

const destinations = [
  "https://example.com/नमस्ते?item=茶&next=%2Fmenu#offers",
  "https://example.com/?value=<script>alert(1)</script>&item=tea%20time#menu",
  "http://example.com/menu?source=flyer&code=a%2Bb#today"
];

for (const color of ["Classic", "Navy", "Forest"]) {
  for (const [index, destination] of destinations.entries()) {
    test(`${color} PNG and SVG preserve destination ${index + 1}`, async ({ page }, testInfo) => {
      await page.goto("/qr");
      await generate(page, destination, color);
      const png = await download(page, "PNG");
      const svg = await download(page, "SVG");
      const metadata = await sharp(png).metadata();
      expect(metadata.width).toBe(1024);
      expect(metadata.height).toBe(1024);
      expect(await decodedPayload(png)).toBe(destination);
      expect(await decodedPayload(svg)).toBe(destination);
      expect(svg.toString()).not.toMatch(/<(?:script|foreignObject|image)\b|\son\w+=|href=/i);
      expect(await page.evaluate(() => ({ cookies: document.cookie, storage: localStorage.length })))
        .toEqual({ cookies: "", storage: 0 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (color === "Classic" && index === 0) {
        await page.screenshot({ path: testInfo.outputPath("qr-generator.png"), fullPage: true });
      }
    });
  }
}

test("editing a destination or style invalidates previous downloads", async ({ page }) => {
  await page.goto("/qr");
  await expect(page.getByRole("button", { name: "Download PNG" })).toBeDisabled();
  await generate(page, destinations[0]);
  await page.getByLabel("Destination URL", { exact: true }).fill(destinations[2]);
  await expect(page.getByRole("button", { name: "Download PNG" })).toBeDisabled();
  await expect(page.getByRole("img", { name: "Generated static QR code" })).toHaveCount(0);
  await generate(page, destinations[2]);
  expect(await decodedPayload(await download(page, "PNG"))).toBe(destinations[2]);
  await page.getByText("Navy", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Download SVG" })).toBeDisabled();
});

test("invalid destinations have useful errors and no downloadable artwork", async ({ page }) => {
  await page.goto("/qr");
  for (const destination of ["", "example.com", "javascript:alert(1)", "https://user:secret@example.com", `https://example.com/${"茶".repeat(700)}`]) {
    await page.getByLabel("Destination URL", { exact: true }).fill(destination);
    await page.getByRole("button", { name: "Generate QR code", exact: true }).click();
    await expect(page.getByRole("form", { name: "Static QR generator" }).getByRole("alert")).toBeVisible();
    await expect(page.getByLabel("Destination URL", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("button", { name: "Download PNG" })).toBeDisabled();
  }
});

test("generation and both downloads work offline after the page is loaded", async ({ page, context }) => {
  await page.goto("/qr");
  await expect(page.getByRole("button", { name: "Generate QR code" })).toBeEnabled();
  await context.setOffline(true);
  try {
    await generate(page, destinations[0]);
    expect(await decodedPayload(await download(page, "PNG"))).toBe(destinations[0]);
    expect(await decodedPayload(await download(page, "SVG"))).toBe(destinations[0]);
  } finally {
    await context.setOffline(false);
  }
});

test("a failed canvas export shows a recoverable error", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.toDataURL = () => { throw new Error("Canvas export unavailable"); };
  });
  await page.goto("/qr");
  await page.getByLabel("Destination URL", { exact: true }).fill(destinations[2]);
  await page.getByRole("button", { name: "Generate QR code", exact: true }).click();
  await expect(page.getByRole("form", { name: "Static QR generator" }).getByRole("alert")).toContainText("couldn't generate");
  await expect(page.getByRole("button", { name: "Generate QR code" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Download PNG" })).toBeDisabled();
});

test("QR navigation preserves the existing links workflow", async ({ page }) => {
  await page.route("http://127.0.0.1:59999/**", (route) => route.fulfill({
    status: 503, contentType: "application/json", body: JSON.stringify({ message: "Backend unavailable" })
  }));
  await page.goto("/qr");
  await page.getByRole("link", { name: "Links", exact: true }).click();
  await expect(page.getByRole("button", { name: "Create short link" })).toBeVisible();
  await page.getByRole("link", { name: "QR codes", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("QR codes");
});
