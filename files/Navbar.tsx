"use client"
import Link from "next/link"
import { useLang } from "@/context/LangContext"

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-bold text-red-600 text-lg shrink-0">
          {lang === "zh" ? "台灣好房網" : "Nhà Đẹp ĐL"}
        </Link>
        <nav className="hidden sm:flex text-sm">
          <Link href="/listings?type=buy" className="px-3 py-1 text-gray-600 hover:text-red-600 transition">{t.buy}</Link>
          <Link href="/listings?type=rent" className="px-3 py-1 text-gray-600 hover:text-red-600 transition">{t.rent}</Link>
        </nav>
        <div className="flex-1" />
        <div className="flex bg-gray-100 rounded-full p-0.5 text-xs font-semibold">
          {(["zh", "vi"] as const).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-full transition ${lang === l ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              {l === "zh" ? "中文" : "Việt"}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
