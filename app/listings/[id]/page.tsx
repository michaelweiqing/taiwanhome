"use client"
// app/listings/[id]/page.tsx — TRANG CHI TIẾT NHÀ

import { notFound } from "next/navigation"
import Link from "next/link"
import { getPropertyById, pingToM2, formatPrice } from "@/lib/data"
import ImageGallery from "@/components/ImageGallery"
import ContactForm from "@/components/ContactForm"
import SimilarListings from "@/components/SimilarListings"
import { useLang } from "@/context/LangContext"

// ── Bảng icon tiện ích ───────────────────────────────────────
const FEATURE_ICONS: Record<string, string> = {
  "電梯": "🛗", "停車位": "🚗", "管理員": "👮", "陽台": "🌿", "冷氣": "❄️",
  "健身房": "💪", "游泳池": "🏊", "寵物友善": "🐾", "網路": "📶",
  "洗衣機": "🫧", "近高鐵": "🚄", "全新裝潢": "✨", "近商圈": "🛍️",
  "頂樓花園": "🌸", "智慧門禁": "🔐",
  // Tiếng Việt
  "Thang máy": "🛗", "Chỗ đậu xe": "🚗", "Bảo vệ 24h": "👮",
  "Ban công": "🌿", "Điều hoà": "❄️", "Phòng gym": "💪",
  "Hồ bơi": "🏊", "Thú cưng OK": "🐾", "Wifi miễn phí": "📶",
  "Máy giặt": "🫧", "Gần HSR": "🚄", "Nội thất mới": "✨",
  "Gần trung tâm": "🛍️", "Vườn sân thượng": "🌸",
  "Cổng thông minh": "🔐", "Wifi": "📶",
}

const FACING_VI: Record<string, string> = {
  "東": "Đông", "西": "Tây", "南": "Nam", "北": "Bắc",
  "東南": "Đông Nam", "西南": "Tây Nam", "東北": "Đông Bắc", "西北": "Tây Bắc",
}

const PROP_LABEL: Record<string, { zh: string; vi: string }> = {
  apartment: { zh: "公寓大廈", vi: "Chung cư" },
  house:     { zh: "透天厝",   vi: "Nhà phố" },
  studio:    { zh: "套房",     vi: "Studio" },
  villa:     { zh: "豪宅",     vi: "Biệt thự" },
}

// ─────────────────────────────────────────────────────────────
function DetailContent({ id }: { id: string }) {
  const { lang, t } = useLang()
  const p = getPropertyById(id)
  if (!p) notFound()

  const title    = lang === "zh" ? p.titleZh        : p.titleVi
  const address  = lang === "zh" ? p.address        : p.addressVi
  const desc     = lang === "zh" ? p.descriptionZh  : p.descriptionVi
  const mrt      = lang === "zh" ? p.nearMRT        : p.nearMRTVi
  const features = lang === "zh" ? p.features       : p.featuresVi
  const facing   = lang === "zh" ? p.facing         : (FACING_VI[p.facing] ?? p.facing)
  const propType = lang === "zh" ? PROP_LABEL[p.propertyType].zh : PROP_LABEL[p.propertyType].vi

  const postedDate = new Date(p.postedAt).toLocaleDateString(
    lang === "zh" ? "zh-TW" : "vi-VN",
    { year: "numeric", month: "long", day: "numeric" }
  )

  // ── Thông số dạng grid ───────────────────────────────────
  const specs = [
    {
      label: lang === "zh" ? "總價" : "Tổng giá",
      value: formatPrice(p, lang),
      big: true,
    },
    {
      label: t.totalArea,
      value: `${p.areaPing} ${t.pingUnit}  (${pingToM2(p.areaPing)} ${t.m2Unit})`,
    },
    ...(p.pricePerPing ? [{
      label: t.pricePerPing,
      value: lang === "zh"
        ? `${p.pricePerPing.toLocaleString()}萬/${t.pingUnit}`
        : `${p.pricePerPing.toLocaleString()} vạn/${t.pingUnit}`,
    }] : []),
    {
      label: lang === "zh" ? "格局" : "Phòng",
      value: `${p.bedrooms} ${t.bedrooms} / ${p.bathrooms} ${t.bathrooms}`,
    },
    { label: t.floor,   value: `${p.floor} / ${p.totalFloors} F` },
    { label: t.age,     value: `${p.age} ${t.yearUnit}` },
    { label: t.facing,  value: facing },
    {
      label: lang === "zh" ? "物件類型" : "Loại BĐS",
      value: propType,
    },
    {
      label: lang === "zh" ? "距捷運" : "Cách MRT",
      value: `${mrt} · ${p.walkMinutes} ${t.minuteWalk}`,
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-4 flex-wrap">
          <Link href="/" className="hover:text-red-600 transition">{t.homePage}</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-red-600 transition">{t.listingPage}</Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-xs">{title}</span>
        </nav>

        {/* ── Tiêu đề section ── */}
        <div className="mb-5">
          {/* Badges hàng */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${
              p.listingType === "rent" ? "bg-blue-600" : "bg-green-600"
            }`}>
              {p.listingType === "rent" ? t.forRent : t.forSale}
            </span>
            {p.isNew && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                {t.new}
              </span>
            )}
            {p.isFeatured && (
              <span className="bg-amber-100 text-amber-600 text-xs font-bold px-3 py-1 rounded-full">
                {t.featured}
              </span>
            )}
            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
              {propType}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">📍 {address}</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 text-blue-600">
              🚇 {mrt} · {p.walkMinutes} {t.minuteWalk}
            </span>
          </div>
        </div>

        {/* ── Layout 2 cột ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ──── CỘT TRÁI ──── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* 1. Gallery */}
            <ImageGallery images={p.images} title={title} />

            {/* 2. Thông số chính */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionTitle>{t.propertyInfo}</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 mt-4">
                {specs.map(s => (
                  <div key={s.label}>
                    <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                    <p className={`font-semibold ${
                      s.big ? "text-red-600 text-lg" : "text-gray-900 text-sm"
                    }`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Tiện ích */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionTitle>{t.features}</SectionTitle>
              <div className="flex flex-wrap gap-2 mt-4">
                {features.map(feat => (
                  <span key={feat}
                    className="flex items-center gap-1.5 bg-gray-50 border border-gray-200
                               text-gray-700 text-sm px-3 py-1.5 rounded-xl">
                    <span>{FEATURE_ICONS[feat] ?? "✔️"}</span>
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Mô tả */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionTitle>{t.description}</SectionTitle>
              <p className="text-gray-700 text-sm leading-relaxed mt-4 whitespace-pre-line">
                {desc}
              </p>
            </div>

            {/* 5. Bản đồ */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionTitle>{t.location}</SectionTitle>
              <p className="text-gray-500 text-sm mt-3 mb-3 flex items-center gap-1.5">
                <span>📍</span><span>{address}</span>
                <span className="text-gray-300 mx-1">·</span>
                <span className="text-blue-600">🚇 {mrt}</span>
              </p>

              {/*
              ┌─ CÁCH NHÚNG MAP THẬT ──────────────────────────────────┐
              │  Cách 1 – Google Maps Embed (cần API key):              │
              │    <iframe                                              │
              │      src={`https://maps.google.com/maps?q=${p.lat},    │
              │              ${p.lng}&z=16&output=embed`}              │
              │      className="w-full h-full border-0"                │
              │      allowFullScreen loading="lazy" />                  │
              │                                                         │
              │  Cách 2 – Leaflet (miễn phí, không cần API key):       │
              │    npm install leaflet react-leaflet                    │
              │    Tạo components/MapView.tsx, import dynamic ở đây.   │
              └────────────────────────────────────────────────────────┘
              */}
              <a
                href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-3
                           w-full aspect-[16/7] rounded-xl bg-gradient-to-br
                           from-blue-50 to-indigo-50 border border-blue-100
                           hover:border-blue-300 transition group"
              >
                <span className="text-5xl group-hover:scale-110 transition">🗺️</span>
                <span className="text-sm text-blue-600 font-medium">{t.openMap}</span>
                <span className="text-xs text-gray-400">
                  {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                </span>
              </a>
            </div>

            {/* 6. Meta */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400 pb-2">
              <span>🕐 {t.postedAt}: {postedDate}</span>
              <span>👁 {t.views}: {p.views.toLocaleString()}</span>
              <span>🆔 {p.id}</span>
            </div>
          </div>

          {/* ──── CỘT PHẢI — Form liên hệ ──── */}
          <div className="w-full lg:w-[320px] shrink-0">
            <ContactForm property={p} />
          </div>
        </div>

        {/* ── Nhà tương tự ── */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-1 h-6 bg-red-500 rounded-full inline-block" />
            {t.similarListings}
          </h2>
          <SimilarListings currentId={p.id} listingType={p.listingType} />
        </div>
      </div>
    </div>
  )
}

// Helper — tiêu đề section với gạch đỏ bên trái
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1 h-5 bg-red-500 rounded-full inline-block shrink-0" />
      <h2 className="font-bold text-gray-900">{children}</h2>
    </div>
  )
}

// ── Export page ──────────────────────────────────────────────
export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return <DetailContent id={params.id} />
}
