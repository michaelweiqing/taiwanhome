"use client"
// "Tiện ích xung quanh" lấy từ 永慶: các nhóm (giao thông, trường học, y tế...) + bản đồ vị trí từng địa điểm.
import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import type { PropertyPois } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import { MapPin } from "lucide-react"

const AmenityLeafletMap = dynamic(() => import("./AmenityLeafletMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Đang tải bản đồ...</div>,
})

// zh → vi cho nhóm và loại phụ (tên địa điểm giữ nguyên tiếng Trung vì là tên riêng)
const CAT_VI: Record<string, string> = {
  "交通": "Giao thông", "學校": "Trường học", "政府": "Cơ quan", "醫療": "Y tế", "超商": "Cửa hàng tiện lợi",
  "購物": "Mua sắm", "停車場": "Bãi đỗ xe", "休閒娛樂": "Giải trí",
}
const SUB_VI: Record<string, string> = {
  "公車": "Xe buýt", "小學": "Tiểu học", "幼教": "Mầm non", "國中": "THCS", "高中": "THPT", "大學": "Đại học",
  "診所": "Phòng khám", "醫院": "Bệnh viện", "安養、看護": "Dưỡng lão", "藥局藥妝": "Hiệu thuốc", "動物醫院": "Thú y",
  "市場": "Chợ", "量販超市": "Siêu thị", "百貨公司": "TTTM", "寵物店": "Thú cưng",
  "展演場所": "Biểu diễn", "公園": "Công viên",
}

export default function AmenityMap({ pois, fallback, title }: { pois: PropertyPois; fallback: { lat: number; lng: number }; title: string }) {
  const { lang } = useLang()
  const [tab, setTab] = useState(0)
  const [active, setActive] = useState<number | null>(null)
  const center = pois.center ?? (fallback.lat && fallback.lng ? fallback : null)
  const cats = pois.categories
  const items = useMemo(() => cats[tab]?.items ?? [], [cats, tab])
  if (!cats.length) return null

  const catLabel = (k: string) => (lang === "zh" ? k : CAT_VI[k] ?? k)
  const subLabel = (s: string) => (lang === "zh" ? s : SUB_VI[s] ?? s)

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
        <h2 className="font-bold text-gray-900">{lang === "zh" ? "生活機能" : "Tiện ích xung quanh"}</h2>
      </div>

      {/* Tabs nhóm */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {cats.map((c, i) => (
          <button key={c.k} onClick={() => { setTab(i); setActive(null) }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
              i === tab ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
            {catLabel(c.k)} <span className={i === tab ? "text-blue-100" : "text-gray-400"}>({c.items.length})</span>
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {center && (
          <div className="h-[280px] md:h-[380px] rounded-xl overflow-hidden border border-gray-100 md:order-1">
            <AmenityLeafletMap center={center} title={title} items={items} activeIndex={active} onSelect={setActive} />
          </div>
        )}
        <ol className="max-h-[320px] md:max-h-[380px] overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-xl">
          {items.map((p, i) => (
            <li key={`${p.n}-${i}`}>
              <button onClick={() => setActive(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition ${active === i ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-gray-800 truncate">{p.n}</span>
                  {p.s && <span className="block text-[11px] text-gray-400">{subLabel(p.s)}</span>}
                </span>
                <span className="shrink-0 text-sm text-gray-500 tabular-nums">{p.d} {lang === "zh" ? "公尺" : "m"}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-3 text-[11px] text-gray-400 flex items-center gap-1">
        <MapPin size={11} /> {lang === "zh" ? "地圖位置為大約範圍，距離為直線距離。" : "Vị trí trên bản đồ là khu vực ước lượng; khoảng cách tính theo đường chim bay."}
      </p>
    </div>
  )
}
