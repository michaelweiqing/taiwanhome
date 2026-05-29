"use client"
// components/PropertyCard.tsx — Card bất động sản đầy đủ thông số

import Link from "next/link"
import { useState } from "react"
import type { Property } from "@/lib/data"
import { formatPrice, pingToM2 } from "@/lib/data"
import { useLang } from "@/context/LangContext"

const PROP_TYPE_ZH: Record<string, string> = {
  apartment: "公寓大廈", house: "透天厝", studio: "套房", villa: "豪宅",
}
const PROP_TYPE_VI: Record<string, string> = {
  apartment: "Chung cư", house: "Nhà phố", studio: "Studio", villa: "Biệt thự",
}

export default function PropertyCard({ property: p }: { property: Property }) {
  const { lang, t } = useLang()
  const [fav, setFav] = useState(false)

  const title    = lang === "zh" ? p.title_zh    : p.title_vi
  const district = lang === "zh" ? p.district   : p.district_vi
  const city     = lang === "zh" ? p.city       : p.city_vi
  const mrt      = lang === "zh" ? p.near_mrt    : p.near_mrt_vi
  const type     = lang === "zh" ? PROP_TYPE_ZH[p.property_type] : PROP_TYPE_VI[p.property_type]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden
                    hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">

      {/* ── Ảnh bìa ── */}
      <Link href={`/listings/${p.id}`} className="block relative shrink-0">
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {p.images[0] ? (
            <img
              src={p.images[0]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">🏠</div>
          )}

          {/* Số ảnh */}
          {p.images.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/55 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              📷 {p.images.length}
            </span>
          )}

          {/* Badges trái */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {p.is_new && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                {t.new}
              </span>
            )}
            {p.is_featured && (
              <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                {t.featured}
              </span>
            )}
          </div>

          {/* Badge phải – rent / buy */}
          <span className={`absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${
            p.listing_type === "rent" ? "bg-blue-600" : "bg-green-600"
          }`}>
            {p.listing_type === "rent" ? t.forRent : t.forSale}
          </span>
        </div>
      </Link>

      {/* ── Body ── */}
      <div className="p-3 flex flex-col flex-1">

        {/* Dòng 1: Giá + Yêu thích */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <div>
            <span className="text-red-600 font-bold text-lg leading-none">
              {formatPrice(p, lang)}
            </span>
            {p.price_per_ping && (
              <span className="text-gray-400 text-[10px] ml-1.5">
                {p.price_per_ping.toLocaleString()}萬/{t.pingUnit}
              </span>
            )}
          </div>
          <button
            onClick={() => setFav(f => !f)}
            className="text-lg leading-none shrink-0 mt-0.5"
            aria-label="Yêu thích"
          >
            {fav ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Dòng 2: Tiêu đề */}
        <Link href={`/listings/${p.id}`}>
          <p className="text-gray-900 text-sm font-semibold leading-snug line-clamp-2
                        hover:text-red-600 transition mb-1.5">
            {title}
          </p>
        </Link>

        {/* Dòng 3: Địa chỉ */}
        <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
          <span>📍</span>
          <span>{district}, {city}</span>
          <span className="text-gray-300">·</span>
          <span>{type}</span>
        </p>

        {/* Dòng 4: Thông số chính */}
        <div className="grid grid-cols-4 gap-x-1 gap-y-1 bg-gray-50 rounded-xl px-2.5 py-2 mb-2">
          {[
            { icon: "🛏", val: `${p.bedrooms}${t.bedrooms}` },
            { icon: "🚿", val: `${p.bathrooms}${t.bathrooms}` },
            { icon: "📐", val: `${p.area_ping}${t.pingUnit}` },
            { icon: "🏢", val: `${p.floor}/${p.total_floors}F` },
          ].map(({ icon, val }) => (
            <div key={val} className="flex flex-col items-center">
              <span className="text-sm">{icon}</span>
              <span className="text-[10px] text-gray-600 font-medium whitespace-nowrap">{val}</span>
            </div>
          ))}
        </div>

        {/* Dòng 5: MRT + tuổi nhà — đẩy xuống bottom */}
        <div className="mt-auto flex items-center justify-between text-[11px]">
          <span className="text-blue-600 font-medium">
            🚇 {mrt} · {p.walk_minutes}{t.minuteWalk}
          </span>
          <span className="text-gray-400">{p.age}{t.yearUnit}</span>
        </div>
      </div>
    </div>
  )
}
