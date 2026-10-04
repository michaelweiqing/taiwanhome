// lib/lvrI18n.ts — Từ điển Trung -> Việt cho dữ liệu 實價登錄
import { DISTRICTS } from "@/lib/locations"

export const LVR_CITIES: { zh: string; vi: string }[] = [
  { zh: "台中市", vi: "Đài Trung" }, { zh: "台北市", vi: "Đài Bắc" }, { zh: "新北市", vi: "Tân Bắc" },
  { zh: "桃園市", vi: "Đào Viên" }, { zh: "台南市", vi: "Đài Nam" }, { zh: "高雄市", vi: "Cao Hùng" },
  { zh: "彰化縣", vi: "Chương Hóa" }, { zh: "新竹市", vi: "TP. Tân Trúc" }, { zh: "新竹縣", vi: "Huyện Tân Trúc" },
  { zh: "基隆市", vi: "Cơ Long" }, { zh: "苗栗縣", vi: "Miêu Lật" }, { zh: "南投縣", vi: "Nam Đầu" },
  { zh: "雲林縣", vi: "Vân Lâm" }, { zh: "嘉義市", vi: "TP. Gia Nghĩa" }, { zh: "嘉義縣", vi: "Huyện Gia Nghĩa" },
  { zh: "屏東縣", vi: "Bình Đông" }, { zh: "宜蘭縣", vi: "Nghi Lan" }, { zh: "花蓮縣", vi: "Hoa Liên" },
  { zh: "台東縣", vi: "Đài Đông" }, { zh: "澎湖縣", vi: "Bành Hồ" }, { zh: "金門縣", vi: "Kim Môn" },
  { zh: "連江縣", vi: "Liên Giang" },
]
export const cityVi = (zh: string) => LVR_CITIES.find(c => c.zh === zh)?.vi || zh

export function districtVi(city: string, zh: string) {
  const vi = DISTRICTS[city]?.find(d => d.zh === zh)?.vi
  return vi || zh
}

export const BUILDING_TYPES: { zh: string; vi: string }[] = [
  { zh: "住宅大樓(11層含以上有電梯)", vi: "Tòa cao tầng có thang máy (≥11 tầng)" },
  { zh: "華廈(10層含以下有電梯)", vi: "Chung cư thang máy (≤10 tầng)" },
  { zh: "公寓(5樓含以下無電梯)", vi: "Chung cư thang bộ (≤5 tầng)" },
  { zh: "透天厝", vi: "Nhà phố nguyên căn (透天)" },
  { zh: "套房(1房1廳1衛)", vi: "Căn hộ studio (套房)" },
  { zh: "店面(店鋪)", vi: "Mặt bằng kinh doanh" },
  { zh: "辦公商業大樓", vi: "Văn phòng" },
  { zh: "廠辦", vi: "Xưởng kèm văn phòng" },
  { zh: "工廠", vi: "Nhà xưởng" },
  { zh: "倉庫", vi: "Kho bãi" },
  { zh: "農舍", vi: "Nhà nông thôn (農舍)" },
  { zh: "其他", vi: "Khác" },
]
export const buildingTypeVi = (zh?: string | null) =>
  zh ? BUILDING_TYPES.find(b => b.zh === zh)?.vi || zh : ""
export const buildingTypeShortZh = (zh?: string | null) => (zh ? zh.replace(/\(.*\)$/, "") : "")

const RENT_TYPES: Record<string, string> = {
  "整棟(戶)出租": "Thuê nguyên căn", "獨立套房": "Phòng khép kín (套房)", "分租套房": "Phòng chia thuê có WC riêng",
  "分租雅房": "Phòng ở ghép (雅房)", "分層出租": "Thuê theo tầng", "其他": "Khác",
}
export const rentTypeVi = (zh?: string | null) => (zh ? RENT_TYPES[zh] || zh : "")

const USES: Record<string, string> = {
  "住家用": "Nhà ở", "商業用": "Thương mại", "住商用": "Ở + kinh doanh", "工業用": "Công nghiệp",
  "辦公用": "Văn phòng", "其他": "Khác", "見其他登記事項": "Xem ghi chú đăng ký",
  "見其它登記事項": "Xem ghi chú đăng ký", "集合住宅": "Nhà ở (chung cư)", "住宅": "Nhà ở", "辦公室": "Văn phòng",
  "一般事務所": "Văn phòng", "店舖": "Cửa hàng", "公寓": "Nhà ở (chung cư)", "農業用": "Nông nghiệp",
  "廠房": "Nhà xưởng", "住工用": "Ở + sản xuất", "商辦用": "Thương mại + văn phòng", "國民住宅": "Nhà ở xã hội",
  "寄宿舍": "Ký túc xá", "見使用執照": "Xem giấy phép sử dụng", "農舍": "Nhà nông thôn",
}
export const mainUseVi = (zh?: string | null) => (zh ? USES[zh] || zh : "")

// "十二層" -> 12 ; "地下一層" -> -1
const DIGIT: Record<string, number> = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
function cnNum(s: string): number | null {
  if (!s) return null
  if (/^\d+$/.test(s)) return Number(s)
  let total = 0, cur = 0
  for (const ch of s) {
    if (DIGIT[ch]) cur = DIGIT[ch]
    else if (ch === "十") { total += (cur || 1) * 10; cur = 0 }
    else if (ch === "百") { total += (cur || 1) * 100; cur = 0 }
    else return null
  }
  return total + cur
}
export function floorLabel(zh: string | null | undefined, lang: "zh" | "vi"): string {
  if (!zh) return ""
  if (lang === "zh") return zh
  if (zh.includes("全")) return "Cả tòa"
  return zh.split(/[，,]/).map(part => {
    const m = part.match(/(地下)?([一二三四五六七八九十百\d]+)層/)
    if (!m) return part
    const n = cnNum(m[2])
    if (n === null) return part
    return m[1] ? `Hầm ${n}` : `Tầng ${n}`
  }).join(", ")
}
