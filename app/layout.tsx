// app/layout.tsx — Root layout

import type { Metadata, Viewport } from "next"
import "./globals.css"
import { LangProvider } from "@/context/LangContext"
import Navbar from "@/components/Navbar"
import BottomTabBar from "@/components/BottomTabBar"
import PwaInstall from "@/components/PwaInstall"
import AiChatWidget from "@/components/AiChatWidget"

export const metadata: Metadata = {
  metadataBase: new URL("https://8386.tw"),
  title: "台灣找房網 | Nhà Đẹp Đài Loan",
  description: "Tìm nhà mua bán và cho thuê tại Đài Loan – Song ngữ Trung-Việt",
  manifest: "/manifest.json",
  openGraph: {
    title: "台灣找房網 | Nhà Đẹp Đài Loan",
    description: "Tìm nhà mua bán và cho thuê tại Đài Loan – Song ngữ Trung-Việt",
    url: "https://8386.tw",
    siteName: "8386找房網",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "8386找房網" }],
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "台灣找房網 | Nhà Đẹp Đài Loan",
    description: "Tìm nhà mua bán và cho thuê tại Đài Loan – Song ngữ Trung-Việt",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "8386找房網",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "8386找房網",
    "apple-touch-icon": "/icons/icon-192x192.png",
    "msapplication-TileColor": "#dc2626",
    "msapplication-TileImage": "/icons/icon-192x192.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#dc2626",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <LangProvider>
          <Navbar />
          <main>{children}</main>
          <BottomTabBar />
          <PwaInstall />
          <AiChatWidget />
        </LangProvider>
      </body>
    </html>
  )
}
