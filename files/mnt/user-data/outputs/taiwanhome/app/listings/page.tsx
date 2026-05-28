"use client"
// app/listings/page.tsx — Trang danh sách nhà

import { useLang } from "@/context/LangContext"
import { properties } from "@/lib/data"
import PropertyCard from "@/components/PropertyCard"
import { useState, useMemo } from "react"

export default function ListingsPage() {
  const { lang, t } = useLang()
  const [typeFilter, setTypeFilter] = useState<"all"|"rent"|"buy">("all")
  const [sortBy, setSortBy]         = useState<"newest"|"price_asc"|"price_desc">("newest")

  const filtered = useMemo(() => {
    let list = [...properties]
    if (typeFilter !== "all") list = list.filter(p => p.listingType === typeFilter)
    if (sortBy === "price_asc")  list.sort((a, b) => a.price - b.price)
    if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price)
    if (sortBy === "newest")     list.sort((a, b) =>
      new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    )
    return list
  }, [typeFilter, sortBy])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden text-sm shadow-sm">
          {(["all", "rent", "buy"] as const).map(type => (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 transition font-medium ${
                typeFilter === type ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}>
              {type === "all" ? t.all : type === "rent" ? t.rent : t.buy}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white shadow-sm
                     text-gray-700 focus:outline-none focus:border-red-400">
          <option value="newest">{t.sortNewest}</option>
          <option value="price_asc">{t.sortPriceAsc}</option>
          <option value="price_desc">{t.sortPriceDesc}</option>
        </select>
        <span className="text-gray-400 text-sm ml-auto">
          {t.found} <strong className="text-gray-900">{filtered.length}</strong> {t.totalListings}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400 text-sm">{t.noResult}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  )
}
