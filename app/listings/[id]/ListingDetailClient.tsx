"use client"
import Link from "next/link"
import { useState } from "react"
import type { Property } from "@/lib/data"
import { formatPrice, formatFloor, pingToM2 } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import ImageGallery from "@/components/ImageGallery"
import ContactForm from "@/components/ContactForm"
import PropertyCard from "@/components/PropertyCard"

const FEAT_ICONS: Record<string,string> = {
  "電梯":"🛗","停車位":"🚗","管理員":"👮","陽台":"🌿","冷氣":"❄️","健身房":"💪",
  "游泳池":"🏊","寵物友善":"🐾","網路":"📶","洗衣機":"🫧","近高鐵":"🚄",
  "全新裝潢":"✨","近商圈":"🛍️","頂樓花園":"🌸","智慧門禁":"🔐","室內電梯":"🛗",
  "無尾巷":"🏘️","優質學區":"🏫","間間套房":"🚪","近火車站":"🚉","近Costco":"🛒",
  "Thang máy":"🛗","Thang máy trong nhà":"🛗","Chỗ đậu xe":"🚗","Chỗ đậu xe sân":"🚗",
  "Bảo vệ 24h":"👮","Ban công":"🌿","Điều hoà":"❄️","Phòng gym":"💪",
  "Hồ bơi":"🏊","Thú cưng OK":"🐾","Wifi miễn phí":"📶","Máy giặt":"🫧",
  "Gần HSR":"🚄","Nội thất mới":"✨","Vườn sân thượng":"🌸","Cổng thông minh":"🔐",
  "Wifi":"📶","Mới hoàn toàn":"✨","Hẻm cụt an toàn":"🏘️","Khu học tốt":"🏫",
  "Mỗi phòng có WC riêng":"🚪","Gần ga tàu":"🚉","Gần Costco":"🛒",
}

const FACING_VI: Record<string,string> = {
  "東":"Đông","西":"Tây","南":"Nam","北":"Bắc",
  "東南":"Đông Nam","西南":"Tây Nam","東北":"Đông Bắc","西北":"Tây Bắc",
}

const PROP_LABEL: Record<string,{zh:string;vi:string}> = {
  apartment:{zh:"公寓大廈",vi:"Chung cư"},
  house:    {zh:"透天厝",  vi:"Nhà phố"},
  studio:   {zh:"套房",    vi:"Studio"},
  villa:    {zh:"豪宅",    vi:"Biệt thự"},
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1 h-5 bg-red-500 rounded-full inline-block shrink-0" />
      <h2 className="font-bold text-gray-900">{children}</h2>
    </div>
  )
}

interface Props { property: Property; similar: Property[] }

export default function ListingDetailClient({ property: p, similar }: Props) {
  const { lang, t } = useLang()
  const [shared, setShared] = useState(false)

  const title    = lang==="zh" ? p.title_zh       : p.title_vi
  const address  = lang==="zh" ? p.address        : p.address_vi
  const desc     = lang==="zh" ? p.description_zh : p.description_vi
  const mrt      = lang==="zh" ? p.near_mrt       : p.near_mrt_vi
  const features = lang==="zh" ? p.features       : p.features_vi
  const facing   = lang==="zh" ? p.facing         : (FACING_VI[p.facing] ?? p.facing)
  const propType = PROP_LABEL[p.property_type]?.[lang] ?? p.property_type
  const agentName = lang==="zh" ? p.agent_name : (p.agent_name_vi || p.agent_name)

  // Format tầng — floor là string
  const floorDisplay = formatFloor(p.floor, p.total_floors, lang)

  const postedDate = new Date(p.posted_at).toLocaleDateString(
    lang==="zh" ? "zh-TW" : "vi-VN",
    { year:"numeric", month:"long", day:"numeric" }
  )

  const mgmtFeeDisplay = p.management_fee
    ? (lang==="zh" ? `NT$${p.management_fee.toLocaleString()}/月` : `NT$${p.management_fee.toLocaleString()}/tháng`)
    : (lang==="zh" ? "無" : "Không có")

  const parkingDisplay = p.parking
    ? (lang==="zh" ? "✅ 有停車位" : "✅ Có chỗ đậu xe")
    : (lang==="zh" ? "❌ 無停車位" : "❌ Không có")

  const specs = [
    { label: lang==="zh"?"總價":"Tổng giá", value: formatPrice(p, lang), big: true },
    { label: t.totalArea, value: `${p.area_ping}${t.pingUnit} (${pingToM2(p.area_ping)}m²)` },
    ...(p.price_per_ping ? [{ label: t.pricePerPing, value: `${p.price_per_ping.toLocaleString()}萬/${t.pingUnit}` }] : []),
    { label: lang==="zh"?"格局":"Phòng", value: `${p.bedrooms}${t.bedrooms} / ${p.bathrooms}${t.bathrooms}` },
    { label: t.floor, value: floorDisplay },
    { label: t.age, value: `${p.age}${t.yearUnit}` },
    { label: t.facing, value: facing },
    { label: lang==="zh"?"物件類型":"Loại BĐS", value: propType },
    { label: lang==="zh"?"距捷運":"Cách MRT", value: `${mrt} · ${p.walk_minutes}${t.minuteWalk}` },
    { label: lang==="zh"?"停車位":"Chỗ đậu xe", value: parkingDisplay },
    { label: lang==="zh"?"管理費":"Phí quản lý", value: mgmtFeeDisplay },
    ...(p.area_main_ping ? [{ label: lang==="zh"?"主建物":"Nhà chính", value: `${p.area_main_ping}${t.pingUnit}` }] : []),
    ...(p.area_land_ping ? [{ label: lang==="zh"?"土地":"Đất", value: `${p.area_land_ping}${t.pingUnit}` }] : []),
  ]

  return (
    <div className="bg-gray-50 min-h-screen w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4 flex-wrap">
          <Link href="/" className="hover:text-red-600 transition">{t.homePage}</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-red-600 transition">{t.listingPage}</Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[200px]">{title}</span>
        </nav>

        {/* Tiêu đề */}
        <div className="mb-5">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${p.listing_type==="rent" ? "bg-blue-600" : "bg-emerald-600"}`}>
              {p.listing_type==="rent" ? t.forRent : t.forSale}
            </span>
            {p.is_new && <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">{t.new}</span>}
            {p.is_featured && <span className="bg-amber-100 text-amber-600 text-xs font-bold px-3 py-1 rounded-full">⭐ {t.featured}</span>}
            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">{propType}</span>
          </div>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug flex-1">{title}</h1>
            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); setShared(true); setTimeout(()=>setShared(false),2000) }}
              className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition shrink-0">
              {shared ? "✅ Đã copy" : "🔗 " + t.share}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
            <span>📍 {address}</span>
            <span className="text-gray-300">|</span>
            <span className="text-blue-600">🚇 {mrt} · {p.walk_minutes}{t.minuteWalk}</span>
          </div>
          <div className="mt-1.5 text-xs text-gray-400">🆔 {p.id}</div>
        </div>

        {/* Layout 2 cột */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Cột trái */}
          <div className="flex-1 min-w-0 space-y-5">
            <ImageGallery images={p.images || []} title={title} />

            {/* Thông số */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>{t.propertyInfo}</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {specs.map(s => (
                  <div key={s.label}>
                    <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                    <p className={`font-semibold ${s.big ? "text-red-600 text-xl" : "text-gray-900 text-sm"}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tiện ích */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>{t.features}</SectionTitle>
              <div className="flex flex-wrap gap-2 w-full">
                {(features || []).map(feat => (
                  <span key={feat} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-xl">
                    {FEAT_ICONS[feat] ?? "✔️"} {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Mô tả */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>{t.description}</SectionTitle>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line break-words w-full">{desc}</p>
            </div>

            {/* Tiện ích xung quanh */}
            {p.nearby && Object.keys(p.nearby).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <SectionTitle>{lang==="zh"?"周邊生活機能":"Tiện ích xung quanh"}</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {Object.entries(p.nearby).map(([key, val]) => val ? (
                    <div key={key} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✅</span>
                      <span>{val}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {/* Bản đồ */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <SectionTitle>{t.location}</SectionTitle>
              <p className="text-gray-500 text-sm mb-3">📍 {address} · 🚇 {mrt}</p>
              <a href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-3 w-full h-36 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 transition group">
                <span className="text-4xl group-hover:scale-110 transition">🗺️</span>
                <span className="text-sm text-blue-600 font-medium">{t.openMap}</span>
              </a>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400 pb-2">
              <span>🕐 {t.postedAt}: {postedDate}</span>
              <span>👁 {t.views}: {(p.views||0).toLocaleString()}</span>
            </div>
          </div>

          {/* Cột phải — Form liên hệ */}
          <div className="w-full lg:w-[320px] shrink-0">
            <ContactForm property={p} />
          </div>
        </div>

        {/* Nhà tương tự */}
        {similar.length > 0 && (
          <div className="mt-10">
            <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded-full inline-block" />
              {t.similarListings}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similar.map(sp => <PropertyCard key={sp.id} property={sp} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
