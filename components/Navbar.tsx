"use client"
import Link from "next/link"
import { useState } from "react"
import { useLang } from "@/context/LangContext"

export default function Navbar() {
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 h-14 flex items-center gap-2">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="flex flex-col items-center justify-center shrink-0 rounded-lg"
            style={{ background:"#c8102e", width:44, height:40 }}>
            <span style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:"#fff", letterSpacing:0.5, lineHeight:1 }}>
              8386
            </span>
            <span style={{ fontSize:7, fontWeight:600, letterSpacing:1, color:"#f5c518", marginTop:2, lineHeight:1 }}>
              找房網
            </span>
          </div>
          <div style={{ width:2, height:34, background:"#e8b800", borderRadius:2, flexShrink:0 }} />
          <div className="flex flex-col justify-center min-w-0" style={{ gap:2 }}>
            <div style={{ lineHeight:1, whiteSpace:"nowrap" }}>
              {lang==="zh" ? (
                <>
                  <span style={{ fontFamily:"Georgia,serif", fontSize:14, fontWeight:700, color:"#1a1a1a" }}>台灣</span>
                  <span style={{ fontFamily:"Georgia,serif", fontSize:14, fontWeight:700, color:"#e05a00" }}>找房網</span>
                </>
              ) : (
                <>
                  <span style={{ fontFamily:"Georgia,serif", fontSize:12, fontWeight:700, color:"#1a1a1a" }}>Bất Động Sản </span>
                  <span style={{ fontFamily:"Georgia,serif", fontSize:12, fontWeight:700, color:"#e05a00" }}>Đài Loan</span>
                </>
              )}
            </div>
            <div style={{ fontSize:8, color:"#888", letterSpacing:2, textTransform:"uppercase", whiteSpace:"nowrap", fontWeight:500 }}>
              Taiwan Real Estate
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm flex-1">
          <Link href="/listings?type=buy" className="px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">{t.buy}</Link>
          <Link href="/listings?type=rent" className="px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition">{t.rent}</Link>
        </nav>

        {/* Right */}
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <Link href="/submit"
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg px-2.5 py-1.5 transition whitespace-nowrap">
            + {lang==="zh" ? "刊登" : "Đăng"}
          </Link>
          <a href="https://line.me/ti/p/QRGpkXLga6" target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-xs text-green-600 border border-green-200 rounded-lg px-2.5 py-1.5 hover:bg-green-50 transition whitespace-nowrap">
            💬 LINE
          </a>

          {/* Language toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["zh","vi"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2 py-1 rounded-md transition text-xs font-medium whitespace-nowrap ${
                  lang===l ? "bg-white shadow-sm text-gray-900 font-semibold" : "text-gray-500"
                }`}>
                {l==="zh" ? "中文" : "Việt"}
              </button>
            ))}
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(o=>!o)}
            className="md:hidden flex flex-col gap-1 p-1.5 rounded-lg hover:bg-gray-100 transition shrink-0">
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${open?"rotate-45 translate-y-1.5":""}`}/>
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${open?"opacity-0":""}`}/>
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${open?"-rotate-45 -translate-y-1.5":""}`}/>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          <Link href="/listings?type=buy" onClick={()=>setOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition">
            🏠 {t.buy}
          </Link>
          <Link href="/listings?type=rent" onClick={()=>setOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition">
            🔑 {t.rent}
          </Link>
          <Link href="/submit" onClick={()=>setOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-red-600 text-white font-bold">
            ➕ {lang==="zh"?"刊登物件":"Đăng tin bán nhà"}
          </Link>
          <Link href="/favorites" onClick={()=>setOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition">
            ❤️ {lang==="zh"?"我的收藏":"Nhà yêu thích"}
          </Link>
          <a href="https://line.me/ti/p/QRGpkXLga6" target="_blank" rel="noopener noreferrer"
            onClick={()=>setOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-green-50 text-green-600 transition">
            💬 LINE {lang==="zh"?"聯絡":"liên hệ"}
          </a>
        </div>
      )}
    </header>
  )
}
