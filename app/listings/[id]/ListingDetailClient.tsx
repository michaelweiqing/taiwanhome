"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"
import type { Property } from "@/lib/data"
import { formatPrice, pingToM2 } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import ImageGallery from "@/components/ImageGallery"
import ContactForm from "@/components/ContactForm"
import PropertyCard from "@/components/PropertyCard"

const FEAT_ICONS: Record<string,string> = {
  "電梯":"🛗","停車位":"🚗","管理員":"👮","陽台":"🌿","冷氣":"❄️","健身房":"💪",
  "游泳池":"🏊","寵物友善":"🐾","網路":"📶","洗衣機":"🫧","近高鐵":"🚄",
  "全新裝潢":"✨","近商圈":"🛍️","頂樓花園":"🌸","智慧門禁":"🔐",
  "Thang máy":"🛗","Chỗ đậu xe":"🚗","Bảo vệ 24h":"👮","Ban công":"🌿",
  "Điều hoà":"❄️","Phòng gym":"💪","Hồ bơi":"🏊","Thú cưng OK":"🐾",
  "Wifi miễn phí":"📶","Máy giặt":"🫧","Gần HSR":"🚄","Nội thất mới":"✨",
  "Vườn sân thượng":"🌸","Cổng thông minh":"🔐","Wifi":"📶",
}
const FACING_VI: Record<string,string> = {
  "東":"Đông","西":"Tây","南":"Nam","北":"Bắc",
  "東南":"Đông Nam","西南":"Tây Nam","東北":"Đông Bắc","西北":"Tây Bắc",
}
const PROP_LABEL: Record<string,{zh:string;vi:string}> = {
  house:  {zh:"透天厝", vi:"Nhà cả căn"},
  studio: {zh:"套房",   vi:"Studio"},
  villa:  {zh:"別墅",   vi:"Biệt thự"},
}

// Tự động phân loại apartment: tổng_tầng < 6 và không có 電梯 → 無電梯公寓, ngược lại → 華廈/大樓
function getApartmentLabel(p: Property): {zh:string;vi:string} {
  if (p.property_type !== "apartment") {
    return PROP_LABEL[p.property_type] ?? {zh: p.property_type, vi: p.property_type}
  }
  const hasElevator =
    (p.features    ?? []).some(f => f === "電梯") ||
    (p.features_vi ?? []).some(f => f === "Thang máy")
  const isWalkUp = p.total_floors < 6 && !hasElevator
  return isWalkUp
    ? {zh:"無電梯公寓", vi:"Chung cư thang bộ"}
    : {zh:"華廈/大樓",  vi:"Chung cư thang máy"}
}

// Nearby key → icon + label
const NEARBY_META: Record<string, { icon: string; zh: string; vi: string }> = {
  mrt:        { icon:"🚇", zh:"捷運站",    vi:"Ga MRT" },
  train:      { icon:"🚆", zh:"火車站",    vi:"Ga xe lửa" },
  bus:        { icon:"🚌", zh:"公車",      vi:"Xe buýt" },
  hospital:   { icon:"🏥", zh:"醫院",      vi:"Bệnh viện" },
  market:     { icon:"🛒", zh:"超市",      vi:"Siêu thị" },
  park:       { icon:"🌳", zh:"公園",      vi:"Công viên" },
  school:     { icon:"🏫", zh:"國小",      vi:"Trường tiểu học" },
  junior:     { icon:"🏫", zh:"國中",      vi:"Trường THCS" },
  senior:     { icon:"🎓", zh:"高中",      vi:"Trường THPT" },
  university: { icon:"🎓", zh:"大學",      vi:"Đại học" },
  mall:       { icon:"🏬", zh:"百貨公司",  vi:"Trung tâm TM" },
  nightmarket:{ icon:"🍢", zh:"夜市",      vi:"Chợ đêm" },
  convenience:{ icon:"🏪", zh:"便利商店",  vi:"Cửa hàng TL" },
}

// Thứ tự hiển thị
const NEARBY_ORDER = ["mrt","train","bus","hospital","market","park","school","junior","senior","university","mall","nightmarket","convenience"]

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
  const [views, setViews] = useState(p.views ?? 0)

  // Tăng views phía client — chạy 1 lần khi vào trang
  useEffect(() => {
    const supabase = createClient()
    supabase.rpc("increment_views", { property_id: p.id }).then(() => {
      setViews(v => v + 1)
    })
  }, [p.id])

  const title    = lang==="zh" ? p.title_zh       : p.title_vi
  const address  = lang==="zh" ? p.address        : p.address_vi
  const desc     = lang==="zh" ? p.description_zh : p.description_vi
  const features = lang==="zh" ? p.features       : p.features_vi
  const facing   = lang==="zh" ? p.facing         : (FACING_VI[p.facing] ?? p.facing)
  const propType = getApartmentLabel(p)[lang]

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

  // floor: translate 整棟 if VI
  const FLOOR_VI: Record<string,string> = { "整棟":"Cả căn", "全層":"Toàn tầng" }
  const floorLabel = (() => {
    const num = Number(p.floor)
    if (!isNaN(num) && String(p.floor).trim() !== "") return `${p.floor}/${p.total_floors}F`
    const display = (lang==="vi" && FLOOR_VI[p.floor]) ? FLOOR_VI[p.floor] : p.floor
    return `${display}/${p.total_floors}F`
  })()

  const specs = [
    { label: lang==="zh"?"總價":"Tổng giá",           value: formatPrice(p, lang), big: true },
    ...(p.community_name  ? [{ label: lang==="zh"?"社區名稱":"Tên chung cư",          value: p.community_name }] : []),
    { label: lang==="zh"?"建物總坪":"Tổng diện tích",  value: `${p.area_ping}${t.pingUnit} (${pingToM2(p.area_ping)}m²)` },
    ...(p.area_main_ping    ? [{ label: lang==="zh"?"主建物":"Diện tích sử dụng riêng",       value: `${p.area_main_ping}${t.pingUnit}` }] : []),
    ...(p.area_balcony_ping ? [{ label: lang==="zh"?"附屬建物":"Ban công & công trình phụ",   value: `${p.area_balcony_ping}${t.pingUnit}` }] : []),
    ...(p.area_common_ping  ? [{ label: lang==="zh"?"共同使用":"Diện tích sở hữu chung",      value: `${p.area_common_ping}${t.pingUnit}` }] : []),
    ...(p.area_land_ping    ? [{ label: lang==="zh"?"土地坪數":"Diện tích đất",               value: `${p.area_land_ping}${t.pingUnit}` }] : []),
    ...(p.price_per_ping    ? [{ label: t.pricePerPing, value: `${p.price_per_ping.toLocaleString()}萬/${t.pingUnit}` }] : []),
    { label: lang==="zh"?"格局":"Bố cục",              value: `${p.bedrooms}${t.bedrooms} / ${p.bathrooms}${t.bathrooms}` },
    { label: lang==="zh"?"樓層":"Tầng/Tổng số tầng",  value: floorLabel },
    { label: t.age,                                    value: `${p.age}${t.yearUnit}` },
    { label: t.facing,                                 value: facing },
    { label: lang==="zh"?"物件類型":"Loại BĐS",        value: propType },
    ...(p.total_units     ? [{ label: lang==="zh"?"總戶數":"Tổng số căn",       value: `${p.total_units}${lang==="zh"?"戶":"căn"}` }] : []),
    ...(p.units_per_floor ? [{ label: lang==="zh"?"同層戶數":"Số căn mỗi tầng", value: `${p.units_per_floor}${lang==="zh"?"戶":"căn"}` }] : []),
    ...(p.elevator_count  ? [{ label: lang==="zh"?"電梯數":"Số thang máy",      value: `${p.elevator_count}${lang==="zh"?"部":"thang"}` }] : []),
    { label: lang==="zh"?"停車位":"Chỗ đậu xe",        value: parkingDisplay },
    { label: lang==="zh"?"管理費":"Phí quản lý",       value: mgmtFeeDisplay },
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
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
            <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full font-mono">ID: {p.id}</span>
          </div>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug flex-1">{title}</h1>
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); setShared(true); setTimeout(()=>setShared(false),2000) }}
              className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition shrink-0">
              {shared ? "✅ Đã copy" : "🔗 Chia sẻ"}
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1.5">📍 {address}</p>
        </div>

        {/* Gallery */}
        <div className="mb-6">
          <ImageGallery images={p.images} title={title} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-6">

            {/* Thông số */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <SectionTitle>{lang==="zh" ? "物件資訊" : "Thông tin BĐS"}</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specs.map(s => (
                  <div key={s.label} className={`rounded-xl p-3 ${s.big ? "bg-red-50 col-span-2 sm:col-span-3" : "bg-gray-50"}`}>
                    <div className="text-xs text-gray-400 mb-0.5">{s.label}</div>
                    <div className={`font-bold ${s.big ? "text-red-600 text-xl" : "text-gray-900 text-sm"}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tiện ích */}
            {features && features.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <SectionTitle>{lang==="zh" ? "物件特色" : "Đặc điểm nổi bật"}</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {features.map(f => (
                    <span key={f} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full">
                      <span>{FEAT_ICONS[f] ?? "✔️"}</span>
                      <span>{f}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tiện ích xung quanh — dynamic from DB */}
            {p.nearby && Object.keys(p.nearby).filter(k => k !== "walk_minutes" && p.nearby![k]).length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <SectionTitle>{lang==="zh" ? "周邊設施" : "Tiện ích xung quanh"}</SectionTitle>

                {/* Walk minutes badge */}
                {p.nearby.walk_minutes && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5 mb-4 w-fit">
                    🚶 {lang==="zh" ? `步行約 ${p.nearby.walk_minutes} 分鐘生活圈` : `Bán kính đi bộ ${p.nearby.walk_minutes} phút`}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {NEARBY_ORDER
                    .filter(key => key !== "walk_minutes" && p.nearby![key])
                    .map(key => {
                      const meta = NEARBY_META[key]
                      const val = p.nearby![key]
                      if (!meta || !val) return null
                      return (
                        <a
                          key={key}
                          href={`https://www.google.com/maps/search/${encodeURIComponent(String(val))}/@${p.lat},${p.lng},15z`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 bg-gray-50 hover:bg-red-50 hover:border-red-200 border border-gray-100 rounded-xl px-4 py-3 transition group"
                        >
                          <span className="text-2xl shrink-0 group-hover:scale-110 transition">{meta.icon}</span>
                          <div className="min-w-0">
                            <div className="text-[11px] text-gray-400 font-medium">
                              {lang==="zh" ? meta.zh : meta.vi}
                            </div>
                            <div className="text-sm font-semibold text-gray-800 truncate">
                              {String(val)}
                            </div>
                          </div>
                          <span className="ml-auto text-gray-300 text-xs shrink-0">↗</span>
                        </a>
                      )
                    })
                  }
                </div>

                {/* Google Maps embed */}
                <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 h-48">
                  <iframe title="map" width="100%" height="100%" loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed`} />
                </div>
              </div>
            )}

            {/* Ngày đăng */}
            <p className="text-xs text-gray-400 px-1">
              {lang==="zh" ? "刊登日期：" : "Ngày đăng: "}{postedDate}
              {" · "}
              {lang==="zh" ? `瀏覽 ${views} 次` : `${views} lượt xem`}
            </p>

            {/* 實價登錄 — Thực giá giao dịch */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <SectionTitle>{lang==="zh" ? "實價登錄查詢" : "Tra cứu thực giá giao dịch"}</SectionTitle>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {lang==="zh"
                  ? "透過內政部實價登錄平台，查詢此地區的真實成交價格紀錄，做出更明智的買賣決策。"
                  : "Tra cứu giá giao dịch thực tế trong khu vực này qua hệ thống 實價登錄 của Bộ Nội vụ Đài Loan, giúp bạn đưa ra quyết định mua bán chính xác hơn."}
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://lvr.land.moi.gov.tw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl px-4 py-3 transition group"
                >
                  <span className="text-2xl shrink-0">🏛️</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-blue-400 font-medium mb-0.5">
                      {lang==="zh" ? "內政部不動產交易實價查詢（官方）" : "Bộ Nội vụ — Nguồn chính thức"}
                    </div>
                    <div className="text-sm font-semibold text-blue-700 truncate">
                      lvr.land.moi.gov.tw
                    </div>
                  </div>
                  <span className="ml-auto text-blue-400 text-xs shrink-0 group-hover:translate-x-0.5 transition">↗</span>
                </a>
              </div>
              <p className="text-[11px] text-gray-400 mt-3">
                {lang==="zh"
                  ? "⚠️ 實價登錄資料由政府提供，本平台不擔保其完整性。請以官方網站為準。"
                  : "⚠️ Dữ liệu thực giá do chính phủ Đài Loan cung cấp. Vui lòng kiểm tra trực tiếp trên trang chính thức."}
              </p>
            </div>
          </div>

          {/* Cột phải */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-20">
              <SectionTitle>{lang==="zh" ? "聯絡仲介" : "Liên hệ môi giới"}</SectionTitle>
              <ContactForm
                agentName={lang === "zh" ? p.agent_name : (p.agent_name_vi || p.agent_name)}
                agentPhone={p.agent_phone}
                agentLine={p.agent_line}
                propertyTitle={title}
                agentAvatar={p.agent_avatar}
                agentIsProfessional={p.agent_is_professional}
              />
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-10">
            <SectionTitle>{lang==="zh" ? "相似物件" : "BĐS tương tự"}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similar.map(s => <PropertyCard key={s.id} property={s} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
