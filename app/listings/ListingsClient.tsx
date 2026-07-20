"use client"
import { useState, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Property } from "@/lib/data"
import PropertyCard from "@/components/PropertyCard"
import { useLang } from "@/context/LangContext"
import { Search, Home, X } from "lucide-react"

interface Props {
  initialProperties: Property[]
  searchQuery?: string   // ← MỚI: từ khoá tìm text (q=...) lọc phía client
  rawParams?: Record<string, string | undefined>  // ← các param khác trên URL (city, district, type...) để giữ nguyên khi sửa q
  floorFilter?: string   // ← "1" | "2-6" | "6-12" | "12+" | "basement" | "whole" — cột floor là text nên lọc phía client
}

function matchesFloor(floorRaw: string | null | undefined, category: string): boolean {
  const s = (floorRaw || "").trim()
  if (!s) return false
  if (category === "whole") return s.includes("整")
  if (category === "basement") return s.includes("地下") || /^b\s*-?\d/i.test(s)
  const num = parseInt(s.replace(/[^0-9]/g, ""), 10)
  if (isNaN(num)) return false
  if (category === "1")     return num === 1
  if (category === "2-6")   return num >= 2 && num <= 6
  if (category === "6-12")  return num >= 6 && num <= 12
  if (category === "12+")   return num >= 12
  return false
}

export default function ListingsClient({ initialProperties, searchQuery, rawParams, floorFilter }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const pathname = usePathname()
  const [typeFilter, setTypeFilter] = useState<"all"|"rent"|"buy">("all")
  const [sortBy, setSortBy]         = useState<"newest"|"price_asc"|"price_desc">("newest")
  // Ô tìm kiếm ngay trên toolbar — khởi tạo từ q= trên URL, cho phép sửa tại chỗ
  const [query, setQuery] = useState(searchQuery ?? "")

  function syncUrl(nextQuery: string) {
    const params = new URLSearchParams()
    Object.entries(rawParams ?? {}).forEach(([k, v]) => {
      if (v && k !== "q") params.set(k, v)
    })
    if (nextQuery) params.set("q", nextQuery)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleClearQuery() {
    setQuery("")
    syncUrl("")
  }

  const filtered = useMemo(() => {
    let list = [...initialProperties]

    // ── Lọc text (q) — tìm theo thành phố, quận/huyện, khu vực, tên tòa nhà,
    //     địa chỉ đường/số nhà, tiện ích xung quanh, mã ID nhà đăng ──
    if (query.trim()) {
      const sqRaw = query.trim()
      const sq = sqRaw.toLowerCase()

      // So khớp chính xác mã ID (không phân biệt hoa/thường) — ưu tiên tuyệt đối
      const idMatch = list.filter(p => p.id?.toLowerCase() === sq)

      if (idMatch.length > 0) {
        list = idMatch
      } else {
        list = list.filter(p => {
          // Mã ID (khớp một phần, cho phép gõ thiếu)
          if (p.id?.toLowerCase().includes(sq)) return true

          // Tiêu đề / tòa nhà / cộng đồng
          if (p.title_vi?.toLowerCase().includes(sq)) return true
          if (p.title_zh?.toLowerCase().includes(sq)) return true
          if (p.community_name?.toLowerCase().includes(sq)) return true

          // Thành phố / quận huyện
          if (p.district_vi?.toLowerCase().includes(sq)) return true
          if (p.district?.toLowerCase().includes(sq)) return true
          if (p.city_vi?.toLowerCase().includes(sq)) return true
          if (p.city?.toLowerCase().includes(sq)) return true

          // Địa chỉ đường / số nhà
          if (p.address?.toLowerCase().includes(sq)) return true
          if (p.address_vi?.toLowerCase().includes(sq)) return true

          // Ga MRT / khu vực gần
          if (p.near_mrt_vi?.toLowerCase().includes(sq)) return true
          if (p.near_mrt?.toLowerCase().includes(sq)) return true

          // Tiện ích / đặc điểm
          if (p.features_vi?.some(f => f.toLowerCase().includes(sq))) return true
          if (p.features?.some(f => f.toLowerCase().includes(sq))) return true

          // Tiện ích xung quanh (nearby: {"bus": "...", "market": "..."} — chỉ có tiếng Trung)
          if (p.nearby) {
            for (const val of Object.values(p.nearby)) {
              if (typeof val === "string" && val.toLowerCase().includes(sq)) return true
            }
          }

          return false
        })
      }
    }

    // ── Lọc loại giao dịch (rent/buy) — từ toolbar ──
    if (typeFilter !== "all") list = list.filter(p => p.listing_type === typeFilter)

    // ── Lọc tầng lầu (cột floor là text tự do nên lọc phía client) ──
    if (floorFilter) list = list.filter(p => matchesFloor(p.floor, floorFilter))

    // ── Sắp xếp ──
    if (sortBy === "price_asc")  list.sort((a, b) => a.price - b.price)
    if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price)
    if (sortBy === "newest")     list.sort((a, b) =>
      new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
    )

    return list
  }, [initialProperties, typeFilter, sortBy, query, floorFilter])

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">

          {/* Nút quay lại */}
          <button onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-sm transition mr-1">
            ← {lang === "zh" ? "返回" : "Quay lại"}
          </button>

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

          {/* Ô tìm kiếm tại chỗ — sửa từ khoá mà không cần quay lại trang chủ */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 min-w-[180px] flex-1 sm:flex-none sm:w-64 focus-within:border-red-300">
            <Search size={15} strokeWidth={2.2} className="text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && syncUrl(query)}
              onBlur={() => syncUrl(query)}
              placeholder={lang === "zh" ? "搜尋地址、社區、ID..." : "Tìm địa chỉ, tòa nhà, mã ID..."}
              className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400 min-w-0"
            />
            {query && (
              <button onClick={handleClearQuery} className="text-gray-300 hover:text-gray-500 shrink-0" aria-label="clear">
                <X size={14} strokeWidth={2.2} />
              </button>
            )}
          </div>

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
            <Home size={40} strokeWidth={1.5} className="mx-auto mb-4 text-gray-200" />
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
