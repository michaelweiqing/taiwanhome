"use client"
import { useState, useMemo } from "react"
import type { Property } from "@/lib/data"
import PropertyCard from "@/components/PropertyCard"
import { useLang } from "@/context/LangContext"

interface Props {
  initialProperties: Property[]
  searchQuery?: string   // ← MỚI: từ khoá tìm text (q=...) lọc phía client
}

export default function ListingsClient({ initialProperties, searchQuery }: Props) {
  const { lang, t } = useLang()
  const [typeFilter, setTypeFilter] = useState<"all"|"rent"|"buy">("all")
  const [sortBy, setSortBy]         = useState<"newest"|"price_asc"|"price_desc">("newest")

  const filtered = useMemo(() => {
    let list = [...initialProperties]

    // ── Lọc text (q) — tìm trong title, district, city, MRT ──
    if (searchQuery) {
      const sq = searchQuery.toLowerCase()
      list = list.filter(p =>
        p.title_vi?.toLowerCase().includes(sq)       ||
        p.title_zh?.toLowerCase().includes(sq)       ||
        p.district_vi?.toLowerCase().includes(sq)    ||
        p.district?.toLowerCase().includes(sq)       ||
        p.city_vi?.toLowerCase().includes(sq)        ||
        p.city?.toLowerCase().includes(sq)           ||
        p.near_mrt_vi?.toLowerCase().includes(sq)    ||
        p.near_mrt?.toLowerCase().includes(sq)       ||
        p.features_vi?.some(f => f.toLowerCase().includes(sq)) ||
        p.features?.some(f => f.toLowerCase().includes(sq))
      )
    }

    // ── Lọc loại giao dịch (rent/buy) — từ toolbar ──
    if (typeFilter !== "all") list = list.filter(p => p.listing_type === typeFilter)

    // ── Sắp xếp ──
    if (sortBy === "price_asc")  list.sort((a, b) => a.price - b.price)
    if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price)
    if (sortBy === "newest")     list.sort((a, b) =>
      new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
    )

    return list
  }, [initialProperties, typeFilter, sortBy, searchQuery])

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">

          {/* Filter rent/buy/all */}
          <div className="flex bg-gray-100 rounded-xl overflow-hidden text-sm">
            {(["all","rent","buy"] as const).map(tp => (
              <button key={tp} onClick={() => setTypeFilter(tp)}
                className={`px-4 py-2 font-medium transition ${
                  typeFilter===tp ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-200"
                }`}>
                {tp==="all" ? t.all : tp==="rent" ? t.rent : t.buy}
              </button>
            ))}
          </div>

          {/* Sắp xếp */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:border-red-300">
            <option value="newest">{t.sortNewest}</option>
            <option value="price_asc">{t.sortPriceAsc}</option>
            <option value="price_desc">{t.sortPriceDesc}</option>
          </select>

          {/* Hiển thị từ khoá đang tìm */}
          {searchQuery && (
            <span className="text-sm text-gray-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              🔍 <span className="text-red-600 font-medium">{searchQuery}</span>
            </span>
          )}

          {/* Đếm kết quả */}
          <span className="text-gray-400 text-sm ml-auto">
            {t.found} <strong className="text-gray-900">{filtered.length}</strong> {t.totalListings}
          </span>
        </div>
      </div>

      {/* ── Grid kết quả ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🏠</div>
            <p className="text-gray-400 text-sm">{t.noResult}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
