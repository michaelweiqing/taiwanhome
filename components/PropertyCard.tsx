"use client"
import Link from "next/link"
import { useState } from "react"
import type { Property } from "@/lib/data"
import { formatPrice, pingToM2 } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import { useFavorites } from "@/hooks/useFavorites"

const TYPE_ZH: Record<string,string> = { apartment:"公寓", house:"透天厝", studio:"套房", villa:"豪宅" }
const TYPE_VI: Record<string,string> = { apartment:"Chung cư", house:"Nhà phố", studio:"Studio", villa:"Biệt thự" }

export default function PropertyCard({ property: p }: { property: Property }) {
  const { lang, t } = useLang()
  const { toggle, isFavorite } = useFavorites()
const fav = isFavorite(p.id)
  const [imgErr, setImgErr] = useState(false)

  const title    = lang==="zh" ? p.title_zh  : p.title_vi
  const district = lang==="zh" ? p.district  : p.district_vi
  const city     = lang==="zh" ? p.city      : p.city_vi
  const mrt      = lang==="zh" ? p.near_mrt  : p.near_mrt_vi
  const ptype    = lang==="zh" ? TYPE_ZH[p.property_type] : TYPE_VI[p.property_type]

  const img = (!imgErr && p.images?.[0]) ? p.images[0] : null

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col group">

      {/* Ảnh */}
      <Link href={`/listings/${p.id}`} className="relative block shrink-0">
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden relative">
          {img ? (
            <img src={img} alt={title} onError={() => setImgErr(true)}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🏠</span>
              <span className="text-xs text-gray-400">{ptype}</span>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Badges trên trái */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
            {p.is_new && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {t.new}
              </span>
            )}
            {p.is_featured && (
              <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                ⭐ {t.featured}
              </span>
            )}
          </div>

          {/* Badge phải — loại giao dịch */}
          <span className={`absolute top-2.5 right-2.5 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
            p.listing_type==="rent" ? "bg-blue-600" : "bg-emerald-600"
          }`}>
            {p.listing_type==="rent" ? t.forRent : t.forSale}
          </span>

          {/* Số ảnh */}
          {(p.images?.length ?? 0) > 1 && (
            <span className="absolute bottom-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
              📷 {p.images.length}
            </span>
          )}
        </div>
      </Link>

      {/* Nội dung */}
      <div className="p-3.5 flex flex-col flex-1">

        {/* Giá + tim */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <span className="text-red-600 font-bold text-xl leading-none">{formatPrice(p, lang)}</span>
            {p.price_per_ping && (
              <span className="text-gray-400 text-[11px] ml-1">
                · {p.price_per_ping}萬/{t.pingUnit}
              </span>
            )}
          </div>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(p.id) }}
            className="shrink-0 text-base leading-none mt-0.5 hover:scale-110 transition">
            {fav ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Tiêu đề */}
        <Link href={`/listings/${p.id}`}>
          <p className="text-gray-900 text-sm font-semibold leading-snug line-clamp-2 hover:text-red-600 transition mb-1.5">
            {title}
          </p>
        </Link>

        {/* Địa chỉ */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2.5">
          <span>📍</span>
          <span className="line-clamp-1">{district}, {city}</span>
          <span className="text-gray-200 mx-0.5">·</span>
          <span className="shrink-0">{ptype}</span>
        </div>

        {/* Thông số — 4 cột */}
        <div className="grid grid-cols-4 gap-1 mb-2.5">
          {[
            { icon: "🛏", val: `${p.bedrooms}${t.bedrooms}` },
            { icon: "🚿", val: `${p.bathrooms}${t.bathrooms}` },
            { icon: "📐", val: `${p.area_ping}${t.pingUnit}` },
            { icon: "🏢", val: `${p.floor}/${p.total_floors}F` },
          ].map(({ icon, val }) => (
            <div key={val} className="bg-gray-50 rounded-lg py-1.5 flex flex-col items-center gap-0.5">
              <span className="text-sm leading-none">{icon}</span>
              <span className="text-[10px] text-gray-600 font-medium leading-none">{val}</span>
            </div>
          ))}
        </div>

        {/* MRT + tuổi nhà */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
            🚇 {mrt} · {p.walk_minutes}{t.minuteWalk}
          </span>
          <span className="text-[11px] text-gray-400">{p.age}{t.yearUnit}</span>
        </div>
      </div>
    </div>
  )
}
