// app/layout.tsx — Root layout

import type { Metadata, Viewport } from "next"
import "./globals.css"
import { LangProvider } from "@/context/LangContext"
import Navbar from "@/components/Navbar"
import BottomTabBar from "@/components/BottomTabBar"
import PwaInstall from "@/components/PwaInstall"

export const metadata: Metadata = {
  title: "台灣好房網 | Nhà Đẹp Đài Loan",
  description: "Tìm nhà mua bán và cho thuê tại Đài Loan – Song ngữ Trung-Việt",
  manifest: "/manifest.json",
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
        </LangProvider>
      </body>
    </html>
  )
}
