"use client"
import Link from "next/link"
import { useLang } from "@/context/LangContext"

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">台</span>
          </div>
          <div>
            <div className="text-red-600 font-bold text-sm leading-none">
              {lang === "zh" ? "台灣好房網" : "Nhà Đẹp ĐL"}
            </div>
            <div className="text-gray-400 text-[10px] leading-none mt-0.5">
              {lang === "zh" ? "Nhà Đẹp Đài Loan" : "台灣好房網"}
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm flex-1">
          <Link href="/listings?type=buy" className="px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">{t.buy}</Link>
          <Link href="/listings?type=rent" className="px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">{t.rent}</Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a href="https://line.me" target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 transition">
            <span>💬</span> LINE
          </a>
          <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs font-medium">
            {(["zh","vi"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-md transition ${lang===l ? "bg-white shadow-sm text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-700"}`}>
                {l === "zh" ? "中文" : "Việt"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
