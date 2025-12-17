import QRCode from "qrcode";

export const QR_PRESETS = [
  { id: "classic", name: "Classic", foreground: "#000000", background: "#ffffff" },
  { id: "navy", name: "Navy", foreground: "#112647", background: "#ffffff" },
  { id: "forest", name: "Forest", foreground: "#075c48", background: "#f0fdf4" }
] as const;

export type QrPresetId = (typeof QR_PRESETS)[number]["id"];

export type StaticQrArtwork = {
  payload: string;
  presetId: QrPresetId;
  pngDataUrl: string;
  svg: string;
};

export const QR_EXPORT_PIXELS = 1024;
export const MAX_QR_URL_BYTES = 2048;

export function parseStaticQrUrl(input: string): string {
  const value = input.trim();

  if (!value) {
    throw new Error("Enter the URL you want people to open.");
  }

  if (!/^https?:\/\//i.test(value)) {
    throw new Error("Use a complete URL starting with https:// or http://.");
  }

  if (/[\s\u0000-\u001f\u007f]/u.test(value)) {
    throw new Error("Remove spaces and line breaks, or encode spaces as %20.");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Enter a valid URL, such as https://example.com/menu.");
  }

  if (!parsed.hostname || !["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Enter a valid http:// or https:// destination.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("Use a URL without an embedded username or password.");
  }

  if (new TextEncoder().encode(value).length > MAX_QR_URL_BYTES) {
    throw new Error("This URL is too long. Use a destination of 2,048 bytes or less.");
  }

  // Preserve query strings, fragments and Unicode rather than rewriting the payload.
  return value;
}

export async function generateStaticQr(
  input: string,
  presetId: QrPresetId = "classic"
): Promise<StaticQrArtwork> {
  const payload = parseStaticQrUrl(input);
  const preset = QR_PRESETS.find((candidate) => candidate.id === presetId);

  if (!preset) {
    throw new Error("Choose one of the supported QR color presets.");
  }

  const options = {
    errorCorrectionLevel: "M" as const,
    margin: 4,
    width: QR_EXPORT_PIXELS,
    color: { dark: preset.foreground, light: preset.background }
  };

  try {
    const [pngDataUrl, svg] = await Promise.all([
      QRCode.toDataURL(payload, { ...options, type: "image/png" }),
      QRCode.toString(payload, { ...options, type: "svg" })
    ]);

    return { payload, presetId, pngDataUrl, svg };
  } catch {
    throw new Error("We couldn't generate this QR. Try a shorter URL and generate again.");
  }
}
