"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import type { Property } from "@/lib/data"
import { formatPrice, pingToM2 } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import { useFavorites } from "@/hooks/useFavorites"
import ImageGallery from "@/components/ImageGallery"
import ContactForm from "@/components/ContactForm"
import MortgageCalculator from "@/components/MortgageCalculator"
import PropertyCard from "@/components/PropertyCard"
import type { LucideIcon } from "lucide-react"
import {
  ArrowUpDown, Car, ShieldCheck, Leaf, Snowflake, Dumbbell, Waves, PawPrint, Wifi, Droplets,
  TrainFront, TrainTrack, Bus, Stethoscope, ShoppingCart, Trees, School, GraduationCap, Store,
  UtensilsCrossed, Sparkles, ShoppingBag, Flower2, Lock, CheckCircle2, MapPin, ExternalLink,
  Footprints, Landmark, AlertTriangle, PlayCircle, Video, Heart, Link2, Star, Factory,
} from "lucide-react"

function getYoutubeEmbedUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

function isDirectVideoFile(url: string): boolean {
  return /\.(mp4|mov|webm|mkv|3gp)(\?.*)?$/i.test(url)
}

const FEAT_ICONS: Record<string,LucideIcon> = {
  "電梯":ArrowUpDown,"停車位":Car,"管理員":ShieldCheck,"陽台":Leaf,"冷氣":Snowflake,"健身房":Dumbbell,
  "游泳池":Waves,"寵物友善":PawPrint,"網路":Wifi,"洗衣機":Droplets,"近高鐵":TrainFront,
  "全新裝潢":Sparkles,"近商圈":ShoppingBag,"頂樓花園":Flower2,"智慧門禁":Lock,
  "Thang máy":ArrowUpDown,"Chỗ đậu xe":Car,"Bảo vệ 24h":ShieldCheck,"Ban công":Leaf,
  "Điều hoà":Snowflake,"Phòng gym":Dumbbell,"Hồ bơi":Waves,"Thú cưng OK":PawPrint,
  "Wifi miễn phí":Wifi,"Máy giặt":Droplets,"Gần HSR":TrainFront,"Nội thất mới":Sparkles,
  "Vườn sân thượng":Flower2,"Cổng thông minh":Lock,"Wifi":Wifi,
}
const FACING_VI: Record<string,string> = {
  "東":"Đông","西":"Tây","南":"Nam","北":"Bắc",
  "東南":"Đông Nam","西南":"Tây Nam","東北":"Đông Bắc","西北":"Tây Bắc",
}
const PROP_LABEL: Record<string,{zh:string;vi:string}> = {
  house:            {zh:"透天厝",    vi:"Nhà cả căn"},
  studio:           {zh:"套房",      vi:"Studio"},
  villa:            {zh:"套房/雅房",  vi:"Phòng đơn"},
  apartment_walkup: {zh:"無電梯公寓",vi:"Chung cư thang bộ"},
  apartment:        {zh:"華廈/大樓", vi:"Chung cư thang máy"},
  shop:             {zh:"店面",      vi:"Mặt bằng"},
  land:             {zh:"土地",      vi:"Đất"},
  factory:          {zh:"廠房",      vi:"Công xưởng"},
}

function getApartmentLabel(p: Property): {zh:string;vi:string} {
  if (p.property_type === "apartment_walkup") return PROP_LABEL.apartment_walkup
  if (p.property_type !== "apartment") {
    return PROP_LABEL[p.property_type] ?? {zh: p.property_type, vi: p.property_type}
  }
  const hasElevator =
    (p.features    ?? []).some((f: string) => f === "電梯") ||
    (p.features_vi ?? []).some((f: string) => f === "Thang máy")
  const isWalkUp = (p.total_floors ?? 99) < 6 && !hasElevator
  return isWalkUp
    ? {zh:"無電梯公寓", vi:"Chung cư thang bộ"}
    : {zh:"華廈/大樓",  vi:"Chung cư thang máy"}
}

// Nearby key → icon + label
const NEARBY_META: Record<string, { Icon: LucideIcon; zh: string; vi: string }> = {
  mrt:        { Icon:TrainFront, zh:"捷運站",    vi:"Ga MRT" },
  train:      { Icon:TrainTrack, zh:"火車站",    vi:"Ga xe lửa" },
  bus:        { Icon:Bus,        zh:"公車",      vi:"Xe buýt" },
  hospital:   { Icon:Stethoscope,zh:"醫院",      vi:"Bệnh viện" },
  market:     { Icon:ShoppingCart,zh:"超市",     vi:"Siêu thị" },
  park:       { Icon:Trees,      zh:"公園",      vi:"Công viên" },
  school:     { Icon:School,     zh:"國小",      vi:"Trường tiểu học" },
  junior:     { Icon:School,     zh:"國中",      vi:"Trường THCS" },
  senior:     { Icon:GraduationCap,zh:"高中",    vi:"Trường THPT" },
  university: { Icon:GraduationCap,zh:"大學",    vi:"Đại học" },
  mall:       { Icon:Store,      zh:"百貨公司",  vi:"Trung tâm TM" },
  nightmarket:{ Icon:UtensilsCrossed,zh:"夜市",  vi:"Chợ đêm" },
  convenience:{ Icon:Store,      zh:"便利商店",  vi:"Cửa hàng TL" },
  industrial: { Icon:Factory,    zh:"工業區",    vi:"Khu công nghiệp" },
}

// Thứ tự hiển thị
const NEARBY_ORDER = ["mrt","train","bus","hospital","market","park","school","junior","senior","university","mall","nightmarket","convenience","industrial"]

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
  const router = useRouter()
  const { toggle: toggleFav, isFavorite } = useFavorites()
  const isFav = isFavorite(p.id)
  const [shared, setShared] = useState(false)
  const [views, setViews] = useState(Number(p.views) ?? 0)

  // Tăng views — bỏ qua nếu chủ tin tự xem bài của mình (chỉ áp dụng cho tin khách đăng)
  useEffect(() => {
    const supabase = createClient()
    const run = async () => {
      try {
        const stored = localStorage.getItem("taiwanhome_user")
        const viewerPhone = stored ? (JSON.parse(stored)?.phone || null) : null
        const { data: counted } = await supabase.rpc("increment_views", { property_id: p.id, viewer_phone: viewerPhone })
        if (counted) setViews(v => v + 1)
      } catch {}
    }
    run()
  }, [p.id])

  const title    = lang==="zh" ? (p.title_zh || p.title_vi) : (p.title_vi || p.title_zh)
  const address  = lang==="zh" ? (p.address  || p.address_vi) : (p.address_vi || p.address)
  const district = lang==="zh" ? (p.district || p.district_vi) : (p.district_vi || p.district)
  const cityName = lang==="zh" ? (p.city     || p.city_vi)     : (p.city_vi     || p.city)
  const fullAddress = [cityName, district, address].filter(Boolean).join(", ")

  // description: ưu tiên đúng ngôn ngữ, fallback sang ngôn ngữ kia
  const rawDescZh = p.description_zh
  const rawDescVi = p.description_vi
  const rawDesc = lang==="zh"
    ? (rawDescZh || rawDescVi)
    : (rawDescVi || rawDescZh)
  const descLines: string[] = Array.isArray(rawDesc)
    ? (rawDesc as string[]).filter(Boolean)
    : rawDesc ? String(rawDesc).split("\n").filter(Boolean) : []
  const features = lang==="zh" ? (p.features || [])   : (p.features_vi || [])
  const facing   = lang==="zh" ? (p.facing || "") : (FACING_VI[p.facing ?? ""] ?? (p.facing || ""))
  const propType = getApartmentLabel(p)[lang]

  const postedDate = new Date(p.posted_at).toLocaleDateString(
    lang==="zh" ? "zh-TW" : "vi-VN",
    { year:"numeric", month:"long", day:"numeric" }
  )

  const mgmtFeeDisplay = p.management_fee
    ? (lang==="zh" ? `NT$${p.management_fee.toLocaleString()}/月` : `NT$${p.management_fee.toLocaleString()}/tháng`)
    : (lang==="zh" ? "無" : "Không có")

  const parkingDisplay = p.parking
    ? (lang==="zh" ? "✓ 有停車位" : "✓ Có chỗ đậu xe")
    : (lang==="zh" ? "✗ 無停車位" : "✗ Không có")

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
    { label: lang==="zh"?"建物總坪":"Tổng diện tích",  value: `${Number(p.area_ping)}${t.pingUnit} (${pingToM2(p.area_ping)}m²)` },
    ...(p.area_main_ping    ? [{ label: lang==="zh"?"主建物":"Diện tích sử dụng riêng",       value: `${p.area_main_ping}${t.pingUnit}` }] : []),
    ...(p.area_balcony_ping ? [{ label: lang==="zh"?"附屬建物":"Ban công & công trình phụ",   value: `${p.area_balcony_ping}${t.pingUnit}` }] : []),
    ...(p.area_basement_ping ? [{ label: lang==="zh"?"地下室":"Tầng hầm",                      value: `${p.area_basement_ping}${t.pingUnit}` }] : []),
    ...(p.area_common_ping  ? [{ label: lang==="zh"?"共同使用":"Diện tích sở hữu chung",      value: `${p.area_common_ping}${t.pingUnit}` }] : []),
    ...(p.area_land_ping    ? [{ label: lang==="zh"?"土地坪數":"Diện tích đất",               value: `${p.area_land_ping}${t.pingUnit}` }] : []),
    { label: lang==="zh"?"格局":"Bố cục",              value: `${p.bedrooms||0}${t.bedrooms} / ${p.bathrooms||0}${t.bathrooms}` },
    { label: lang==="zh"?"樓層":"Tầng/Tổng số tầng",  value: floorLabel },
    { label: t.age,                                    value: (p.age !== null && p.age !== undefined) ? `${p.age}${t.yearUnit}` : "-" },
    { label: t.facing,                                 value: facing || "-" },
    { label: lang==="zh"?"物件類型":"Loại BĐS",        value: propType },
    ...(p.total_units     ? [{ label: lang==="zh"?"總戶數":"Tổng số căn",       value: `${p.total_units}${lang==="zh"?"戶":"căn"}` }] : []),
    ...(p.units_per_floor ? [{ label: lang==="zh"?"同層戶數":"Số căn mỗi tầng", value: `${p.units_per_floor}${lang==="zh"?"戶":"căn"}` }] : []),
    ...(p.elevator_count  ? [{ label: lang==="zh"?"電梯數":"Số thang máy",      value: `${p.elevator_count}${lang==="zh"?"部":"thang"}` }] : []),
    ...((p as any).has_parking == null ? [{ label: lang==="zh"?"停車位":"Chỗ đậu xe", value: parkingDisplay }] : []),
    ...((p as any).deposit == undefined ? [{ label: lang==="zh"?"管理費":"Phí quản lý", value: mgmtFeeDisplay }] : []),
    // Các field từ user_listings (cho thuê)
    ...((p as any).deposit     ? [{ label: lang==="zh"?"押金":"Tiền cọc",          value: `${(p as any).deposit} ${lang==="zh"?"個月":"tháng"}` }] : []),
    ...((p as any).contract    ? [{ label: lang==="zh"?"合約期限":"Thời hạn hợp đồng",  value: `${(p as any).contract}` }] : []),
    ...((p as any).electricity ? [{ label: lang==="zh"?"電費":"Tiền điện",         value: (p as any).electricity }] : []),
    ...((p as any).water       ? [{ label: lang==="zh"?"水費":"Tiền nước",         value: (p as any).water }] : []),
    ...((p as any).parking_fee ? [{ label: lang==="zh"?"管理費":"Phí quản lý",      value: (p as any).parking_fee }] : []),
    ...((p as any).pet         ? [{ label: lang==="zh"?"寵物":"Nuôi thú cưng",     value: lang==="zh"?"✓ 允許":"✓ Được phép" }] : []),
    ...((p as any).household_reg ? [{ label: lang==="zh"?"戶籍":"Nhập hộ khẩu",   value: lang==="zh"?"✓ 可設戶籍":"✓ Được đăng" }] : []),
    ...((p as any).subsidy     ? [{ label: lang==="zh"?"政府補貼":"Trợ cấp CP",    value: lang==="zh"?"✓ 可申請":"✓ Được đăng ký" }] : []),
    ...((p as any).has_parking ? [{ label: lang==="zh"?"停車位":"Đậu xe",          value: (p as any).parking_note || (lang==="zh"?"✓ 有":"✓ Có") }] : []),
    ...((p as any).has_furniture ? [{ label: lang==="zh"?"附傢俱家電":"Đồ đạc đi kèm", value: (p as any).furniture_note || (lang==="zh"?"✓ 有":"✓ Có") }] : []),
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* Nút quay lại */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition mb-3 group"
        >
          <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span>
          <span>{lang === "zh" ? "返回上一頁" : "Quay lại"}</span>
        </button>

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
            {p.is_featured && <span className="bg-amber-100 text-amber-600 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1"><Star size={11} strokeWidth={2.5} fill="currentColor" /> {t.featured}</span>}
            <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">{propType}</span>
            <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full font-mono">ID: {p.id}</span>
          </div>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug flex-1">{title}</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-1"><MapPin size={13} strokeWidth={2.2} className="shrink-0" /> {fullAddress}</p>
          <div className="flex items-center gap-2 mt-3">
              {/* Nút yêu thích */}
              <button
                onClick={() => toggleFav(p.id)}
                title={lang==="zh" ? (isFav?"取消收藏":"加入收藏") : (isFav?"Bỏ yêu thích":"Yêu thích")}
                className={`flex items-center gap-1.5 text-sm border rounded-xl px-3 py-1.5 transition ${
                  isFav
                    ? "bg-red-50 border-red-300 text-red-500"
                    : "border-gray-200 text-gray-400 hover:bg-gray-50"
                }`}>
                <Heart size={15} strokeWidth={2} fill={isFav ? "currentColor" : "none"} /> {lang==="zh" ? (isFav?"已收藏":"收藏") : (isFav?"Đã thích":"Yêu thích")}
              </button>
              {/* Nút chia sẻ */}
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); setShared(true); setTimeout(()=>setShared(false),2000) }}
                className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition">
                {shared ? <CheckCircle2 size={15} strokeWidth={2.2} /> : <Link2 size={15} strokeWidth={2.2} />} {shared ? (lang==="zh" ? "已複製" : "Đã copy") : t.share}
              </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-6">
          <ImageGallery images={p.images} title={title} />
        </div>

        {/* Video nhà */}
        {p.video_url && (
          <div className="mb-6 bg-white rounded-2xl p-5 border border-gray-100">
            <SectionTitle><span className="inline-flex items-center gap-2"><Video size={18} strokeWidth={2.2} className="text-red-500" /> {lang==="zh" ? "物件影片" : "Video nhà"}</span></SectionTitle>
            {isDirectVideoFile(p.video_url) ? (
              <video src={p.video_url} controls className="w-full max-h-[480px] rounded-xl bg-black" />
            ) : getYoutubeEmbedUrl(p.video_url) ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={getYoutubeEmbedUrl(p.video_url)!}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a href={p.video_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition">
                <PlayCircle size={16} strokeWidth={2.2} /> {lang==="zh" ? "觀看影片" : "Xem video"}
              </a>
            )}
          </div>
        )}

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

            {/* Máy tính vay vốn — chỉ hiện với nhà bán, không hiện nhà cho thuê */}
            {p.listing_type !== "rent" && (
              <MortgageCalculator propertyPrice={Number(p.price)} />
            )}

            {/* Mô tả căn nhà */}
            {descLines.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <SectionTitle>{lang==="zh" ? "物件描述" : "Mô tả căn nhà"}</SectionTitle>
                <div className="space-y-1.5">
                  {descLines.map((line, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Tiện ích */}
            {features && features.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <SectionTitle>{lang==="zh" ? "物件特色" : "Đặc điểm nổi bật"}</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {features.map(f => {
                    const Icon = FEAT_ICONS[f] ?? CheckCircle2
                    return (
                      <span key={f} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full">
                        <Icon size={13} strokeWidth={2} className="text-red-500" />
                        <span>{f}</span>
                      </span>
                    )
                  })}
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
                    <Footprints size={14} strokeWidth={2.2} /> {lang==="zh" ? `步行約 ${p.nearby.walk_minutes} 分鐘生活圈` : `Bán kính đi bộ ${p.nearby.walk_minutes} phút`}
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
                          <meta.Icon size={22} strokeWidth={2} className="shrink-0 text-red-500 group-hover:scale-110 transition" />
                          <div className="min-w-0">
                            <div className="text-[11px] text-gray-400 font-medium">
                              {lang==="zh" ? meta.zh : meta.vi}
                            </div>
                            <div className="text-sm font-semibold text-gray-800 truncate">
                              {String(val)}
                            </div>
                          </div>
                          <ExternalLink size={13} strokeWidth={2.2} className="ml-auto text-gray-300 shrink-0" />
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
            <p className="text-xs text-gray-400 italic px-1">
              {lang==="zh"
                ? "如本物件已完成出售、出租或委托期滿，本廣告即視爲自動失效"
                : "Nếu bất động sản đã được bán, cho thuê hoặc hết hạn ủy thác, quảng cáo này được coi là tự động hết hiệu lực"}
            </p>

            {/* 實價登錄 — Thực giá giao dịch (chỉ hiện với tin admin, không hiện với tin khách đăng) */}
            {p.source !== "user" && (
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
                  <span className="text-2xl shrink-0"><Landmark size={26} strokeWidth={2} className="text-blue-500" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-blue-400 font-medium mb-0.5">
                      {lang==="zh" ? "內政部不動產交易實價查詢（官方）" : "Bộ Nội vụ — Nguồn chính thức"}
                    </div>
                    <div className="text-sm font-semibold text-blue-700 truncate">
                      lvr.land.moi.gov.tw
                    </div>
                  </div>
                  <ExternalLink size={13} strokeWidth={2.2} className="ml-auto text-blue-400 shrink-0 group-hover:translate-x-0.5 transition" />
                </a>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 flex items-start gap-1">
                <AlertTriangle size={13} strokeWidth={2.2} className="shrink-0 mt-0.5" />
                {lang==="zh"
                  ? "實價登錄資料由政府提供，本平台不擔保其完整性。請以官方網站為準。"
                  : "Dữ liệu thực giá do chính phủ Đài Loan cung cấp. Vui lòng kiểm tra trực tiếp trên trang chính thức."}
              </p>
            </div>
            )}
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
                propertyId={p.id}
                agentAvatar={p.agent_avatar}
                agentIsProfessional={p.agent_is_professional}
                agentDeveloper={p.agent_developer}
                agentCompany={p.agent_company}
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
