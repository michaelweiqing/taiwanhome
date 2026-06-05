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

const DISTRICTS: Record<string, { zh: string; vi: string }[]> = {
  "台北市": [
    { zh:"大安區", vi:"Q. Đại An" },
    { zh:"信義區", vi:"Q. Tín Nghĩa" },
    { zh:"中山區", vi:"Q. Trung Sơn" },
    { zh:"松山區", vi:"Q. Tùng Sơn" },
    { zh:"內湖區", vi:"Q. Nội Hồ" },
    { zh:"士林區", vi:"Q. Sĩ Lâm" },
  ],
  "台中市": [
    { zh:"西屯區", vi:"Q. Tây Đồn" },
    { zh:"北屯區", vi:"Q. Bắc Đồn" },
    { zh:"南屯區", vi:"Q. Nam Đồn" },
    { zh:"北區",   vi:"Q. Bắc" },
    { zh:"西區",   vi:"Q. Tây" },
  ],
  "高雄市": [
    { zh:"前鎮區", vi:"Q. Tiền Trấn" },
    { zh:"三民區", vi:"Q. Tam Dân" },
    { zh:"鼓山區", vi:"Q. Cổ Sơn" },
    { zh:"苓雅區", vi:"Q. Linh Nhã" },
  ],
  "台南市": [
    { zh:"東區", vi:"Q. Đông" },
    { zh:"北區", vi:"Q. Bắc" },
    { zh:"安平區", vi:"Q. An Bình" },
    { zh:"中西區", vi:"Q. Trung Tây" },
  ],
}

const QUICK_TAGS = [
  { zh:"近捷運", vi:"Gần MRT",      icon:"🚇" },
  { zh:"寵物友善", vi:"Thú cưng OK", icon:"🐾" },
  { zh:"含停車", vi:"Có chỗ đỗ",    icon:"🚗" },
  { zh:"含網路", vi:"Có Wifi",       icon:"📶" },
]

const RENT_PRICES = [
  { label_zh:"15,000以下",    label_vi:"Dưới 15,000",       val:"0-15000"      },
  { label_zh:"15,000–25,000", label_vi:"15,000 – 25,000",   val:"15000-25000"  },
  { label_zh:"25,000–40,000", label_vi:"25,000 – 40,000",   val:"25000-40000"  },
  { label_zh:"40,000以上",    label_vi:"Trên 40,000",        val:"40000-9999999"},
]

const BUY_PRICES = [
  { label_zh:"1,000萬以下",    label_vi:"Dưới 1,000 vạn",     val:"0-1000"       },
  { label_zh:"1,000–3,000萬",  label_vi:"1,000 – 3,000 vạn",  val:"1000-3000"    },
  { label_zh:"3,000–5,000萬",  label_vi:"3,000 – 5,000 vạn",  val:"3000-5000"    },
  { label_zh:"5,000萬以上",    label_vi:"Trên 5,000 vạn",      val:"5000-9999999" },
]

export default function HomeClient({ featured, newest }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()

  const [tab, setTab]                 = useState<"rent"|"buy">("rent")
  const [q, setQ]                     = useState("")
  const [city, setCity]               = useState("")
  const [district, setDistrict]       = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [price, setPrice]             = useState("")

  function handleSearch() {
    const params = new URLSearchParams()
    params.set("type", tab)
    if (q)            params.set("q", encodeURIComponent(q))
    if (city)         params.set("city", city)
    if (district)     params.set("district", district)
    if (propertyType) params.set("property_type", propertyType)
    if (price)        params.set("price", price)
    router.push(`/listings?${params.toString()}`)
  }

  const priceOptions = tab === "rent" ? RENT_PRICES : BUY_PRICES

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-orange-500 relative overflow-hidden">
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

          {/* ── Search box ── */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto">

            {/* Tab Thuê / Mua */}
            <div className="flex border-b border-gray-100">
              {(["rent","buy"] as const).map(tp => (
                <button key={tp}
                  onClick={() => { setTab(tp); setPrice("") }}
                  className={`flex-1 py-3 text-sm font-semibold transition ${
                    tab===tp
                      ? "text-red-600 border-b-2 border-red-500 bg-red-50/50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {tp==="rent" ? t.rent : t.buy}
                </button>
              ))}
            </div>

            {/* Row 1 — Ô tìm kiếm text */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-100">
              <span className="text-gray-300 text-lg pl-1">🔍</span>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleSearch()}
                placeholder={lang==="zh" ? "搜尋地區、捷運站、社區名稱..." : "Tìm khu vực, ga MRT, tên tòa nhà..."}
                className="flex-1 text-sm outline-none text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Row 2 — Thành phố + Quận/Huyện + Nút tìm */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-100">
              {/* Chọn thành phố */}
              <select
                value={city}
                onChange={e => { setCity(e.target.value); setDistrict("") }}
                className="flex-1 text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:border-red-300 min-w-0"
              >
                <option value="">{lang==="zh" ? "選擇城市" : "Chọn thành phố"}</option>
                {CITIES.map(c => (
                  <option key={c.slug} value={c.slug}>
                    {lang==="zh" ? c.zh : c.vi}
                  </option>
                ))}
              </select>

              {/* Chọn quận/huyện — disabled khi chưa chọn thành phố */}
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                disabled={!city}
                className="flex-1 text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:border-red-300 min-w-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">{lang==="zh" ? "選擇區/縣" : "Chọn quận/huyện"}</option>
                {(DISTRICTS[city] ?? []).map(d => (
                  <option key={d.zh} value={d.zh}>
                    {lang==="zh" ? d.zh : d.vi}
                  </option>
                ))}
              </select>

              {/* Nút tìm kiếm */}
              <button
                onClick={handleSearch}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shrink-0"
              >
                {lang==="zh" ? "搜尋" : "Tìm kiếm"}
              </button>
            </div>

            {/* Row 3 — Loại nhà + Giá */}
            <div className="flex items-center gap-2 px-3 py-3">
              {/* Loại nhà */}
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="flex-1 text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:border-red-300 min-w-0"
              >
                <option value="">{lang==="zh" ? "物件類型（全部）" : "Loại nhà (Tất cả)"}</option>
                <option value="apartment">{lang==="zh" ? "公寓大廈" : "Chung cư"}</option>
                <option value="house">{lang==="zh" ? "透天厝" : "Nhà phố"}</option>
                <option value="studio">{lang==="zh" ? "套房" : "Studio"}</option>
                <option value="villa">{lang==="zh" ? "豪宅" : "Biệt thự"}</option>
              </select>

              {/* Khoảng giá — thay đổi theo tab rent/buy */}
              <select
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="flex-1 text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:border-red-300 min-w-0"
              >
                <option value="">{lang==="zh" ? "價格（全部）" : "Giá (Tất cả)"}</option>
                {priceOptions.map(p => (
                  <option key={p.val} value={p.val}>
                    {lang==="zh" ? p.label_zh : p.label_vi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {QUICK_TAGS.map(tag => (
              <button key={tag.zh}
                onClick={() => router.push(`/listings?type=${tab}&q=${encodeURIComponent(tag.vi)}`)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full transition">
                <span>{tag.icon}</span>
                <span>{lang==="zh" ? tag.zh : tag.vi}</span>
              </button>
            ))}
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
          { icon:"❤️", zh:"收藏", vi:"Yêu thích", href:"/" },
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
