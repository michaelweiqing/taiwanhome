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
      <h2 className="font-bold text-gray-900 text-base">{children}</h2>
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

  const floorDisplay = formatFloor(p.floor, p.total_floors, lang)
  const postedDate = new Date(p.posted_at).toLocaleDateString(
    lang==="zh" ? "zh-TW" : "vi-VN",
    { year:"numeric", month:"long", day:"numeric" }
  )
  const mgmtFee = p.management_fee
    ? (lang==="zh" ? `NT$${p.management_fee.toLocaleString()}/月` : `NT$${p.management_fee.toLocaleString()}/tháng`)
    : (lang==="zh" ? "無" : "Không có")
  const parking = p.parking
    ? (lang==="zh" ? "✅ 有" : "✅ Có")
    : (lang==="zh" ? "❌ 無" : "❌ Không")

  const specs = [
    { label: lang==="zh"?"總價":"Tổng giá",       value: formatPrice(p, lang), big: true },
    { label: t.totalArea,                          value: `${p.area_ping}${t.pingUnit} (${pingToM2(p.area_ping)}m²)` },
    ...(p.price_per_ping ? [{ label: t.pricePerPing, value: `${p.price_per_ping}萬/${t.pingUnit}` }] : []),
    { label: lang==="zh"?"格局":"Phòng",           value: `${p.bedrooms}${t.bedrooms}/${p.bathrooms}${t.bathrooms}` },
    { label: t.floor,                              value: floorDisplay },
    { label: t.age,                                value: `${p.age}${t.yearUnit}` },
    { label: t.facing,                             value: facing },
    { label: lang==="zh"?"類型":"Loại",            value: propType },
    { label: lang==="zh"?"停車":"Xe",              value: parking },
    { label: lang==="zh"?"管理費":"Phí QL",        value: mgmtFee },
    ...(p.area_main_ping ? [{ label: lang==="zh"?"主建物":"Nhà chính", value: `${p.area_main_ping}${t.pingUnit}` }] : []),
    ...(p.area_land_ping ? [{ label: lang==="zh"?"土地":"Đất",         value: `${p.area_land_ping}${t.pingUnit}` }] : []),
  ]

  return (
    <div style={{ width:"100%", maxWidth:"100vw", overflowX:"hidden", background:"#f9fafb", minHeight:"100vh" }}>
      <div style={{ maxWidth:1152, margin:"0 auto", padding:"16px 12px" }}>

        {/* Breadcrumb */}
        <nav style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"#9ca3af", marginBottom:16, flexWrap:"wrap" }}>
          <Link href="/" style={{ color:"inherit", textDecoration:"none" }}>{t.homePage}</Link>
          <span>/</span>
          <Link href="/listings" style={{ color:"inherit", textDecoration:"none" }}>{t.listingPage}</Link>
          <span>/</span>
          <span style={{ color:"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180 }}>{title}</span>
        </nav>

        {/* Tiêu đề */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:8 }}>
            <span style={{ background: p.listing_type==="rent"?"#2563eb":"#059669", color:"#fff", fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:999 }}>
              {p.listing_type==="rent" ? t.forRent : t.forSale}
            </span>
            {p.is_new && <span style={{ background:"#fee2e2", color:"#dc2626", fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:999 }}>{t.new}</span>}
            {p.is_featured && <span style={{ background:"#fef3c7", color:"#d97706", fontSize:11, fontWeight:700, padding:"3px 12px", borderRadius:999 }}>⭐ {t.featured}</span>}
            <span style={{ background:"#f3f4f6", color:"#6b7280", fontSize:11, padding:"3px 12px", borderRadius:999 }}>{propType}</span>
          </div>

          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
            <h1 style={{ fontSize:20, fontWeight:700, color:"#111827", lineHeight:1.4, flex:1, minWidth:0, wordBreak:"break-word" }}>{title}</h1>
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); setShared(true); setTimeout(()=>setShared(false),2000) }}
              style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"#6b7280", border:"1px solid #e5e7eb", borderRadius:12, padding:"6px 12px", background:"#fff", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
              {shared ? "✅ Đã copy" : "🔗 " + t.share}
            </button>
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8, marginTop:8, fontSize:13, color:"#6b7280" }}>
            <span style={{ wordBreak:"break-word" }}>📍 {address}</span>
            <span style={{ color:"#2563eb" }}>🚇 {mrt} · {p.walk_minutes}{t.minuteWalk}</span>
          </div>
          <div style={{ marginTop:6, fontSize:11, color:"#9ca3af" }}>🆔 {p.id}</div>
        </div>

        {/* Layout */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          {/* Cột trái */}
          <div style={{ width:"100%", minWidth:0 }}>

            {/* Gallery */}
            <div style={{ width:"100%", marginBottom:20 }}>
              <ImageGallery images={p.images || []} title={title} />
            </div>

            {/* Thông số */}
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f3f4f6", padding:16, marginBottom:16 }}>
              <SectionTitle>{t.propertyInfo}</SectionTitle>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {specs.map(s => (
                  <div key={s.label} style={{ minWidth:0 }}>
                    <div style={{ fontSize:11, color:"#9ca3af", marginBottom:2 }}>{s.label}</div>
                    <div style={{ fontSize: s.big ? 18 : 13, fontWeight:600, color: s.big ? "#dc2626" : "#111827", wordBreak:"break-word" }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tiện ích */}
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f3f4f6", padding:16, marginBottom:16 }}>
              <SectionTitle>{t.features}</SectionTitle>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {(features||[]).map(feat => (
                  <span key={feat} style={{ display:"flex", alignItems:"center", gap:6, background:"#f9fafb", border:"1px solid #e5e7eb", color:"#374151", fontSize:13, padding:"6px 12px", borderRadius:12, wordBreak:"break-word" }}>
                    {FEAT_ICONS[feat]??"✔️"} {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Mô tả */}
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f3f4f6", padding:16, marginBottom:16 }}>
              <SectionTitle>{t.description}</SectionTitle>
              <p style={{ fontSize:14, color:"#374151", lineHeight:1.7, whiteSpace:"pre-line", wordBreak:"break-word", margin:0 }}>{desc}</p>
            </div>

            {/* Tiện ích xung quanh */}
            {p.nearby && Object.keys(p.nearby).length > 0 && (
              <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f3f4f6", padding:16, marginBottom:16 }}>
                <SectionTitle>{lang==="zh"?"周邊生活機能":"Tiện ích xung quanh"}</SectionTitle>
                <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:8 }}>
                  {Object.entries(p.nearby).map(([key, val]) => val ? (
                    <div key={key} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:14, color:"#374151" }}>
                      <span style={{ color:"#16a34a", flexShrink:0 }}>✅</span>
                      <span style={{ wordBreak:"break-word" }}>{val}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {/* Bản đồ */}
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f3f4f6", padding:16, marginBottom:16 }}>
              <SectionTitle>{t.location}</SectionTitle>
              <p style={{ fontSize:13, color:"#6b7280", marginBottom:12, wordBreak:"break-word" }}>📍 {address} · 🚇 {mrt}</p>
              {/* Nhúng OpenStreetMap - miễn phí, không cần API key */}
              <div style={{ width:"100%", borderRadius:12, overflow:"hidden", border:"1px solid #e5e7eb" }}>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.lng-0.003},${p.lat-0.002},${p.lng+0.003},${p.lat+0.002}&layer=mapnik&marker=${p.lat},${p.lng}`}
                  style={{ width:"100%", height:240, border:"none", display:"block" }}
                  loading="lazy"
                  title="Bản đồ vị trí"
                />
              </div>
              <a href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:8, fontSize:13, color:"#2563eb", fontWeight:500, textDecoration:"none" }}>
                🗺️ {t.openMap} ↗
              </a>
            </div>

            {/* Meta */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:16, fontSize:12, color:"#9ca3af", paddingBottom:8 }}>
              <span>🕐 {t.postedAt}: {postedDate}</span>
              <span>👁 {t.views}: {(p.views||0).toLocaleString()}</span>
            </div>
          </div>

          {/* Form liên hệ */}
          <div style={{ width:"100%" }}>
            <ContactForm property={p} />
          </div>
        </div>

        {/* Nhà tương tự */}
        {similar.length > 0 && (
          <div style={{ marginTop:40 }}>
            <h2 style={{ fontSize:17, fontWeight:700, color:"#111827", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:4, height:24, background:"#ef4444", borderRadius:999, display:"inline-block" }} />
              {t.similarListings}
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {similar.map(sp => <PropertyCard key={sp.id} property={sp} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
