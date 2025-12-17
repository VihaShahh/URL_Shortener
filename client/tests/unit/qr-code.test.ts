import { describe, expect, it } from "vitest";
import { generateStaticQr, MAX_QR_URL_BYTES, parseStaticQrUrl } from "../../src/lib/qr-code";

describe("static QR destinations", () => {
  it("preserves the original destination, Unicode, query and fragment", () => {
    const destination = "https://example.com/नमस्ते?item=tea%20time&next=%2Fmenu#offers";
    expect(parseStaticQrUrl(`  ${destination}  `)).toBe(destination);
  });

  it("accepts http and local-network destinations without fetching them", () => {
    expect(parseStaticQrUrl("http://localhost:8080/menu")).toBe("http://localhost:8080/menu");
  });

  it.each([
    "", "example.com/menu", "https:example.com", "javascript:alert(1)",
    "data:text/html,hello", "ftp://example.com", "https://", "https://bad host.test",
    "https://example.com/a\nb", "https://example.com/a b", "https://example.com/\u0000",
    "https://username:password@example.com", "https://username@example.com"
  ])("rejects an unsafe or malformed destination: %j", (input) => {
    expect(() => parseStaticQrUrl(input)).toThrow();
  });

  it("checks UTF-8 bytes rather than JavaScript character count", () => {
    const prefix = "https://example.com/";
    const limit = prefix + "a".repeat(MAX_QR_URL_BYTES - prefix.length);
    expect(parseStaticQrUrl(limit)).toBe(limit);
    expect(() => parseStaticQrUrl(`${limit}a`)).toThrow("too long");
    expect(() => parseStaticQrUrl(prefix + "茶".repeat(700))).toThrow("too long");
  });
});

describe("static QR artwork", () => {
  it("produces real PNG and SVG without inserting the destination as markup", async () => {
    const url = "https://example.com/?value=<script>alert(1)</script>#menu";
    const artwork = await generateStaticQr(url);
    expect(artwork.payload).toBe(url);
    expect(artwork.svg).toContain("<svg");
    expect(artwork.svg).not.toContain("<script");
    expect(artwork.svg).not.toContain("example.com");
    const png = Buffer.from(artwork.pngDataUrl.split(",")[1], "base64");
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(1024);
    expect(png.readUInt32BE(20)).toBe(1024);
  });
});
