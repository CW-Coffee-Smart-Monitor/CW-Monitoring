import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/common/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CW-SmartMonitor | Dashboard Meja Real-Time",
  description:
    "Dashboard monitoring meja real-time CW Coffee dengan anti-ghost booking system berbasis IoT (ESP32, RFID & Ultrasonik).",
  metadataBase: new URL("http://localhost:3000"),
  alternates: {
    canonical: "/landing",
    languages: {
      id: "/landing?lang=id",
      en: "/landing?lang=en",
    },
  },
  openGraph: {
    title: "CW-SmartMonitor | Dashboard Meja Real-Time",
    description:
      "Dashboard monitoring meja real-time CW Coffee dengan anti-ghost booking system berbasis IoT (ESP32, RFID & Ultrasonik).",
    url: "/landing",
    siteName: "CW-SmartMonitor",
    images: [
      {
        url: "/CWClub.png",
        width: 800,
        height: 600,
        alt: "CW Coffee Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CW-SmartMonitor | Dashboard Meja Real-Time",
    description:
      "Dashboard monitoring meja real-time CW Coffee dengan anti-ghost booking system berbasis IoT (ESP32, RFID & Ultrasonik).",
    images: ["/CWClub.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
