"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Property } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import PropertyCard from "@/components/PropertyCard"

interface Props { featured: Property[]; newest: Property[] }

const CITIES = [
  { zh:"台北市", vi:"Đài Bắc",   emoji:"🏙️", n:5234, slug:"台北市" },
  { zh:"新北市", vi:"Tân Bắc",   emoji:"🌃", n:6102, slug:"新北市" },
  { zh:"桃園市", vi:"Đào Viên",  emoji:"✈️", n:3540, slug:"桃園市" },
  { zh:"新竹市", vi:"Tân Trúc",  emoji:"🔬", n:1230, slug:"新竹市" },
  { zh:"台中市", vi:"Đài Trung", emoji:"🌆", n:3891, slug:"台中市" },
  { zh:"彰化縣", vi:"Chương Hóa",emoji:"🌾", n:980,  slug:"彰化縣" },
  { zh:"台南市", vi:"Đài Nam",   emoji:"🏯", n:1482, slug:"台南市" },
  { zh:"高雄市", vi:"Cao Hùng",  emoji:"🌊", n:2710, slug:"高雄市" },
]

const DISTRICTS: Record<string, { zh: string; vi: string }[]> = {
  "台北市": [
    { zh:"中正區", vi:"Trung Chính" }, { zh:"大安區", vi:"Đại An" },
    { zh:"信義區", vi:"Tín Nghĩa" },   { zh:"松山區", vi:"Tùng Sơn" },
    { zh:"內湖區", vi:"Nội Hồ" },      { zh:"士林區", vi:"Sĩ Lâm" },
    { zh:"北投區", vi:"Bắc Đầu" },     { zh:"文山區", vi:"Văn Sơn" },
    { zh:"南港區", vi:"Nam Cảng" },    { zh:"中山區", vi:"Trung Sơn" },
    { zh:"萬華區", vi:"Vạn Hoa" },     { zh:"大同區", vi:"Đại Đồng" },
  ],
  "新北市": [
    { zh:"板橋區", vi:"Bản Kiều" },   { zh:"三重區", vi:"Tam Trọng" },
    { zh:"中和區", vi:"Trung Hòa" },  { zh:"永和區", vi:"Vĩnh Hòa" },
    { zh:"新莊區", vi:"Tân Trang" },  { zh:"新店區", vi:"Tân Điếm" },
    { zh:"土城區", vi:"Thổ Thành" },  { zh:"蘆洲區", vi:"Lô Châu" },
    { zh:"樹林區", vi:"Thụ Lâm" },    { zh:"汐止區", vi:"Uông Chỉ" },
    { zh:"鶯歌區", vi:"Oanh Ca" },    { zh:"三峽區", vi:"Tam Hiệp" },
    { zh:"淡水區", vi:"Đạm Thủy" },   { zh:"瑞芳區", vi:"Thụy Phương" },
  ],
  "桃園市": [
    { zh:"桃園區", vi:"Đào Viên" },   { zh:"中壢區", vi:"Trung Lịch" },
    { zh:"平鎮區", vi:"Bình Trấn" },  { zh:"八德區", vi:"Bát Đức" },
    { zh:"楊梅區", vi:"Dương Mai" },  { zh:"蘆竹區", vi:"Lô Trúc" },
    { zh:"龜山區", vi:"Quy Sơn" },    { zh:"大溪區", vi:"Đại Khê" },
    { zh:"大園區", vi:"Đại Viên" },   { zh:"觀音區", vi:"Quan Âm" },
  ],
  "新竹市": [
    { zh:"東區", vi:"Khu Đông" },
    { zh:"北區", vi:"Khu Bắc" },
    { zh:"香山區", vi:"Hương Sơn" },
  ],
  "台中市": [
    { zh:"中區",   vi:"Khu Trung" },   { zh:"東區",   vi:"Khu Đông" },
    { zh:"西區",   vi:"Khu Tây" },     { zh:"南區",   vi:"Khu Nam" },
    { zh:"北區",   vi:"Khu Bắc" },     { zh:"西屯區", vi:"Tây Đồn" },
    { zh:"南屯區", vi:"Nam Đồn" },     { zh:"北屯區", vi:"Bắc Đồn" },
    { zh:"豐原區", vi:"Phong Nguyên" },{ zh:"大里區", vi:"Đại Lý" },
    { zh:"太平區", vi:"Thái Bình" },   { zh:"清水區", vi:"Thanh Thủy" },
    { zh:"沙鹿區", vi:"Sa Lộc" },      { zh:"大甲區", vi:"Đại Giáp" },
    { zh:"東勢區", vi:"Đông Thế" },    { zh:"梧棲區", vi:"Ngô Thê" },
    { zh:"烏日區", vi:"Ô Nhật" },      { zh:"神岡區", vi:"Thần Cương" },
    { zh:"大肚區", vi:"Đại Độ" },      { zh:"大雅區", vi:"Đại Nhã" },
    { zh:"后里區", vi:"Hậu Lý" },      { zh:"霧峰區", vi:"Vụ Phong" },
    { zh:"潭子區", vi:"Đàm Tử" },      { zh:"龍井區", vi:"Long Tỉnh" },
    { zh:"外埔區", vi:"Ngoại Phố" },   { zh:"和平區", vi:"Hòa Bình" },
    { zh:"石岡區", vi:"Thạch Cương" }, { zh:"大安區", vi:"Đại An" },
    { zh:"新社區", vi:"Tân Xã" },
  ],
  "彰化縣": [
    { zh:"彰化市", vi:"Chương Hóa" },  { zh:"員林市", vi:"Viên Lâm" },
    { zh:"鹿港鎮", vi:"Lộc Cảng" },    { zh:"和美鎮", vi:"Hòa Mỹ" },
    { zh:"北斗鎮", vi:"Bắc Đẩu" },     { zh:"溪湖鎮", vi:"Khê Hồ" },
    { zh:"田中鎮", vi:"Điền Trung" },  { zh:"二林鎮", vi:"Nhị Lâm" },
    { zh:"線西鄉", vi:"Tuyến Tây" },   { zh:"伸港鄉", vi:"Thân Cảng" },
    { zh:"福興鄉", vi:"Phúc Hưng" },   { zh:"秀水鄉", vi:"Tú Thủy" },
    { zh:"花壇鄉", vi:"Hoa Đàn" },     { zh:"芬園鄉", vi:"Phân Viên" },
    { zh:"大村鄉", vi:"Đại Thôn" },    { zh:"埔鹽鄉", vi:"Bộ Diêm" },
    { zh:"埔心鄉", vi:"Bộ Tâm" },      { zh:"永靖鄉", vi:"Vĩnh Tĩnh" },
    { zh:"社頭鄉", vi:"Xã Đầu" },      { zh:"二水鄉", vi:"Nhị Thủy" },
    { zh:"田尾鄉", vi:"Điền Vĩ" },     { zh:"埤頭鄉", vi:"Bi Đầu" },
    { zh:"芳苑鄉", vi:"Phương Uyển" }, { zh:"大城鄉", vi:"Đại Thành" },
    { zh:"竹塘鄉", vi:"Trúc Đường" },  { zh:"溪州鄉", vi:"Khê Châu" },
  ],
  "台南市": [
    { zh:"東區", vi:"Khu Đông" },    { zh:"西區", vi:"Khu Tây" },
    { zh:"南區", vi:"Khu Nam" },     { zh:"北區", vi:"Khu Bắc" },
    { zh:"安平區", vi:"An Bình" },   { zh:"安南區", vi:"An Nam" },
    { zh:"永康區", vi:"Vĩnh Khang" },{ zh:"仁德區", vi:"Nhân Đức" },
    { zh:"歸仁區", vi:"Quy Nhân" },  { zh:"新化區", vi:"Tân Hóa" },
    { zh:"善化區", vi:"Thiện Hóa" }, { zh:"麻豆區", vi:"Ma Đậu" },
  ],
  "高雄市": [
    { zh:"三民區", vi:"Tam Dân" },    { zh:"苓雅區", vi:"Linh Nhã" },
    { zh:"前鎮區", vi:"Tiền Trấn" },  { zh:"鼓山區", vi:"Cổ Sơn" },
    { zh:"左營區", vi:"Tả Doanh" },   { zh:"楠梓區", vi:"Nam Tử" },
    { zh:"鳳山區", vi:"Phụng Sơn" },  { zh:"仁武區", vi:"Nhân Vũ" },
    { zh:"大社區", vi:"Đại Xã" },     { zh:"岡山區", vi:"Cương Sơn" },
    { zh:"路竹區", vi:"Lộ Trúc" },    { zh:"旗山區", vi:"Kỳ Sơn" },
  ],
}

export default function HomeClient({ featured, newest }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const [tab, setTab] = useState<"rent"|"buy">("rent")
  const [q, setQ] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedPrice, setSelectedPrice] = useState("")

  function handleSearch() {
    const params = new URLSearchParams()
    params.set("type", tab)
    if (q) params.set("q", q)
    if (selectedCity) params.set("city", selectedCity)
    if (selectedDistrict) params.set("district", selectedDistrict)
    if (selectedType) params.set("property_type", selectedType)
    if (selectedPrice) params.set("price", selectedPrice)
    router.push(`/listings?${params.toString()}`)
  }

  const districts = selectedCity ? DISTRICTS[selectedCity] ?? [] : []

  const PROPERTY_TYPES = [
    { val:"apartment_walkup", zh:"公寓(無電梯)",    vi:"Chung cư thang bộ" },
    { val:"apartment",        zh:"電梯大樓",         vi:"Chung cư thang máy" },
    { val:"house",            zh:"透天厝",           vi:"Nhà cả căn" },
    { val:"villa",            zh:"別墅",             vi:"Biệt thự" },
  ]

  const PRICE_RANGES = tab === "rent"
    ? [
        { val:"0-20000",    zh:"2萬以下/月",       vi:"Dưới 20.000 Đài tệ/tháng" },
        { val:"20000-30000",zh:"2-3萬/月",          vi:"20.000 - 30.000 Đài tệ/tháng" },
        { val:"30000-50000",zh:"3-5萬/月",          vi:"30.000 - 50.000 Đài tệ/tháng" },
        { val:"50000-0",    zh:"5萬以上/月",        vi:"Trên 50.000 Đài tệ/tháng" },
      ]
    : [
        { val:"0-750",      zh:"750萬以下",         vi:"Dưới 750 vạn Đài tệ" },
        { val:"750-1000",   zh:"750~1000萬",        vi:"750 - 1.000 vạn Đài tệ" },
        { val:"1000-1500",  zh:"1000~1500萬",       vi:"1.000 - 1.500 vạn Đài tệ" },
        { val:"1500-2000",  zh:"1500~2000萬",       vi:"1.500 - 2.000 vạn Đài tệ" },
        { val:"2000-3000",  zh:"2000~3000萬",       vi:"2.000 - 3.000 vạn Đài tệ" },
        { val:"3000-0",     zh:"3000萬以上",        vi:"Trên 3.000 vạn Đài tệ" },
      ]

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-orange-500 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative max-w-4xl mx-auto px-4 py-10 sm:py-14">
          <div className="text-center mb-7">
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2 leading-snug">
              {lang==="zh" ? "找到您的理想家園" : "Tìm ngôi nhà lý tưởng của bạn"}
            </h1>
            <p className="text-red-100 text-sm">
              {lang==="zh" ? "台灣最大中越雙語房產平台" : "Nền tảng BĐS Đài Loan song ngữ Trung-Việt"}
            </p>
          </div>

          {/* Search box */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
            {/* Tabs rent/buy */}
            <div className="flex border-b border-gray-100">
              {(["rent","buy"] as const).map(tp => (
                <button key={tp} onClick={() => setTab(tp)}
                  className={`flex-1 py-3 text-sm font-semibold transition ${
                    tab===tp ? "text-red-600 border-b-2 border-red-500 bg-red-50/50" : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {tp==="rent" ? t.rent : t.buy}
                </button>
              ))}
            </div>

            {/* Input keyword */}
            <div className="flex items-center gap-2 px-3 pt-3">
              <span className="text-gray-300 text-lg pl-1">🔍</span>
              <input value={q} onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleSearch()}
                placeholder={lang==="zh" ? "搜尋地區、捷運站、社區名稱..." : "Tìm khu vực, ga MRT, tên tòa nhà..."}
                className="flex-1 text-sm outline-none text-gray-900 placeholder-gray-400" />
            </div>

            {/* City + District dropdowns */}
            <div className="flex items-center gap-2 px-3 pb-3 pt-2">
              <div className="relative flex-1">
                <select
                  value={selectedCity}
                  onChange={e => { setSelectedCity(e.target.value); setSelectedDistrict("") }}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400 cursor-pointer pr-8"
                >
                  <option value="">{lang==="zh" ? "選擇城市" : "Chọn thành phố"}</option>
                  {CITIES.map(c => (
                    <option key={c.zh} value={c.zh}>
                      {lang==="zh" ? c.zh : `${c.vi} (${c.zh})`}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>

              <div className="relative flex-1">
                <select
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                  disabled={!selectedCity}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400 cursor-pointer pr-8 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">{lang==="zh" ? "選擇區域" : "Chọn quận/huyện"}</option>
                  {districts.map(d => (
                    <option key={d.zh} value={d.zh}>
                      {lang==="zh" ? d.zh : `${d.vi} (${d.zh})`}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>

              <button onClick={handleSearch}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shrink-0">
                {lang==="zh" ? "搜尋" : "Tìm kiếm"}
              </button>
            </div>

            {/* Property type + Price row */}
            <div className="flex items-center gap-2 px-3 pb-3">
              <div className="relative flex-1">
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400 cursor-pointer pr-8"
                >
                  <option value="">{lang==="zh" ? "形態（不限）" : "Loại nhà (Tất cả)"}</option>
                  {PROPERTY_TYPES.map(pt => (
                    <option key={pt.val} value={pt.val}>
                      {lang==="zh" ? pt.zh : pt.vi}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>

              <div className="relative flex-1">
                <select
                  value={selectedPrice}
                  onChange={e => setSelectedPrice(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400 cursor-pointer pr-8"
                >
                  <option value="">{lang==="zh" ? "售價（不限）" : "Giá (Tất cả)"}</option>
                  {PRICE_RANGES.map(pr => (
                    <option key={pr.val} value={pr.val}>
                      {lang==="zh" ? pr.zh : pr.vi}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-around text-center">
          {[
            { n:"12,847", label: lang==="zh"?"租屋物件":"Nhà cho thuê" },
            { n:"8,392",  label: lang==="zh"?"售屋物件":"Nhà mua bán" },
            { n:"486",    label: lang==="zh"?"今日新增":"Mới hôm nay" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-red-600 font-bold text-lg leading-none">{s.n}</div>
              <div className="text-gray-400 text-[11px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* ── Nổi bật ── */}
        {featured.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
                {t.featured}
              </h2>
              <Link href="/listings" className="text-sm text-red-600 hover:underline">
                {lang==="zh" ? "查看全部 →" : "Xem tất cả →"}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </section>
        )}

        {/* ── Thành phố ── */}
        <section>
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
            {lang==="zh" ? "熱門城市" : "Thành phố phổ biến"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CITIES.map(c => (
              <Link key={c.zh} href={`/listings?city=${encodeURIComponent(c.slug)}`}
                className="bg-white rounded-2xl p-4 text-center border border-gray-100 hover:border-red-200 hover:shadow-md transition group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition">{c.emoji}</div>
                <div className="font-bold text-gray-900 text-sm">{lang==="zh" ? c.zh : c.vi}</div>
                <div className="text-xs text-red-500 mt-1">
                  {c.n.toLocaleString()} {lang==="zh" ? "件" : "căn"}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Mới đăng ── */}
        {newest.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
                {t.new}
              </h2>
              <Link href="/listings?sort=newest" className="text-sm text-red-600 hover:underline">
                {lang==="zh" ? "查看全部 →" : "Xem tất cả →"}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newest.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </section>
        )}

        {/* ── CTA đăng nhà ── */}
        <section className="relative bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-8 text-center overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="text-white font-bold text-xl mb-2">
              {lang==="zh" ? "想刊登物件？" : "Bạn muốn đăng bán nhà?"}
            </h2>
            <p className="text-red-100 text-sm mb-5">
              {lang==="zh" ? "專業刊登，快速媒合買家與租客" : "Đăng tin chuyên nghiệp, kết nối người mua nhanh chóng"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="https://page.line.me/881vvzrj" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-green-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-green-50 transition shadow-lg">
                💬 {lang==="zh" ? "LINE 聯絡我們" : "Liên hệ qua LINE"}
              </a>
              <a href="https://www.facebook.com/MichaelTranDuyKhanh/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
                {lang==="zh" ? "Facebook 聯絡" : "Liên hệ Facebook"}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
