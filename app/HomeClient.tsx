"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Property } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import PropertyCard from "@/components/PropertyCard"

interface Props { featured: Property[]; newest: Property[] }

const CITIES = [
  { zh:"台北市", vi:"Đài Bắc", emoji:"🏙️", n:5234, slug:"台北市" },
  { zh:"台中市", vi:"Đài Trung", emoji:"🌆", n:3891, slug:"台中市" },
  { zh:"高雄市", vi:"Cao Hùng",  emoji:"🌊", n:2710, slug:"高雄市" },
  { zh:"台南市", vi:"Đài Nam",   emoji:"🏯", n:1482, slug:"台南市" },
]

export default function HomeClient({ featured, newest }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const [tab, setTab] = useState<"rent"|"buy">("rent")
  const [q, setQ] = useState("")

  function handleSearch() {
    router.push(`/listings?type=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}`)
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-orange-500 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="text-center mb-7">
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2 leading-snug">
              {lang==="zh" ? "找到您的理想家園" : "Tìm ngôi nhà lý tưởng của bạn"}
            </h1>
            <p className="text-red-100 text-sm">
              {lang==="zh" ? "台灣最大中越雙語房產平台" : "Nền tảng BĐS Đài Loan song ngữ Trung-Việt"}
            </p>
          </div>

          {/* Search box */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
            {/* Tabs rent/buy */}
            <div className="flex border-b border-gray-100">
              {(["rent","buy"] as const).map(tp => (
                <button key={tp} onClick={() => setTab(tp)}
                  className={`flex-1 py-3 text-sm font-semibold transition ${
                    tab===tp ? "text-red-600 border-b-2 border-red-500 bg-red-50/50" : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {tp==="rent" ? t.rent : t.buy}
                </button>
              ))}
            </div>

            {/* Input hàng */}
            <div className="flex items-center gap-2 p-3">
              <span className="text-gray-300 text-lg pl-1">🔍</span>
              <input value={q} onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleSearch()}
                placeholder={lang==="zh" ? "搜尋地區、捷運站、社區名稱..." : "Tìm khu vực, ga MRT, tên tòa nhà..."}
                className="flex-1 text-sm outline-none text-gray-900 placeholder-gray-400" />
              <button onClick={handleSearch}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shrink-0">
                {lang==="zh" ? "搜尋" : "Tìm kiếm"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-around text-center">
          {[
            { n:"12,847", label: lang==="zh"?"租屋物件":"Nhà cho thuê" },
            { n:"8,392",  label: lang==="zh"?"售屋物件":"Nhà mua bán" },
            { n:"486",    label: lang==="zh"?"今日新增":"Mới hôm nay" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-red-600 font-bold text-lg leading-none">{s.n}</div>
              <div className="text-gray-400 text-[11px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* ── Nổi bật ── */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
                {t.featured}
              </h2>
              <Link href="/listings" className="text-sm text-red-600 hover:underline">
                {lang==="zh" ? "查看全部 →" : "Xem tất cả →"}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </section>
        )}

        {/* ── Thành phố ── */}
        <section>
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
            {lang==="zh" ? "熱門城市" : "Thành phố phổ biến"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CITIES.map(c => (
              <Link key={c.zh} href={`/listings?city=${encodeURIComponent(c.slug)}`}
                className="bg-white rounded-2xl p-4 text-center border border-gray-100 hover:border-red-200 hover:shadow-md transition group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition">{c.emoji}</div>
                <div className="font-bold text-gray-900 text-sm">{lang==="zh" ? c.zh : c.vi}</div>
                <div className="text-xs text-red-500 mt-1">
                  {c.n.toLocaleString()} {lang==="zh" ? "件" : "căn"}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Mới đăng ── */}
        {newest.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
                {t.new}
              </h2>
              <Link href="/listings?sort=newest" className="text-sm text-red-600 hover:underline">
                {lang==="zh" ? "查看全部 →" : "Xem tất cả →"}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newest.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </section>
        )}

        {/* ── CTA đăng nhà ── */}
        <section className="relative bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-8 text-center overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="text-white font-bold text-xl mb-2">
              {lang==="zh" ? "想刊登物件？" : "Bạn muốn đăng bán nhà?"}
            </h2>
            <p className="text-red-100 text-sm mb-5">
              {lang==="zh" ? "免費刊登，快速媒合買家與租客" : "Đăng tin miễn phí, kết nối người mua nhanh chóng"}
            </p>
            <a href="https://line.me" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-green-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-green-50 transition shadow-lg">
              💬 {lang==="zh" ? "LINE 聯絡我們" : "Liên hệ qua LINE"}
            </a>
          </div>
        </section>
      </div>

      {/* ── Bottom nav mobile ── */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 grid grid-cols-4 md:hidden">
        {[
          { icon:"🏠", zh:"首頁", vi:"Trang chủ", href:"/" },
          { icon:"🔍", zh:"搜尋", vi:"Tìm kiếm", href:"/listings" },
          { icon:"❤️", zh:"收藏", vi:"Yêu thích", href:"/favorites" },
          { icon:"👤", zh:"我的", vi:"Cá nhân", href:"/" },
        ].map(item => (
          <Link key={item.href+item.zh} href={item.href}
            className="flex flex-col items-center gap-1 py-2.5 text-gray-400 hover:text-red-600 transition text-[10px]">
            <span className="text-xl leading-none">{item.icon}</span>
            <span>{lang==="zh" ? item.zh : item.vi}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
