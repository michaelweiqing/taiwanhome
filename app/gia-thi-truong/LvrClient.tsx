"use client"
// Trang tra cứu 實價登錄 — giá giao dịch thực tế (song ngữ Trung / Việt)
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useLang } from "@/context/LangContext"
import { createClient } from "@/lib/supabase-browser"
import {
  fetchLvrTransactions, fetchLvrStats, fetchLvrTrend, LVR_PAGE_SIZE,
  type LvrFilters, type LvrKind, type LvrTx, type LvrDistrictStat, type LvrTrendPoint,
} from "@/lib/lvrData"
import {
  LVR_CITIES, cityVi, districtVi, BUILDING_TYPES, buildingTypeVi, buildingTypeShortZh,
  rentTypeVi, mainUseVi, floorLabel,
} from "@/lib/lvrI18n"
import { BarChart3, MapPin, Calendar, Info, MessageCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface Props {
  initialFilters: LvrFilters
  initialRows: LvrTx[]
  initialTotal: number
  initialStats: LvrDistrictStat[]
  initialTrend: LvrTrendPoint[]
  lastUpdate: string | null
}

const PING = 3.305785
const fmt = (n: number, d = 0) => n.toLocaleString("vi-VN", { maximumFractionDigits: d, minimumFractionDigits: d })

const KINDS: { val: LvrKind; zh: string; vi: string; hint_vi: string; hint_zh: string }[] = [
  { val: "sale",    zh: "中古屋買賣", vi: "Mua bán nhà",     hint_vi: "Nhà đã qua sử dụng", hint_zh: "成屋交易" },
  { val: "presale", zh: "預售屋",     vi: "Nhà mới (預售屋)", hint_vi: "Mua nhà đang xây",  hint_zh: "建案預售" },
  { val: "rent",    zh: "租賃",       vi: "Thuê nhà",        hint_vi: "Giá thuê thực tế",   hint_zh: "實際租金" },
]
const ROOMS = [
  { val: "",  zh: "格局（不限）", vi: "Số phòng (Tất cả)" },
  { val: "0", zh: "開放格局",    vi: "Không ngăn phòng" },
  { val: "1", zh: "1房",         vi: "1 phòng ngủ" },
  { val: "2", zh: "2房",         vi: "2 phòng ngủ" },
  { val: "3", zh: "3房",         vi: "3 phòng ngủ" },
  { val: "4", zh: "4房以上",     vi: "Từ 4 phòng ngủ" },
]
const PERIODS = [
  { val: 3, zh: "近3個月", vi: "3 tháng gần đây" },
  { val: 6, zh: "近6個月", vi: "6 tháng gần đây" },
  { val: 12, zh: "近1年", vi: "1 năm gần đây" },
]

export default function LvrClient({ initialFilters, initialRows, initialTotal, initialStats, initialTrend, lastUpdate }: Props) {
  const { lang } = useLang()
  const vi = lang === "vi"
  const [f, setF] = useState<LvrFilters>(initialFilters)
  const [rows, setRows] = useState(initialRows)
  const [total, setTotal] = useState(initialTotal)
  const [stats, setStats] = useState(initialStats)
  const [trend, setTrend] = useState(initialTrend)
  const [loading, setLoading] = useState(false)
  const first = useRef(true)
  const listRef = useRef<HTMLDivElement>(null)

  const isRent = f.kind === "rent"

  // Tải lại dữ liệu khi đổi bộ lọc + cập nhật URL để có thể chia sẻ link
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const sb = createClient()
    let cancelled = false
    setLoading(true)
    Promise.all([fetchLvrTransactions(sb, f), fetchLvrStats(sb, f), fetchLvrTrend(sb, f)]).then(([tx, st, tr]) => {
      if (cancelled) return
      setRows(tx.rows); setTotal(tx.total); setStats(st); setTrend(tr); setLoading(false)
    })
    const p = new URLSearchParams()
    p.set("city", f.city); p.set("kind", f.kind)
    if (f.district) p.set("district", f.district)
    if (f.buildingType) p.set("type", f.buildingType)
    if (f.rooms) p.set("rooms", f.rooms)
    if (f.months !== 12) p.set("months", String(f.months))
    if (f.page > 1) p.set("page", String(f.page))
    // Dùng history API (Next.js hỗ trợ) để đổi URL mà không tải lại trang từ server
    window.history.replaceState(null, "", `/gia-thi-truong?${p.toString()}`)
    return () => { cancelled = true }
  }, [f])

  const update = (patch: Partial<LvrFilters>) => setF(prev => ({ ...prev, page: 1, ...patch }))
  const goPage = (page: number) => {
    setF(prev => ({ ...prev, page }))
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // ── Định dạng giá ──
  const unitLabel = (u: number | null) => {
    if (u === null || u === undefined) return "—"
    if (isRent) return vi ? `${fmt(u)} Đài tệ/坪` : `${fmt(u)} 元/坪`
    return vi ? `${fmt(u, 1)} vạn/坪` : `${fmt(u, 1)} 萬/坪`
  }
  const totalLabel = (t: number | null) => {
    if (!t) return "—"
    if (isRent) return vi ? `${fmt(t)} Đài tệ/tháng` : `${fmt(t)} 元/月`
    return vi ? `${fmt(t / 10000)} vạn` : `${fmt(t / 10000)} 萬`
  }
  const cityLabel = (c: string) => (vi ? `${cityVi(c)} (${c})` : c)
  const distLabel = (d: string) => (vi && districtVi(f.city, d) !== d ? `${districtVi(f.city, d)} (${d})` : d)

  const overall = stats.find(s => s.district === null)
  const districtStats = stats.filter(s => s.district !== null).sort((a, b) => b.deals - a.deals)
  const focus = f.district ? stats.find(s => s.district === f.district) : overall
  const pages = Math.max(1, Math.ceil(total / LVR_PAGE_SIZE))
  const maxTrend = Math.max(1, ...trend.map(t => t.median_unit || 0))
  const updatedText = lastUpdate
    ? new Date(lastUpdate).toLocaleDateString(vi ? "vi-VN" : "zh-TW", { timeZone: "Asia/Taipei" })
    : null

  const selCls = "w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-red-400 cursor-pointer pr-8"
  const Arrow = () => <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="relative max-w-6xl mx-auto px-4 pt-6 pb-8">
          <nav className="text-xs text-blue-100 flex items-center gap-1.5 mb-4">
            <Link href="/" className="hover:text-white">{vi ? "Trang chủ" : "首頁"}</Link>
            <span>/</span>
            <span className="text-white">{vi ? "Tra cứu giá thị trường" : "實價登錄查詢"}</span>
          </nav>
          <h1 className="text-white text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BarChart3 size={28} strokeWidth={2.2} />
            {vi ? "Giá giao dịch thực tế (實價登錄)" : "實價登錄 實際成交行情"}
          </h1>
          <p className="text-blue-100 text-sm mt-2 max-w-3xl leading-relaxed">
            {vi
              ? "Giá mua bán và giá thuê nhà đã thực sự giao dịch tại Đài Loan, lấy từ dữ liệu công khai của Bộ Nội chính (內政部). Biết giá thị trường trước khi thuê, mua hay thương lượng."
              : "資料來源：內政部不動產交易實價查詢服務網開放資料。租屋、買房、議價前，先查實際成交行情。"}
          </p>
          {updatedText && (
            <p className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs px-3 py-1 rounded-full mt-3">
              <Calendar size={12} /> {vi ? `Cập nhật tự động · lần gần nhất ${updatedText}` : `每日自動更新 · 最近更新 ${updatedText}`}
            </p>
          )}

          {/* Tabs loại giao dịch */}
          <div className="grid grid-cols-3 gap-2 mt-5 max-w-2xl">
            {KINDS.map(k => (
              <button key={k.val} onClick={() => update({ kind: k.val, buildingType: undefined, rooms: undefined })}
                className={`rounded-xl px-2 py-2.5 text-center transition ${f.kind === k.val ? "bg-white text-blue-700 shadow-lg" : "bg-white/15 text-white hover:bg-white/25"}`}>
                <div className="text-sm font-bold">{vi ? k.vi : k.zh}</div>
                <div className={`text-[11px] ${f.kind === k.val ? "text-blue-500" : "text-blue-100"}`}>{vi ? k.hint_vi : k.hint_zh}</div>
              </button>
            ))}
          </div>

          {/* Bộ lọc */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mt-3">
            <div className="relative">
              <select value={f.city} onChange={e => update({ city: e.target.value, district: undefined })} className={selCls} aria-label="city">
                {LVR_CITIES.map(c => <option key={c.zh} value={c.zh}>{cityLabel(c.zh)}</option>)}
              </select><Arrow />
            </div>
            <div className="relative">
              <select value={f.district || ""} onChange={e => update({ district: e.target.value || undefined })} className={selCls} aria-label="district">
                <option value="">{vi ? "Tất cả quận/huyện" : "全部行政區"}</option>
                {[...districtStats].sort((a, b) => (a.district || "").localeCompare(b.district || "", "zh-Hant")).map(d => (
                  <option key={d.district} value={d.district!}>{distLabel(d.district!)}</option>
                ))}
                {f.district && !districtStats.some(d => d.district === f.district) && <option value={f.district}>{distLabel(f.district)}</option>}
              </select><Arrow />
            </div>
            <div className="relative">
              <select value={f.buildingType || ""} onChange={e => update({ buildingType: e.target.value || undefined })} className={selCls} aria-label="type">
                <option value="">{vi ? "Loại nhà (Tất cả)" : "建物型態（不限）"}</option>
                {BUILDING_TYPES.map(b => <option key={b.zh} value={b.zh}>{vi ? b.vi : buildingTypeShortZh(b.zh)}</option>)}
              </select><Arrow />
            </div>
            <div className="relative">
              <select value={f.rooms || ""} onChange={e => update({ rooms: e.target.value || undefined })} className={selCls} aria-label="rooms">
                {ROOMS.map(r => <option key={r.val} value={r.val}>{vi ? r.vi : r.zh}</option>)}
              </select><Arrow />
            </div>
            <div className="relative col-span-2 lg:col-span-1">
              <select value={f.months} onChange={e => update({ months: Number(e.target.value) })} className={selCls} aria-label="period">
                {PERIODS.map(p => <option key={p.val} value={p.val}>{vi ? p.vi : p.zh}</option>)}
              </select><Arrow />
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-6xl mx-auto px-4 py-6 space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
        {/* ── Thẻ tổng quan ── */}
        <section>
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
            {vi
              ? `Giá trung vị · ${f.district ? distLabel(f.district) + ", " : ""}${cityVi(f.city)}`
              : `成交中位數 · ${f.city}${f.district || ""}`}
            {loading && <Loader2 size={16} className="animate-spin text-blue-500" />}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: vi ? (isRent ? "Giá thuê / 坪 (bình)" : "Đơn giá / 坪 (bình)") : (isRent ? "租金單價" : "成交單價"), value: unitLabel(focus?.median_unit ?? null), strong: true },
              { label: vi ? (isRent ? "Tiền thuê / tháng" : "Tổng giá") : (isRent ? "月租金" : "總價"), value: totalLabel(focus?.median_total ?? null) },
              { label: vi ? "Diện tích" : "建物面積", value: focus?.median_area_ping ? (vi ? `${fmt(focus.median_area_ping, 1)} 坪 (~${fmt(focus.median_area_ping * PING)} m²)` : `${fmt(focus.median_area_ping, 1)} 坪`) : "—" },
              { label: vi ? "Số giao dịch" : "成交筆數", value: focus ? fmt(focus.deals) : "0" },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="text-xs text-gray-500">{c.label}</div>
                <div className={`mt-1 font-bold ${c.strong ? "text-blue-700 text-xl" : "text-gray-900 text-lg"}`}>{c.value}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {vi
              ? "* Giá trung vị = mức giá ở giữa (50% giao dịch cao hơn, 50% thấp hơn). Đã loại giao dịch đặc biệt (giữa người thân, có phần xây thêm...). Đơn giá mua bán đã trừ giá chỗ đậu xe. 1 坪 (bình) ≈ 3,3 m²; 1 vạn = 10.000 Đài tệ."
              : "* 中位數已排除特殊交易（親友間、含增建等）；買賣單價已扣除車位價格與面積。"}
          </p>
        </section>

        {/* ── Xu hướng theo tháng ── */}
        {trend.length > 1 && (
          <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">
              {vi ? `Xu hướng ${isRent ? "giá thuê" : "đơn giá"} theo tháng` : `每月${isRent ? "租金" : "單價"}走勢`}
            </h3>
            <div className="flex items-end gap-1.5 h-40">
              {trend.map(t => {
                const h = t.median_unit ? Math.max(6, (t.median_unit / maxTrend) * 100) : 0
                const d = new Date(t.month)
                return (
                  <div key={t.month} className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group">
                    <div className="text-[10px] text-gray-600 mb-1 whitespace-nowrap">{t.median_unit ? fmt(t.median_unit, isRent ? 0 : 1) : ""}</div>
                    <div className="w-full max-w-10 bg-blue-500/80 group-hover:bg-blue-600 rounded-t-md transition" style={{ height: `${h}%` }}
                      title={`${t.deals} ${vi ? "giao dịch" : "筆"}`} />
                    <div className="text-[10px] text-gray-400 mt-1">{d.getMonth() + 1}/{String(d.getFullYear()).slice(2)}</div>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              {vi ? (isRent ? "Đơn vị: Đài tệ/坪/tháng." : "Đơn vị: vạn Đài tệ/坪.") + " Tháng gần nhất có thể chưa đủ dữ liệu (đăng ký chậm khoảng 1 tháng)." : (isRent ? "單位：元/坪/月。" : "單位：萬/坪。") + "最近月份資料可能尚未完整。"}
            </p>
          </section>
        )}

        {/* ── Bảng theo quận ── */}
        {!f.district && districtStats.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <h3 className="font-semibold text-gray-900 text-sm px-4 pt-4 pb-2 flex items-center gap-1.5">
              <MapPin size={15} className="text-blue-500" /> {vi ? "So sánh giá theo quận/huyện" : "各行政區行情比較"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th className="text-left font-medium px-4 py-2">{vi ? "Quận/huyện" : "行政區"}</th>
                    <th className="text-right font-medium px-3 py-2">{vi ? (isRent ? "Giá thuê/坪" : "Đơn giá/坪") : "單價"}</th>
                    <th className="text-right font-medium px-3 py-2 hidden sm:table-cell">{vi ? (isRent ? "Tiền thuê" : "Tổng giá") : (isRent ? "月租" : "總價")}</th>
                    <th className="text-right font-medium px-4 py-2">{vi ? "Số GD" : "筆數"}</th>
                  </tr>
                </thead>
                <tbody>
                  {districtStats.map(d => (
                    <tr key={d.district} onClick={() => update({ district: d.district! })}
                      className="border-t border-gray-50 hover:bg-blue-50/60 cursor-pointer">
                      <td className="px-4 py-2 text-gray-800">{distLabel(d.district!)}</td>
                      <td className="px-3 py-2 text-right font-semibold text-blue-700 whitespace-nowrap">{unitLabel(d.median_unit)}</td>
                      <td className="px-3 py-2 text-right text-gray-600 whitespace-nowrap hidden sm:table-cell">{totalLabel(d.median_total)}</td>
                      <td className="px-4 py-2 text-right text-gray-500">{fmt(d.deals)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Danh sách giao dịch ── */}
        <section ref={listRef} className="scroll-mt-20">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
              {vi ? "Giao dịch gần đây" : "最新成交紀錄"}
            </h2>
            <span className="text-xs text-gray-500">{vi ? `${fmt(total)} giao dịch` : `共 ${fmt(total)} 筆`}</span>
          </div>

          {rows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">
              {vi ? "Chưa có giao dịch phù hợp với bộ lọc. Hãy thử mở rộng khu vực hoặc thời gian." : "查無符合條件的成交紀錄，請放寬篩選條件。"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rows.map(r => {
                const ping = r.area_m2 ? r.area_m2 / PING : null
                const age = r.built_year ? new Date(r.deal_date).getFullYear() - r.built_year : null
                const layout = r.rooms || r.halls || r.baths
                  ? (vi ? `${r.rooms ?? 0} phòng ngủ · ${r.halls ?? 0} khách · ${r.baths ?? 0} WC` : `${r.rooms ?? 0}房${r.halls ?? 0}廳${r.baths ?? 0}衛`)
                  : null
                return (
                  <article key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
                          <span>{new Date(r.deal_date).toLocaleDateString(vi ? "vi-VN" : "zh-TW")}</span>
                          <span>·</span>
                          <span className="text-gray-600 font-medium">{distLabel(r.district)}</span>
                          {r.is_special && (
                            <span className="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full" title={r.note || ""}>
                              {vi ? "GD đặc biệt" : "特殊交易"}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mt-1 truncate" title={r.address || ""}>
                          {r.project_name ? `${r.project_name} · ` : ""}{r.address || "—"}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-red-600 whitespace-nowrap">{totalLabel(r.total_price)}</div>
                        <div className="text-xs text-blue-700 font-medium whitespace-nowrap">{unitLabel(r.unit_ping)}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3 text-[11px]">
                      {r.building_type && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{vi ? buildingTypeVi(r.building_type) : buildingTypeShortZh(r.building_type)}</span>}
                      {isRent && r.rent_type && <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">{vi ? rentTypeVi(r.rent_type) : r.rent_type}</span>}
                      {ping !== null && ping > 0 && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{fmt(ping, 1)} 坪{vi ? ` (${fmt(r.area_m2!)} m²)` : ""}</span>}
                      {layout && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{layout}</span>}
                      {r.floor && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{floorLabel(r.floor, lang)}{r.total_floors ? (vi ? ` / ${r.total_floors} tầng` : ` / ${r.total_floors}樓`) : ""}</span>}
                      {age !== null && age >= 0 && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{vi ? `Nhà ${age} năm` : `屋齡 ${age} 年`}</span>}
                      {r.parking_price ? <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{vi ? `Chỗ đậu xe ${isRent ? fmt(r.parking_price) + " Đài tệ" : fmt(r.parking_price / 10000) + " vạn"}` : `車位 ${isRent ? fmt(r.parking_price) + "元" : fmt(r.parking_price / 10000) + "萬"}`}</span> : null}
                      {r.has_elevator && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{vi ? "Thang máy" : "有電梯"}</span>}
                      {isRent && r.furnished && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{vi ? "Có nội thất" : "附傢俱"}</span>}
                      {r.main_use && !/住家用|集合住宅|住宅/.test(r.main_use) && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{vi ? mainUseVi(r.main_use) : r.main_use}</span>}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button disabled={f.page <= 1 || loading} onClick={() => goPage(f.page - 1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm disabled:opacity-40">
                <ChevronLeft size={16} /> {vi ? "Trước" : "上一頁"}
              </button>
              <span className="text-sm text-gray-600">{f.page} / {fmt(pages)}</span>
              <button disabled={f.page >= pages || loading} onClick={() => goPage(f.page + 1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm disabled:opacity-40">
                {vi ? "Sau" : "下一頁"} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>

        {/* ── Giải thích ── */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-sm text-gray-700 leading-relaxed space-y-2">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Info size={16} className="text-blue-500" /> {vi ? "實價登錄 là gì?" : "關於實價登錄"}</h2>
          {vi ? (
            <>
              <p>實價登錄 (thực giá đăng lục) là hệ thống bắt buộc khai báo giá giao dịch nhà đất thực tế tại Đài Loan. Mỗi khi mua bán, thuê nhà qua môi giới hoặc mua nhà dự án, giá giao dịch phải được đăng ký với cơ quan địa chính và Bộ Nội chính công bố công khai.</p>
              <p>Dữ liệu được cập nhật tự động mỗi ngày từ nguồn mở của Bộ Nội chính (công bố vào ngày 1, 11, 21 hằng tháng). Giao dịch thường được đăng ký chậm 1–2 tháng sau ngày ký hợp đồng. Địa chỉ chỉ hiển thị theo khoảng số nhà để bảo vệ thông tin cá nhân.</p>
              <p className="text-gray-500 text-xs">Lưu ý: số liệu chỉ mang tính tham khảo. Giá thực tế còn tùy vào tầng lầu, hướng nhà, tình trạng nội thất và thời điểm giao dịch.</p>
            </>
          ) : (
            <>
              <p>實價登錄為內政部公開之不動產成交資料，包含買賣、預售屋及租賃案件。本站每日自動同步開放資料（每月1、11、21日發布），地址以區段化方式呈現。</p>
              <p className="text-gray-500 text-xs">資料僅供參考，實際價格仍需依樓層、座向、屋況及交易時點判斷。</p>
            </>
          )}
          <p className="text-xs text-gray-400">
            {vi ? "Nguồn" : "資料來源"}: <a href="https://lvr.land.moi.gov.tw/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">內政部不動產交易實價查詢服務網</a>
          </p>
        </section>

        {/* ── CTA ── */}
        <section className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-6 text-center">
          <h2 className="text-white font-bold text-lg mb-1">{vi ? "Cần tư vấn giá nhà bằng tiếng Việt?" : "需要越南語房產諮詢嗎？"}</h2>
          <p className="text-red-100 text-sm mb-4">{vi ? "Hỏi giá thuê, giá mua hoặc nhờ kiểm tra giá một căn nhà cụ thể — miễn phí." : "租金、房價行情、物件議價，歡迎免費諮詢。"}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://page.line.me/881vvzrj" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-green-600 font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg hover:bg-green-50 transition">
              <MessageCircle size={16} /> {vi ? "Hỏi qua LINE" : "LINE 諮詢"}
            </a>
            <Link href={`/listings?type=${isRent ? "rent" : "buy"}&city=${encodeURIComponent(f.city)}`}
              className="inline-flex items-center gap-2 bg-white/15 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-white/25 transition">
              {vi ? (isRent ? "Xem nhà cho thuê" : "Xem nhà đang bán") : (isRent ? "看出租物件" : "看出售物件")} →
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
