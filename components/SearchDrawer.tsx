"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLang } from "@/context/LangContext"

const CITIES = [
  { zh:"台北市", vi:"Đài Bắc",    slug:"台北市" },
  { zh:"新北市", vi:"Tân Bắc",    slug:"新北市" },
  { zh:"桃園市", vi:"Đào Viên",   slug:"桃園市" },
  { zh:"新竹市", vi:"Tân Trúc",   slug:"新竹市" },
  { zh:"台中市", vi:"Đài Trung",  slug:"台中市" },
  { zh:"彰化縣", vi:"Chương Hóa", slug:"彰化縣" },
  { zh:"台南市", vi:"Đài Nam",    slug:"台南市" },
  { zh:"高雄市", vi:"Cao Hùng",   slug:"高雄市" },
]

const DISTRICTS: Record<string, { zh: string; vi: string }[]> = {
  "台北市": [
    {zh:"中正區",vi:"Trung Chính"},{zh:"大安區",vi:"Đại An"},{zh:"信義區",vi:"Tín Nghĩa"},
    {zh:"松山區",vi:"Tùng Sơn"},{zh:"內湖區",vi:"Nội Hồ"},{zh:"士林區",vi:"Sĩ Lâm"},
    {zh:"北投區",vi:"Bắc Đầu"},{zh:"文山區",vi:"Văn Sơn"},{zh:"南港區",vi:"Nam Cảng"},
    {zh:"中山區",vi:"Trung Sơn"},{zh:"萬華區",vi:"Vạn Hoa"},{zh:"大同區",vi:"Đại Đồng"},
  ],
  "新北市": [
    {zh:"板橋區",vi:"Bản Kiều"},{zh:"三重區",vi:"Tam Trọng"},{zh:"中和區",vi:"Trung Hòa"},
    {zh:"永和區",vi:"Vĩnh Hòa"},{zh:"新莊區",vi:"Tân Trang"},{zh:"新店區",vi:"Tân Điếm"},
    {zh:"土城區",vi:"Thổ Thành"},{zh:"蘆洲區",vi:"Lô Châu"},{zh:"樹林區",vi:"Thụ Lâm"},
    {zh:"汐止區",vi:"Uông Chỉ"},{zh:"淡水區",vi:"Đạm Thủy"},
  ],
  "桃園市": [
    {zh:"桃園區",vi:"Đào Viên"},{zh:"中壢區",vi:"Trung Lịch"},{zh:"平鎮區",vi:"Bình Trấn"},
    {zh:"八德區",vi:"Bát Đức"},{zh:"楊梅區",vi:"Dương Mai"},{zh:"蘆竹區",vi:"Lô Trúc"},
    {zh:"龜山區",vi:"Quy Sơn"},{zh:"大溪區",vi:"Đại Khê"},
  ],
  "新竹市": [{zh:"東區",vi:"Khu Đông"},{zh:"北區",vi:"Khu Bắc"},{zh:"香山區",vi:"Hương Sơn"}],
  "台中市": [
    {zh:"中區",vi:"Khu Trung"},{zh:"東區",vi:"Khu Đông"},{zh:"西區",vi:"Khu Tây"},
    {zh:"南區",vi:"Khu Nam"},{zh:"北區",vi:"Khu Bắc"},{zh:"西屯區",vi:"Tây Đồn"},
    {zh:"南屯區",vi:"Nam Đồn"},{zh:"北屯區",vi:"Bắc Đồn"},{zh:"豐原區",vi:"Phong Nguyên"},
    {zh:"大里區",vi:"Đại Lý"},{zh:"太平區",vi:"Thái Bình"},{zh:"清水區",vi:"Thanh Thủy"},
    {zh:"沙鹿區",vi:"Sa Lộc"},{zh:"大甲區",vi:"Đại Giáp"},{zh:"烏日區",vi:"Ô Nhật"},
    {zh:"潭子區",vi:"Đàm Tử"},{zh:"龍井區",vi:"Long Tỉnh"},{zh:"霧峰區",vi:"Vụ Phong"},
  ],
  "彰化縣": [
    {zh:"彰化市",vi:"Chương Hóa"},{zh:"員林市",vi:"Viên Lâm"},{zh:"和美鎮",vi:"Hòa Mỹ"},
    {zh:"鹿港鎮",vi:"Lộc Cảng"},{zh:"溪湖鎮",vi:"Khê Hồ"},
  ],
  "台南市": [
    {zh:"東區",vi:"Khu Đông"},{zh:"南區",vi:"Khu Nam"},{zh:"北區",vi:"Khu Bắc"},
    {zh:"安平區",vi:"An Bình"},{zh:"安南區",vi:"An Nam"},{zh:"永康區",vi:"Vĩnh Khang"},
    {zh:"仁德區",vi:"Nhân Đức"},{zh:"歸仁區",vi:"Quy Nhân"},
  ],
  "高雄市": [
    {zh:"三民區",vi:"Tam Dân"},{zh:"苓雅區",vi:"Linh Nhã"},{zh:"前鎮區",vi:"Tiền Trấn"},
    {zh:"鼓山區",vi:"Cổ Sơn"},{zh:"左營區",vi:"Tả Doanh"},{zh:"鳳山區",vi:"Phụng Sơn"},
    {zh:"仁武區",vi:"Nhân Vũ"},{zh:"岡山區",vi:"Cương Sơn"},
  ],
}

const PROPERTY_TYPES = [
  { val:"apartment_walkup", zh:"公寓(無電梯)",  vi:"Chung cư thang bộ" },
  { val:"apartment",        zh:"電梯大樓",       vi:"Chung cư thang máy" },
  { val:"house",            zh:"透天厝",         vi:"Nhà cả căn" },
  { val:"villa",            zh:"別墅",           vi:"Biệt thự" },
  { val:"studio",           zh:"套房",           vi:"Studio" },
]

const PRICE_RENT = [
  { val:"0-20000",    zh:"2萬以下/月",  vi:"Dưới 20.000/tháng" },
  { val:"20000-30000",zh:"2~3萬/月",    vi:"20.000 - 30.000/tháng" },
  { val:"30000-50000",zh:"3~5萬/月",    vi:"30.000 - 50.000/tháng" },
  { val:"50000-0",    zh:"5萬以上/月",  vi:"Trên 50.000/tháng" },
]
const PRICE_BUY = [
  { val:"0-750",   zh:"750萬以下",    vi:"Dưới 750 vạn" },
  { val:"750-1000",zh:"750~1000萬",   vi:"750 - 1.000 vạn" },
  { val:"1000-1500",zh:"1000~1500萬", vi:"1.000 - 1.500 vạn" },
  { val:"1500-2000",zh:"1500~2000萬", vi:"1.500 - 2.000 vạn" },
  { val:"2000-3000",zh:"2000~3000萬", vi:"2.000 - 3.000 vạn" },
  { val:"3000-0",  zh:"3000萬以上",   vi:"Trên 3.000 vạn" },
]

interface Props { open: boolean; onClose: () => void }

export default function SearchDrawer({ open, onClose }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const [tab, setTab]   = useState<"rent"|"buy">("rent")
  const [q, setQ]       = useState("")
  const [city, setCity] = useState("")
  const [dist, setDist] = useState("")
  const [ptype, setPtype] = useState("")
  const [price, setPrice] = useState("")

  const priceRanges = tab === "rent" ? PRICE_RENT : PRICE_BUY

  function handleSearch() {
    const params = new URLSearchParams()
    params.set("type", tab)
    if (q)     params.set("q", q)
    if (city)  params.set("city", city)
    if (dist)  params.set("district", dist)
    if (ptype) params.set("property_type", ptype)
    if (price) params.set("price", price)
    router.push(`/listings?${params.toString()}`)
    onClose()
  }

  const districts = city ? DISTRICTS[city] ?? [] : []

  const sel = "w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-red-400 cursor-pointer pr-8"

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`fixed bottom-0 inset-x-0 z-50 md:hidden bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ${
        open ? "translate-y-0" : "translate-y-full"
      }`}>
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mx-4">
          {(["rent","buy"] as const).map(tp => (
            <button key={tp} onClick={() => { setTab(tp); setPrice("") }}
              className={`flex-1 py-2.5 text-sm font-semibold transition ${
                tab===tp ? "text-red-600 border-b-2 border-red-500" : "text-gray-400"
              }`}>
              {tp==="rent" ? t.rent : t.buy}
            </button>
          ))}
        </div>

        <div className="px-4 py-3 flex flex-col gap-3 pb-6">
          {/* Keyword */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
            <span className="text-gray-400">🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key==="Enter" && handleSearch()}
              placeholder={lang==="zh" ? "搜尋地區、社區名稱..." : "Tìm khu vực, tên tòa nhà..."}
              className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400" />
          </div>

          {/* City + District */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <select value={city} onChange={e => { setCity(e.target.value); setDist("") }} className={sel}>
                <option value="">{lang==="zh" ? "選擇城市" : "Chọn thành phố"}</option>
                {CITIES.map(c => <option key={c.zh} value={c.zh}>{lang==="zh" ? c.zh : c.vi}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>
            <div className="relative">
              <select value={dist} onChange={e => setDist(e.target.value)} disabled={!city} className={sel + " disabled:opacity-40"}>
                <option value="">{lang==="zh" ? "選擇區域" : "Chọn quận/huyện"}</option>
                {districts.map(d => <option key={d.zh} value={d.zh}>{lang==="zh" ? d.zh : d.vi}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>
          </div>

          {/* Type + Price */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <select value={ptype} onChange={e => setPtype(e.target.value)} className={sel}>
                <option value="">{lang==="zh" ? "形態（不限）" : "Loại nhà (Tất cả)"}</option>
                {PROPERTY_TYPES.map(pt => <option key={pt.val} value={pt.val}>{lang==="zh" ? pt.zh : pt.vi}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>
            <div className="relative">
              <select value={price} onChange={e => setPrice(e.target.value)} className={sel}>
                <option value="">{lang==="zh" ? "售價（不限）" : "Giá (Tất cả)"}</option>
                {priceRanges.map(pr => <option key={pr.val} value={pr.val}>{lang==="zh" ? pr.zh : pr.vi}</option>)}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
            </div>
          </div>

          {/* Search button */}
          <button onClick={handleSearch}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold transition">
            {lang==="zh" ? "🔍 開始搜尋" : "🔍 Tìm kiếm"}
          </button>
        </div>
      </div>
    </>
  )
}
