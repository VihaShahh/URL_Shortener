import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: "./fonts/inter-variable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900"
});

export const metadata: Metadata = {
  title: {
    default: "Shortner",
    template: "%s | Shortner"
  },
  description: "Create short links, generate free QR codes, and view request analytics."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-ink-950 antialiased">{children}</body>
    </html>
  );
}
