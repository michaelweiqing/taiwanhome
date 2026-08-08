"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Property } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import { createClient } from "@/lib/supabase-browser"
import PropertyCard from "@/components/PropertyCard"
import ReelsSection from "@/components/ReelsSection"
import AiSearchBox from "@/components/AiSearchBox"
import type { PropertyReel } from "@/lib/data"
import type { VnCommunity } from "@/lib/vnCommunities"
import { SEO_LANDING_PAGES } from "@/lib/seoLandingPages"
import { Search, MessageCircle, Building2, Moon, Plane, Microscope, Building, Wheat, Landmark, Waves, Eye, MapPinned, ShoppingBasket, UtensilsCrossed, Church, HeartPulse, GraduationCap, Factory, ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Props { featured: Property[]; newest: Property[]; reels: PropertyReel[]; vnCommunities: VnCommunity[] }

const CITIES: { zh: string; vi: string; Icon: LucideIcon; n: number; slug: string }[] = [
  { zh:"台北市", vi:"Đài Bắc",   Icon:Building2,   n:5234, slug:"台北市" },
  { zh:"新北市", vi:"Tân Bắc",   Icon:Moon,        n:6102, slug:"新北市" },
  { zh:"桃園市", vi:"Đào Viên",  Icon:Plane,       n:3540, slug:"桃園市" },
  { zh:"新竹市", vi:"Tân Trúc",  Icon:Microscope,  n:1230, slug:"新竹市" },
  { zh:"台中市", vi:"Đài Trung", Icon:Building,    n:3891, slug:"台中市" },
  { zh:"彰化縣", vi:"Chương Hóa",Icon:Wheat,       n:980,  slug:"彰化縣" },
  { zh:"台南市", vi:"Đài Nam",   Icon:Landmark,    n:1482, slug:"台南市" },
  { zh:"高雄市", vi:"Cao Hùng",  Icon:Waves,       n:2710, slug:"高雄市" },
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

export default function HomeClient({ featured, newest, reels, vnCommunities }: Props) {
  const { lang, t } = useLang()
  const router = useRouter()
  const [tab, setTab] = useState<"rent"|"buy">("rent")
  const [q, setQ] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedPrice, setSelectedPrice] = useState("")
  const [selectedRooms, setSelectedRooms] = useState("")
  const [selectedArea, setSelectedArea] = useState("")
  const [selectedAge, setSelectedAge] = useState("")
  const [selectedFloor, setSelectedFloor] = useState("")
  const [selectedParking, setSelectedParking] = useState("")
  const [todayVisits, setTodayVisits] = useState<number | null>(null)

  // Đếm lượt truy cập trang web hôm nay — mỗi trình duyệt chỉ tính 1 lần/ngày
  useEffect(() => {
    const supabase = createClient()
    const today = new Date().toISOString().slice(0, 10)
    const flagKey = `taiwanhome_visited_${today}`

    const run = async () => {
      try {
        if (!localStorage.getItem(flagKey)) {
          const { data, error } = await supabase.rpc("increment_site_visit")
          if (!error && typeof data === "number") setTodayVisits(data)
          localStorage.setItem(flagKey, "1")
        } else {
          const { data } = await supabase
            .from("site_visits")
            .select("count")
            .eq("visit_date", today)
            .maybeSingle()
          if (data) setTodayVisits(data.count)
        }
      } catch {}
    }
    run()
  }, [])

  function handleSearch() {
    const params = new URLSearchParams()
    params.set("type", tab)
    if (q) params.set("q", q)
    if (selectedCity) params.set("city", selectedCity)
    if (selectedDistrict) params.set("district", selectedDistrict)
    if (selectedType) params.set("property_type", selectedType)
    if (tab === "buy") {
      if (selectedRooms) params.set("rooms", selectedRooms)
      if (selectedArea) params.set("area", selectedArea)
      if (selectedAge) params.set("age", selectedAge)
      if (selectedFloor) params.set("floor", selectedFloor)
      if (selectedParking) params.set("parking", selectedParking)
    }
    if (selectedPrice) params.set("price", selectedPrice)
    router.push(`/listings?${params.toString()}`)
  }

  const districts = selectedCity ? DISTRICTS[selectedCity] ?? [] : []

  const PROPERTY_TYPES = [
    { val:"apartment_walkup", zh:"公寓(無電梯)",    vi:"Chung cư thang bộ" },
    { val:"apartment",        zh:"電梯大樓",         vi:"Chung cư thang máy" },
    { val:"house",            zh:"透天厝",           vi:"Nhà cả căn" },
    { val:"villa",            zh:"套房/雅房",        vi:"Phòng đơn" },
    { val:"shop",             zh:"店面",             vi:"Mặt bằng" },
    { val:"land",             zh:"土地",             vi:"Đất" },
    { val:"factory",          zh:"廠房",             vi:"Công xưởng" },
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

  // Các bộ lọc chỉ dùng cho tab Mua nhà
  const ROOM_OPTIONS = [
    { val:"1",  zh:"1房",    vi:"1 phòng ngủ" },
    { val:"2",  zh:"2房",    vi:"2 phòng ngủ" },
    { val:"3",  zh:"3房",    vi:"3 phòng ngủ" },
    { val:"4",  zh:"4房",    vi:"4 phòng ngủ" },
    { val:"5+", zh:"5房以上", vi:"Từ 5 phòng ngủ" },
  ]
  const AREA_OPTIONS = [
    { val:"0-20",   zh:"20坪以下",    vi:"Dưới 20 bình" },
    { val:"20-30",  zh:"20-30坪",     vi:"20 - 30 bình" },
    { val:"30-40",  zh:"30-40坪",     vi:"30 - 40 bình" },
    { val:"40-50",  zh:"40-50坪",     vi:"40 - 50 bình" },
    { val:"50-60",  zh:"50-60坪",     vi:"50 - 60 bình" },
    { val:"60-100", zh:"60-100坪",    vi:"60 - 100 bình" },
    { val:"100-0",  zh:"100坪以上",   vi:"Trên 100 bình" },
  ]
  const AGE_OPTIONS = [
    { val:"0-5",   zh:"5年以下",   vi:"Dưới 5 năm" },
    { val:"5-10",  zh:"5-10年",    vi:"5 - 10 năm" },
    { val:"10-20", zh:"10-20年",   vi:"10 - 20 năm" },
    { val:"20-30", zh:"20-30年",   vi:"20 - 30 năm" },
    { val:"30-40", zh:"30-40年",   vi:"30 - 40 năm" },
    { val:"40-0",  zh:"40年以上",  vi:"Trên 40 năm" },
  ]
  const FLOOR_OPTIONS = [
    { val:"1",        zh:"1樓",     vi:"Tầng 1" },
    { val:"2-6",       zh:"2-6樓",   vi:"Tầng 2 - 6" },
    { val:"6-12",      zh:"6-12樓",  vi:"Tầng 6 - 12" },
    { val:"12+",       zh:"12樓以上", vi:"Trên tầng 12" },
    { val:"basement",  zh:"地下樓",  vi:"Tầng hầm" },
    { val:"whole",     zh:"整棟",    vi:"Cả tòa nhà" },
  ]
  const PARKING_OPTIONS = [
    { val:"yes", zh:"有車位", vi:"Có chỗ đậu xe" },
    { val:"no",  zh:"無車位", vi:"Không có chỗ đậu xe" },
  ]

  const selCls = "w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400 cursor-pointer pr-8"

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
              <Search size={18} strokeWidth={2.2} className="text-gray-300 shrink-0 ml-1" />
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

            {/* Property type row */}
            <div className="flex items-center gap-2 px-3 pb-2">
              <div className="relative flex-1">
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className={selCls}
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
              {tab === "rent" && (
                <div className="relative flex-1">
                  <select
                    value={selectedPrice}
                    onChange={e => setSelectedPrice(e.target.value)}
                    className={selCls}
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
              )}
            </div>

            {/* Các bộ lọc riêng cho Mua nhà: Số phòng, Diện tích, Tuổi nhà, Tầng lầu, Chỗ đậu xe, rồi mới đến Giá */}
            {tab === "buy" && (
              <>
                <div className="grid grid-cols-2 gap-2 px-3 pb-2">
                  <div className="relative">
                    <select value={selectedRooms} onChange={e => setSelectedRooms(e.target.value)} className={selCls}>
                      <option value="">{lang==="zh" ? "格局（不限）" : "Số phòng (Tất cả)"}</option>
                      {ROOM_OPTIONS.map(o => <option key={o.val} value={o.val}>{lang==="zh" ? o.zh : o.vi}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                  </div>
                  <div className="relative">
                    <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)} className={selCls}>
                      <option value="">{lang==="zh" ? "坪數（不限）" : "Diện tích (Tất cả)"}</option>
                      {AREA_OPTIONS.map(o => <option key={o.val} value={o.val}>{lang==="zh" ? o.zh : o.vi}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 px-3 pb-2">
                  <div className="relative">
                    <select value={selectedAge} onChange={e => setSelectedAge(e.target.value)} className={selCls}>
                      <option value="">{lang==="zh" ? "屋齡（不限）" : "Tuổi nhà (Tất cả)"}</option>
                      {AGE_OPTIONS.map(o => <option key={o.val} value={o.val}>{lang==="zh" ? o.zh : o.vi}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                  </div>
                  <div className="relative">
                    <select value={selectedFloor} onChange={e => setSelectedFloor(e.target.value)} className={selCls}>
                      <option value="">{lang==="zh" ? "樓層（不限）" : "Tầng lầu (Tất cả)"}</option>
                      {FLOOR_OPTIONS.map(o => <option key={o.val} value={o.val}>{lang==="zh" ? o.zh : o.vi}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 px-3 pb-2">
                  <div className="relative">
                    <select value={selectedParking} onChange={e => setSelectedParking(e.target.value)} className={selCls}>
                      <option value="">{lang==="zh" ? "車位（不限）" : "Chỗ đậu xe (Tất cả)"}</option>
                      {PARKING_OPTIONS.map(o => <option key={o.val} value={o.val}>{lang==="zh" ? o.zh : o.vi}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                  </div>
                  <div className="relative">
                    <select value={selectedPrice} onChange={e => setSelectedPrice(e.target.value)} className={selCls}>
                      <option value="">{lang==="zh" ? "售價（不限）" : "Giá (Tất cả)"}</option>
                      {PRICE_RANGES.map(pr => <option key={pr.val} value={pr.val}>{lang==="zh" ? pr.zh : pr.vi}</option>)}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── 8386 AI: Trợ lý tìm nhà bằng tiếng Việt ── */}
          <AiSearchBox />
        </div>
      </div>

      {/* ── Reels: Video ngắn nhà đất ── */}
      <ReelsSection reels={reels} />

      {/* ── Bản đồ cuộc sống người Việt ── */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <Link href="/khu-vuc-nguoi-viet" className="group block relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 shadow-xl">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute top-4 right-4 text-6xl opacity-20 rotate-12 select-none">🇻🇳</div>

          <div className="relative px-5 py-6 sm:px-8 sm:py-7">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full mb-3">
                  <MapPinned size={12} strokeWidth={2.5} /> {lang==="zh" ? "全新功能" : "Tính năng mới"}
                </span>
                <h2 className="text-white font-extrabold text-xl sm:text-2xl mb-1.5 flex items-center gap-2">
                  🗺️ {lang==="zh" ? "越南人生活地圖" : "Bản đồ cuộc sống người Việt"}
                </h2>
                <p className="text-emerald-50 text-sm leading-relaxed">
                  {lang==="zh"
                    ? "越南人常聚居、生活、工作的區域 — 找房、市場、越南料理、教堂、醫院、學校、工業區，一次全都看到。"
                    : "Nơi người Việt thường sinh sống, học tập và làm việc — nhà cho thuê, chợ Việt, quán ăn Việt, nhà thờ, bệnh viện, trường học, khu công nghiệp — tất cả trong một trang."}
                </p>
              </div>
              <span className="hidden sm:inline-flex shrink-0 items-center gap-1.5 bg-white text-emerald-700 font-bold text-sm px-4 py-2.5 rounded-xl group-hover:bg-emerald-50 transition shadow-md">
                {lang==="zh" ? "立即探索" : "Khám phá ngay"} <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition" />
              </span>
            </div>

            {/* Hàng icon chuyên mục */}
            <div className="flex flex-wrap gap-2 mt-5">
              {[
                { Icon: ShoppingBasket,     vi: "Chợ Việt",      zh: "越南市場" },
                { Icon: UtensilsCrossed,    vi: "Quán ăn Việt",  zh: "越南料理" },
                { Icon: Church,             vi: "Nhà thờ",       zh: "教堂" },
                { Icon: HeartPulse,         vi: "Bệnh viện",     zh: "醫院" },
                { Icon: GraduationCap,      vi: "Trường học",    zh: "大學" },
                { Icon: Factory,            vi: "Khu công nghiệp", zh: "工業區" },
              ].map((it) => (
                <span key={it.vi} className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  <it.Icon size={13} strokeWidth={2.2} /> {lang==="zh" ? it.zh : it.vi}
                </span>
              ))}
            </div>

            {/* Chip khu vực nổi bật */}
            {vnCommunities.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
                {vnCommunities.slice(0, 8).map((c) => (
                  <span key={c.slug}
                    className="shrink-0 flex items-center gap-1 bg-white/95 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                    📍 {lang==="zh" ? c.name_zh : c.name_vi}
                  </span>
                ))}
              </div>
            )}

            <span className="sm:hidden inline-flex mt-4 items-center gap-1.5 bg-white text-emerald-700 font-bold text-sm px-4 py-2.5 rounded-xl shadow-md">
              {lang==="zh" ? "立即探索" : "Khám phá ngay"} <ArrowRight size={15} strokeWidth={2.5} />
            </span>
          </div>
        </Link>
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
                <c.Icon size={28} strokeWidth={1.8} className="mx-auto mb-2 text-red-500 group-hover:scale-110 transition" />
                <div className="font-bold text-gray-900 text-sm">{lang==="zh" ? c.zh : c.vi}</div>
                <div className="text-xs text-red-500 mt-1">
                  {c.n.toLocaleString()} {lang==="zh" ? "件" : "căn"}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Tìm nhà theo khu vực (internal link cho SEO) ── */}
        <section>
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
            {lang==="zh" ? "依地區找房" : "Tìm nhà theo khu vực"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {SEO_LANDING_PAGES.map(p => (
              <Link key={p.slug} href={`/${p.slug}`}
                className="bg-white hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs px-3 py-1.5 rounded-full border border-gray-100 transition">
                {lang==="zh" ? p.title_zh.split(" - ")[0].split(" | ")[0] : p.h1_vi}
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
            {todayVisits !== null && (
              <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                <Eye size={12} strokeWidth={2.2} />
                {lang==="zh"
                  ? `今日 ${todayVisits.toLocaleString()} 人次造訪`
                  : `Hôm nay đã có ${todayVisits.toLocaleString()} lượt truy cập`}
              </div>
            )}
            <h2 className="text-white font-bold text-xl mb-2">
              {lang==="zh" ? "想刊登物件？" : "Bạn muốn đăng bán nhà?"}
            </h2>
            <p className="text-red-100 text-sm mb-5">
              {lang==="zh" ? "專業刊登，快速媒合買家與租客" : "Đăng tin chuyên nghiệp, kết nối người mua nhanh chóng"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="https://page.line.me/881vvzrj" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-green-600 font-bold px-6 py-3 rounded-xl text-sm hover:bg-green-50 transition shadow-lg">
                <MessageCircle size={16} strokeWidth={2.2} /> {lang==="zh" ? "LINE 聯絡我們" : "Liên hệ qua LINE"}
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
