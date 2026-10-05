// lib/listingImport.ts
// Đăng tin từ link: đọc trang tin nhà (trang công ty / trang khác), trích thông tin thành bản nháp
// theo đúng cấu trúc bảng properties, dịch sang tiếng Việt bằng AI, tải ảnh bìa về Supabase Storage.
// Chỉ dùng cho nhà mà cửa hàng đã nhận ủy thác hoặc được phép bán (người dùng xác nhận ở trang admin).
import { DISTRICTS } from "./locations"

export const AGENT_DEFAULTS = {
  agent_name: "陳維慶",
  agent_name_vi: "Duy Khánh (Michael)",
  agent_phone: "0903-379-666",
  agent_line: "https://page.line.me/881vvzrj",
}

const UA = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
  "Accept-Language": "zh-TW,zh;q=0.9,vi;q=0.8",
}

export interface ImportDraft {
  id: string
  title_zh: string; title_vi: string
  city: string; city_vi: string; district: string; district_vi: string
  address: string; address_vi: string
  listing_type: "buy" | "rent"; property_type: string
  price: number; price_per_ping: number | null
  area_ping: number; area_main_ping: number | null; area_balcony_ping: number | null
  area_common_ping: number | null; area_land_ping: number | null
  bedrooms: number; bathrooms: number
  floor: string; total_floors: number; age: number; facing: string
  features: string[]; features_vi: string[]
  parking: boolean; parking_type: string | null
  community_name: string | null
  agent_company: string | null; agent_developer: string | null
  lat: number | null; lng: number | null
  agent_name: string; agent_name_vi: string; agent_phone: string; agent_line: string
  source_url: string
  cover_image_url?: string | null
  translated?: boolean
}

const CITY_VI: Record<string, string> = {
  "台北市": "Đài Bắc", "新北市": "Tân Bắc", "桃園市": "Đào Viên", "台中市": "Đài Trung", "台南市": "Đài Nam",
  "高雄市": "Cao Hùng", "基隆市": "Cơ Long", "新竹市": "TP. Tân Trúc", "新竹縣": "Huyện Tân Trúc", "苗栗縣": "Miêu Lật",
  "彰化縣": "Chương Hóa", "南投縣": "Nam Đầu", "雲林縣": "Vân Lâm", "嘉義市": "TP. Gia Nghĩa", "嘉義縣": "Huyện Gia Nghĩa",
  "屏東縣": "Bình Đông", "宜蘭縣": "Nghi Lan", "花蓮縣": "Hoa Liên", "台東縣": "Đài Đông", "澎湖縣": "Bành Hồ",
}
// Toạ độ trung tâm thành phố — dùng khi không tìm được toạ độ theo địa chỉ
const CITY_CENTER: Record<string, [number, number]> = {
  "台北市": [25.033, 121.5654], "新北市": [25.012, 121.4657], "桃園市": [24.9937, 121.301], "台中市": [24.1477, 120.6736],
  "台南市": [22.9999, 120.227], "高雄市": [22.6273, 120.3014], "新竹市": [24.8138, 120.9675], "彰化縣": [24.0518, 120.5161],
}

function districtVi(city: string, district: string) {
  const vi = DISTRICTS[city]?.find(d => d.zh === district)?.vi
  if (!vi) return district
  if (/^(Khu|TP\.|Huyện|Thị)/.test(vi)) return vi
  if (district.endsWith("區")) return `Quận ${vi}`
  if (district.endsWith("市")) return `TP. ${vi}`
  if (district.endsWith("鎮")) return `Trấn ${vi}`
  if (district.endsWith("鄉")) return `Hương ${vi}`
  return vi
}

export function mapPropertyType(zh: string): string {
  if (/透天|別墅|農舍/.test(zh)) return "house"
  if (/公寓/.test(zh)) return "apartment_walkup"
  if (/大樓|華廈|電梯/.test(zh)) return "apartment"
  if (/套房/.test(zh)) return "villa"
  if (/店面|店鋪|辦公/.test(zh)) return "shop"
  if (/土地|農地|建地/.test(zh)) return "land"
  if (/廠房|工廠|廠辦|倉庫/.test(zh)) return "factory"
  return "house"
}

const htmlToText = (h: string) => h
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
  .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
  .replace(/\s+/g, " ").trim()
const meta = (h: string, prop: string) =>
  (h.match(new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]*)"`, "i"))?.[1] || "").replace(/&amp;/g, "&").trim() || null
const n = (s?: string | null) => (s ? Number(s.replace(/,/g, "")) : NaN)

// ── Trang chi tiết 永慶 (buy.yungching.com.tw/house/xxxx) — trang render sẵn nội dung, đọc trực tiếp ──
export function parseYungching(html: string, url: string): Partial<ImportDraft> & { rawFeatures: string } {
  const t = htmlToText(html)
  const ogTitle = meta(html, "og:title") || ""
  const title = ogTitle.split(" | ")[0].replace(/[\p{Extended_Pictographic}️]/gu, "").replace(/\s+/g, " ").trim()
  const headStart = t.indexOf("僅供參考使用")
  const headEnd = t.indexOf("預約賞屋", headStart)
  const head = headStart >= 0 && headEnd > headStart ? t.slice(headStart, headEnd) : t.slice(0, 2000)

  const code = t.match(/基本資訊 \(([A-Z]{1,3}\d+)\)/)?.[1] || ""
  const id = code.startsWith("YC") ? code.slice(2) : code || (url.match(/house\/(\d+)/)?.[1] ?? "")

  const addr = head.match(/((?:台|臺)北市|新北市|桃園市|(?:台|臺)中市|(?:台|臺)南市|高雄市|基隆市|新竹[市縣]|苗栗縣|彰化縣|南投縣|雲林縣|嘉義[市縣]|屏東縣|宜蘭縣|花蓮縣|(?:台|臺)東縣|澎湖縣)(\S+?[區鄉鎮市])(\S*)/)
  const city = (addr?.[1] || "").replace("臺", "台")
  const district = addr?.[2] || ""
  const address = addr ? `${city}${district}${addr[3] || ""}` : ""

  const priceM = head.match(/([\d,]+(?:\.\d+)?)\s*萬\s*單價([\d.]+)萬\/坪/)
  const typeM = head.match(/萬\/坪\s*(?:尚未分算車位單價\s*)?(\S+?)\s+屋齡/)
  const ageM = head.match(/屋齡([\d.]+)\s*年/)
  const floorM = head.match(/年\s*(\S+?)\/(\d+)樓/)
  const layout = t.match(/建物格局 (\d+|--)房\(室\)(\d+|--)廳(\d+|--)衛/)
  const storeM = head.match(/衛\s+(.+)$/)
  const store = storeM ? storeM[1].replace(/線上問/g, "").replace(/\s+/g, " ").trim() : null

  const num1 = (re: RegExp) => { const v = n(t.match(re)?.[1]); return Number.isFinite(v) ? v : null }
  const feat = t.match(/特色說明 ([\s\S]*?) 基本資訊/)?.[1] || ""

  return {
    id, title_zh: title, city, district, address,
    listing_type: "buy",
    property_type: mapPropertyType(typeM?.[1] || ""),
    price: Math.round(n(priceM?.[1]) || 0),
    price_per_ping: priceM ? Number(n(priceM[2]).toFixed(2)) : null,
    area_ping: num1(/建物坪數 ([\d.,]+)坪/) || 0,
    area_main_ping: num1(/主建物 ([\d.,]+)坪/),
    area_balcony_ping: num1(/陽台([\d.,]+)坪/),
    area_common_ping: num1(/共同使用小計 ([\d.,]+)坪/),
    area_land_ping: num1(/土地坪數 ([\d.,]+)坪/),
    bedrooms: layout && layout[1] !== "--" ? Number(layout[1]) : 0,
    bathrooms: layout && layout[3] !== "--" ? Number(layout[3]) : 0,
    floor: floorM?.[1] || "",
    total_floors: floorM ? Number(floorM[2]) : 0,
    age: ageM ? Math.round(Number(ageM[1])) : 0,
    parking: /車位數量|車位資訊|車位價/.test(t),
    parking_type: t.match(/・車位(?: \d+)? (\S+)/)?.[1] || null,
    community_name: t.match(/社區 (\S+?) 看更多社區資訊/)?.[1] || null,
    agent_company: store,
    cover_image_url: meta(html, "og:image"),
    rawFeatures: feat.replace(title, "").trim(),
  }
}

// Tách đoạn "特色說明" thành các ý (khi không có AI)
export function splitFeatures(raw: string): string[] {
  return raw
    .split(/[📣🌱🍎🏡🚗🏗🛏🎓🏙🚄💎✔★☆●◆■▶►❤️✨🔥⭐️]|(?:\s{1,}(?=[【「]))|。/u)
    .map(s => s.replace(/^[\s\-–|｜:：、,，]+|[\s\-–|｜]+$/g, "").trim())
    .filter(s => s.length >= 4 && s.length <= 90)
    .slice(0, 8)
}

// ── AI (Claude Haiku) ──
async function askClaude(prompt: string, maxTokens = 2000): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error("ANTHROPIC_API_KEY missing")
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message || `anthropic ${res.status}`)
  return data?.content?.[0]?.text || ""
}
const parseJson = (s: string) => JSON.parse(s.slice(s.indexOf("{"), s.lastIndexOf("}") + 1))

// Viết lại các ý nổi bật (tiếng Trung, gọn) + dịch tiêu đề, địa chỉ, ý nổi bật sang tiếng Việt
export async function translateDraft(d: Pick<ImportDraft, "title_zh" | "address" | "features">, rawFeatures?: string) {
  const out = parseJson(await askClaude(
`Bạn là trợ lý đăng tin bất động sản song ngữ Trung (phồn thể) - Việt cho người Việt ở Đài Loan.
Dữ liệu tin nhà:
- Tiêu đề: ${d.title_zh}
- Địa chỉ: ${d.address}
- Đặc điểm: ${rawFeatures || d.features.join(" / ")}

Trả về DUY NHẤT JSON:
{"features_zh": [4-7 ý nổi bật bằng tiếng Trung phồn thể, mỗi ý ngắn gọn, bỏ emoji, giữ đúng sự thật],
 "title_vi": "tiêu đề tiếng Việt tự nhiên",
 "address_vi": "địa chỉ tiếng Việt (vd: Đường Quân Công đoạn 2, Quận Bắc Đồn, Đài Trung)",
 "features_vi": [bản dịch tiếng Việt tương ứng từng ý features_zh]}
Yêu cầu:
- Phần tiếng Việt phải 100% tiếng Việt, KHÔNG để sót chữ Hán. Tên đường/quận phiên âm Hán-Việt (vd 軍功路 = Đường Quân Công, 北屯區 = Quận Bắc Đồn).
- Văn phong quảng cáo bất động sản tự nhiên, dễ hiểu với người Việt ở Đài Loan.
- Thuật ngữ: 透天/透天厝 = nhà phố nguyên căn; 別墅 = biệt thự; 孝親房 = phòng cho ông bà/bố mẹ; 稀有釋出 = hiếm có, mới rao bán;
  車位 = chỗ đậu xe; 坪 = bình (坪); 套房 = phòng khép kín; 重劃區 = khu quy hoạch mới; 商圈 = khu thương mại; 捷運 = MRT; 國小/國中 = trường tiểu học/THCS; 臨路 = mặt đường; 面寬 = mặt tiền.
- Không bịa thêm thông tin không có trong dữ liệu.`))
  const fz = Array.isArray(out.features_zh) && out.features_zh.length ? out.features_zh.map(String) : d.features
  let fv: string[] = Array.isArray(out.features_vi) ? out.features_vi.map(String) : []
  let title_vi = String(out.title_vi || ""), address_vi = String(out.address_vi || "")
  // Kiểm tra lại: nếu phần tiếng Việt còn sót chữ Hán thì nhờ AI sửa thêm 1 lần
  const CJK = /[㐀-鿿]/
  if ([title_vi, address_vi, ...fv].some(s => CJK.test(s))) {
    try {
      const fix = parseJson(await askClaude(
`Các câu tiếng Việt sau (tin bất động sản ở Đài Loan) còn sót chữ Hán. Hãy dịch nốt phần chữ Hán sang tiếng Việt tự nhiên
(孝親房 = phòng cho ông bà/bố mẹ, 預留 = đã chừa sẵn, tên riêng thì phiên âm Hán-Việt), giữ nguyên phần còn lại.
Trả về DUY NHẤT JSON cùng cấu trúc: ${JSON.stringify({ title_vi, address_vi, features_vi: fv })}`))
      if (fix.title_vi) title_vi = String(fix.title_vi)
      if (fix.address_vi) address_vi = String(fix.address_vi)
      if (Array.isArray(fix.features_vi) && fix.features_vi.length === fv.length) fv = fix.features_vi.map(String)
    } catch {}
  }
  return { title_vi, address_vi, features: fz, features_vi: fv }
}

// Trang không phải 永慶: dùng AI đọc nội dung trang và trích thông tin
async function aiExtractGeneric(text: string, url: string): Promise<Partial<ImportDraft> & { rawFeatures: string }> {
  const o = parseJson(await askClaude(
`Trích thông tin tin bán/cho thuê nhà ở Đài Loan từ nội dung trang web sau. Trả về DUY NHẤT JSON với các khoá:
{"id": mã tin (chuỗi, nếu có), "title_zh", "address" (đầy đủ, bắt đầu bằng thành phố vd 台中市北屯區...), "city" (vd 台中市, dùng chữ 台),
 "district" (vd 北屯區), "listing_type": "buy" hoặc "rent", "type_zh" (vd 透天厝/公寓/大樓/華廈/套房/店面/土地),
 "price": số (bán: đơn vị 萬; thuê: 元/tháng), "price_per_ping": số 萬/坪 hoặc null, "area_ping": số, "area_main_ping", "area_land_ping",
 "bedrooms", "bathrooms", "floor" (chuỗi), "total_floors", "age" (năm), "parking" (true/false), "community_name",
 "agent_company" (tên công ty/cửa hàng môi giới đăng tin), "features": [ý nổi bật tiếng Trung]}
Giá trị không có thì để null. URL: ${url}
Nội dung:
${text.slice(0, 12000)}`, 2500))
  return {
    id: o.id ? String(o.id).replace(/\W/g, "") : "", title_zh: o.title_zh || "", address: o.address || "",
    city: String(o.city || "").replace("臺", "台"), district: o.district || "",
    listing_type: o.listing_type === "rent" ? "rent" : "buy", property_type: mapPropertyType(o.type_zh || ""),
    price: Math.round(Number(o.price) || 0), price_per_ping: o.price_per_ping ?? null,
    area_ping: Number(o.area_ping) || 0, area_main_ping: o.area_main_ping ?? null, area_land_ping: o.area_land_ping ?? null,
    area_balcony_ping: null, area_common_ping: null,
    bedrooms: Number(o.bedrooms) || 0, bathrooms: Number(o.bathrooms) || 0, floor: o.floor ? String(o.floor) : "",
    total_floors: Number(o.total_floors) || 0, age: Math.round(Number(o.age) || 0), parking: !!o.parking, parking_type: null,
    community_name: o.community_name || null, agent_company: o.agent_company || null,
    features: Array.isArray(o.features) ? o.features.map(String) : [], rawFeatures: "",
  }
}

// ── Toạ độ (OpenStreetMap Nominatim) ──
async function geocode(address: string, city: string): Promise<[number, number] | null> {
  const tries = [address, address.replace(/\d+[號号].*$/, ""), address.replace(/(區|鄉|鎮|市)[^區鄉鎮市]*$/, "$1")]
  for (const q of [...new Set(tries)].filter(Boolean)) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tw&q=${encodeURIComponent(q)}`,
        { headers: { "User-Agent": "8386.tw listing import (https://8386.tw)" } })
      const j = await r.json()
      if (Array.isArray(j) && j[0]) return [Number(Number(j[0].lat).toFixed(6)), Number(Number(j[0].lon).toFixed(6))]
    } catch {}
  }
  return CITY_CENTER[city] || null
}

// ── Ảnh: tải ảnh từ link về rồi lưu vào Supabase Storage (bucket "properties") ──
const sbBase = () => (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "")

export async function copyImageToStorage(srcUrl: string, folder: string, name: string): Promise<string | null> {
  try {
    const r = await fetch(srcUrl, { headers: UA })
    if (!r.ok) return null
    const type = r.headers.get("content-type") || "image/jpeg"
    if (!type.startsWith("image/")) return null
    const buf = await r.arrayBuffer()
    if (buf.byteLength < 5000) return null
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg"
    const path = `import/${folder}/${name}.${ext}`
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const up = await fetch(`${sbBase()}/storage/v1/object/properties/${path}`, {
      method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": type }, body: buf,
    })
    if (!up.ok) return null
    return `${sbBase()}/storage/v1/object/public/properties/${path}`
  } catch { return null }
}

export interface ImportResult { draft: ImportDraft; images: string[]; status: "ready" | "needs_photos" | "needs_translation"; warning?: string }

// ── Hàm chính: link -> bản nháp đầy đủ ──
export async function importFromUrl(url: string, opts: { agentCompany?: string } = {}): Promise<ImportResult> {
  const res = await fetch(url, { headers: UA, redirect: "follow" })
  if (!res.ok) throw new Error(`Không mở được trang (HTTP ${res.status})`)
  const html = await res.text()

  const isYC = /yungching\.com\.tw\/house\//.test(res.url || url)
  const base = isYC ? parseYungching(html, url) : await aiExtractGeneric(htmlToText(html), url)
  if (!base.title_zh || !base.price || !base.city) throw new Error("Không đọc được tiêu đề / giá / địa chỉ từ trang này")
  if (!base.id) base.id = "L" + Date.now().toString().slice(-8)

  const city = base.city!, district = base.district || ""
  let features = base.features?.length ? base.features : splitFeatures(base.rawFeatures || "")
  let title_vi = "", address_vi = "", features_vi: string[] = [], translated = false, warning: string | undefined
  try {
    const tr = await translateDraft({ title_zh: base.title_zh!, address: base.address || "", features }, base.rawFeatures)
    title_vi = tr.title_vi; address_vi = tr.address_vi; features = tr.features; features_vi = tr.features_vi
    translated = !!title_vi
  } catch (e: any) {
    warning = `Chưa dịch được sang tiếng Việt: ${e.message}`
  }

  const geo = await geocode(base.address || `${city}${district}`, city)
  const draft: ImportDraft = {
    ...AGENT_DEFAULTS,
    id: base.id!, title_zh: base.title_zh!, title_vi: title_vi || base.title_zh!,
    city, city_vi: CITY_VI[city] || city, district, district_vi: districtVi(city, district),
    address: base.address || `${city}${district}`, address_vi: address_vi || base.address || "",
    listing_type: base.listing_type || "buy", property_type: base.property_type || "house",
    price: base.price!, price_per_ping: base.price_per_ping ?? null,
    area_ping: base.area_ping || 0, area_main_ping: base.area_main_ping ?? null, area_balcony_ping: base.area_balcony_ping ?? null,
    area_common_ping: base.area_common_ping ?? null, area_land_ping: base.area_land_ping ?? null,
    bedrooms: base.bedrooms ?? 0, bathrooms: base.bathrooms ?? 0,
    floor: base.floor || "", total_floors: base.total_floors || 0, age: base.age ?? 0, facing: "",
    features, features_vi: features_vi.length ? features_vi : features,
    parking: !!base.parking, parking_type: base.parking_type ?? null, community_name: base.community_name ?? null,
    agent_company: base.agent_company || opts.agentCompany || null, agent_developer: null,
    lat: geo?.[0] ?? null, lng: geo?.[1] ?? null,
    source_url: url, cover_image_url: base.cover_image_url ?? null, translated,
  }

  const { images, warning: imgWarn } = await copyListingImages(url, draft.id, draft.cover_image_url)
  if (imgWarn) warning = warning ? `${warning}; ${imgWarn}` : imgWarn
  const status = !translated ? "needs_translation" : images.length < 3 ? "needs_photos" : "ready"
  return { draft, images, status, warning }
}

// Mở trang bằng trình duyệt để lấy ảnh album (tối đa 12), lưu vào Supabase Storage.
// Nếu không mở được trình duyệt thì vẫn giữ ảnh bìa.
export async function copyListingImages(url: string, folder: string, coverUrl?: string | null, max = 12) {
  let srcs: string[] = [], warning: string | undefined
  try {
    const { collectListingImages } = await import("./renderPage")
    srcs = await collectListingImages(url, max)
  } catch (e: any) {
    warning = `Không lấy được album ảnh: ${e.message}`
  }
  if (!srcs.length && coverUrl) srcs = [coverUrl]
  const stamp = Date.now(), images: (string | null)[] = new Array(srcs.length).fill(null)
  for (let i = 0; i < srcs.length; i += 4) {   // tải song song 4 ảnh một lượt
    await Promise.all(srcs.slice(i, i + 4).map(async (s, j) => {
      images[i + j] = await copyImageToStorage(s, folder, `${stamp}-${i + j}`)
    }))
  }
  return { images: images.filter((x): x is string => !!x), warning }
}

// ── Gọi RPC Supabase phía server (anon key + mật khẩu/ token kiểm tra trong hàm SQL) ──
export async function sbRpc<T = unknown>(fn: string, body: Record<string, unknown>): Promise<T> {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const res = await fetch(`${sbBase()}/rest/v1/rpc/${fn}`, {
    method: "POST", cache: "no-store",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try { msg = JSON.parse(text).message || text } catch {}
    throw new Error(msg)
  }
  return (text ? JSON.parse(text) : null) as T
}

export interface QueueRow {
  id: number; source_url: string; status: string; draft: ImportDraft; images: string[]
  priority: number; error: string | null; property_id: string | null; created_at: string; published_at: string | null
}

// Trạng thái tiếp theo sau khi có ảnh / bản dịch
export function nextStatus(draft: Pick<ImportDraft, "translated">, images: string[]) {
  if (!draft.translated) return "needs_translation"
  return images.length >= 3 ? "ready" : "needs_photos"
}

// Dịch lại 1 tin trong hàng đợi (dùng khi lần đầu dịch lỗi, vd hết credit API)
export async function retranslateQueueRow(row: QueueRow, password: string): Promise<QueueRow> {
  const d = row.draft
  const tr = await translateDraft({ title_zh: d.title_zh, address: d.address, features: d.features })
  const patch = { title_vi: tr.title_vi || d.title_vi, address_vi: tr.address_vi || d.address_vi,
    features: tr.features, features_vi: tr.features_vi.length ? tr.features_vi : d.features_vi, translated: !!tr.title_vi }
  return sbRpc<QueueRow>("import_queue_update", {
    p_password: password, p_id: row.id, p_draft_patch: patch,
    p_status: row.status === "needs_translation" ? nextStatus({ translated: patch.translated }, row.images) : null,
  })
}
