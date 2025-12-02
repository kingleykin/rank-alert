import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RankAlert - Theo dõi bảng xếp hạng",
  description:
    "Nhận thông báo ngay khi thứ hạng thay đổi. Theo dõi VieON, YouTube, TikTok, Spotify realtime.",
  manifest: "/manifest.json",
  themeColor: "#8C4AFF",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
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
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

import InstallPrompt from "./install-prompt";
import OneSignalProvider from "./onesignal-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RankAlert" />
        <script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          defer
        ></script>
      </head>
      <body>
        <OneSignalProvider>
          {children}
          <InstallPrompt />
        </OneSignalProvider>
      </body>
    </html>
  );
}
