import type { Metadata } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#8C4AFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "RankAlert - Theo dõi bảng xếp hạng",
  description:
    "Nhận thông báo ngay khi thứ hạng thay đổi. Theo dõi VieON, YouTube, TikTok, Spotify realtime.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RankAlert",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-167x167.png", sizes: "167x167", type: "image/png" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
    ],
  },
};

import InstallPrompt from "./install-prompt";
import InstallGuide from "@/components/InstallGuide";
import OneSignalProvider from "./onesignal-provider";
import { Viewport } from "next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RankAlert" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#8C4AFF" />
      </head>
      <body>
        <OneSignalProvider>
          {children}
          <InstallPrompt />
          <InstallGuide />
        </OneSignalProvider>
      </body>
    </html>
  );
}
