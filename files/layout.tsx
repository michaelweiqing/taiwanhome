// app/layout.tsx — Root layout

import type { Metadata } from "next"
import "./globals.css"
import { LangProvider } from "@/context/LangContext"
import Navbar from "@/components/Navbar"

export const metadata: Metadata = {
  title: "Taiwan Home | Nhà Đẹp Đài Loan",
  description: "Tìm nhà mua bán và cho thuê tại Đài Loan – Song ngữ Trung-Việt",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-50 min-h-screen">
        <LangProvider>
          <Navbar />
          <main>{children}</main>
        </LangProvider>
      </body>
    </html>
  )
}
