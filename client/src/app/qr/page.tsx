import type { Metadata } from "next";
import { StaticQrGenerator } from "@/features/qr/static-qr-generator";

export const metadata: Metadata = {
  title: "Free static QR generator",
  description: "Generate a free static QR code for your URL. Download PNG or SVG with no account required."
};

export default function QrPage() {
  return <StaticQrGenerator />;
}
