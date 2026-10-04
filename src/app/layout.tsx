import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "./AppShell";

export const metadata: Metadata = {
  title: "SAP LABS — MISSION 2027 | Anuraj × Soumyajit",
  description:
    "Anuraj × Soumyajit Placement Preparation Command Center targeting SAP Labs recruitment on 1 July 2027.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#080A0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: "#080A0F", colorScheme: "dark" }}>
      <body
        className="bg-[#080A0F] text-slate-100 min-h-screen antialiased selection:bg-[#C5A059] selection:text-[#080A0F]"
        style={{ backgroundColor: "#080A0F", color: "#F1F5F9", margin: 0, minHeight: "100vh" }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
