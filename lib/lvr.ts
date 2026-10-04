// lib/lvr.ts
// 實價登錄 (giá giao dịch thực tế) — tải dữ liệu mở của 內政部 (plvr.land.moi.gov.tw),
// đọc file CSV trong zip, chuẩn hoá và ghi vào Supabase qua RPC lvr_ingest (có token).
// Dùng chung cho cron /api/cron/lvr-sync và script nạp dữ liệu lần đầu.
import { unzipSync, strFromU8 } from "fflate"

export type LvrKind = "sale" | "presale" | "rent"

export interface LvrRow {
  id: string; kind: LvrKind; city: string; district: string; address: string | null
  deal_date: string; target: string | null; building_type: string | null; main_use: string | null
  floor: string | null; total_floors: number | null; built_year: number | null
  area_m2: number | null; main_area_m2: number | null
  rooms: number | null; halls: number | null; baths: number | null
  has_elevator: boolean | null; has_manager: boolean | null
  total_price: number | null; parking_price: number | null; parking_area_m2: number | null
  unit_ping: number | null; is_special: boolean; note: string | null
  project_name: string | null; rent_type: string | null; furnished: boolean | null
  equipment: string | null; period: string
}

export const LVR_CURRENT_URL = "https://plvr.land.moi.gov.tw/Download?type=zip&fileName=lvr_landcsv.zip"
export const lvrSeasonUrl = (season: string) =>
  `https://plvr.land.moi.gov.tw/DownloadSeason?season=${season}&type=zip&fileName=lvr_landcsv.zip`

// Mã thành phố trong tên file (a_lvr_land_a.csv) -> tên thành phố (dùng chữ 台 như phần còn lại của web)
export const LVR_CITY_CODES: Record<string, string> = {
  a: "台北市", b: "台中市", c: "基隆市", d: "台南市", e: "高雄市", f: "新北市",
  g: "宜蘭縣", h: "桃園市", i: "嘉義市", j: "新竹縣", k: "苗栗縣", m: "南投縣",
  n: "彰化縣", o: "新竹市", p: "雲林縣", q: "嘉義縣", t: "屏東縣", u: "花蓮縣",
  v: "台東縣", w: "金門縣", x: "澎湖縣", z: "連江縣",
}

const KIND_BY_LETTER: Record<string, LvrKind> = { a: "sale", b: "presale", c: "rent" }
const PING = 3.305785

// Giao dịch đặc biệt -> không đưa vào thống kê giá trung vị
const SPECIAL_RE = /親友|員工|共有人|特殊關係|政府機關|急買急賣|債權債務|瑕疵|增建|未登記建物|法拍|毛胚|地上權|受債權|二親等/

// ── CSV parser nhỏ (hỗ trợ dấu ngoặc kép) ──
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], field = "", q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else q = false }
      else field += c
    } else if (c === '"') q = true
    else if (c === ",") { row.push(field); field = "" }
    else if (c === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = "" }
    else field += c
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row) }
  return rows
}

const num = (s?: string) => { if (!s) return null; const n = Number(s.replace(/,/g, "")); return Number.isFinite(n) ? n : null }
const int = (s?: string) => { const n = num(s); return n === null ? null : Math.round(n) }
const yesNo = (s?: string) => (s === "有" ? true : s === "無" ? false : null)
const str = (s?: string) => (s && s.trim() ? s.trim() : null)

// Ngày Dân Quốc "1150904" -> "2026-09-04"
export function rocDate(s?: string): string | null {
  if (!s) return null
  const m = s.trim().match(/^(\d{2,3})(\d{2})(\d{2})$/)
  if (!m) return null
  const y = Number(m[1]) + 1911, mo = Number(m[2]), d = Number(m[3])
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1990) return null
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}
const rocYear = (s?: string) => {
  const m = s?.trim().match(/^(\d{2,3})\d{4}$/)
  if (!m) return null
  const y = Number(m[1]) + 1911
  return y > 1900 && y <= new Date().getFullYear() + 5 ? y : null
}

// Đọc 1 file CSV chính (x_lvr_land_a/b/c.csv) -> danh sách LvrRow
export function parseLvrCsv(fileName: string, text: string, period: string): LvrRow[] {
  const m = fileName.match(/(?:^|\/)([a-z])_lvr_land_([abc])\.csv$/i)
  if (!m) return []
  const city = LVR_CITY_CODES[m[1].toLowerCase()]
  const kind = KIND_BY_LETTER[m[2].toLowerCase()]
  if (!city || !kind) return []

  const rows = parseCsv(text.replace(/^﻿/, ""))
  if (rows.length < 3) return []
  const header = rows[0].map(h => h.trim())
  const idx = (...names: string[]) => { for (const n of names) { const i = header.indexOf(n); if (i >= 0) return i } return -1 }
  const col = {
    district: idx("鄉鎮市區"), target: idx("交易標的"), address: idx("土地位置建物門牌"),
    date: idx("交易年月日", "租賃年月日"), floor: idx("移轉層次", "租賃層次"), totalFloors: idx("總樓層數"),
    btype: idx("建物型態"), use: idx("主要用途"), built: idx("建築完成年月"),
    area: idx("建物移轉總面積平方公尺", "建物總面積平方公尺"), mainArea: idx("主建物面積"),
    rooms: idx("建物現況格局-房"), halls: idx("建物現況格局-廳"), baths: idx("建物現況格局-衛"),
    manager: idx("有無管理組織"), elevator: idx("電梯", "有無電梯"),
    total: idx("總價元", "總額元"), pArea: idx("車位移轉總面積平方公尺", "車位面積平方公尺"),
    pPrice: idx("車位總價元", "車位總額元"), note: idx("備註"), id: idx("編號"),
    project: idx("建案名稱"), rentType: idx("出租型態"), furniture: idx("有無附傢俱"), equip: idx("附屬設備"),
  }
  const g = (r: string[], i: number) => (i >= 0 ? r[i] : undefined)

  const out: LvrRow[] = []
  for (const r of rows.slice(2)) {          // dòng 0: tiêu đề Trung, dòng 1: tiêu đề Anh
    if (r.length < 10) continue
    const id = str(g(r, col.id)); const deal = rocDate(g(r, col.date)); const district = str(g(r, col.district))
    const target = str(g(r, col.target)) || ""
    if (!id || !deal || !district) continue
    // Chỉ lấy giao dịch có nhà (bỏ đất trống, chỗ đậu xe lẻ)
    if (kind === "sale" && !/建物/.test(target)) continue
    if (kind === "rent" && !/房屋/.test(target)) continue

    const area = num(g(r, col.area)); const total = num(g(r, col.total))
    const pArea = num(g(r, col.pArea)) || 0; const pPrice = num(g(r, col.pPrice)) || 0
    let unit: number | null = null
    if (area && area > 0 && total && total > 0) {
      if (kind === "rent") {
        unit = total / (area / PING)                                   // 元/坪/tháng
        if (unit > 20000) unit = null
      } else {
        const netArea = pArea > 0 && area - pArea > 0 ? area - pArea : area
        const netPrice = pPrice > 0 && total - pPrice > 0 ? total - pPrice : total
        unit = netPrice / (netArea / PING) / 10000                       // 萬/坪
        if (unit > 2000) unit = null
      }
    }
    const note = str(g(r, col.note))
    out.push({
      id, kind, city, district, address: str(g(r, col.address)), deal_date: deal, target: target || null,
      building_type: str(g(r, col.btype)), main_use: str(g(r, col.use)), floor: str(g(r, col.floor)),
      total_floors: int(g(r, col.totalFloors)), built_year: rocYear(g(r, col.built)),
      area_m2: area, main_area_m2: num(g(r, col.mainArea)),
      rooms: int(g(r, col.rooms)), halls: int(g(r, col.halls)), baths: int(g(r, col.baths)),
      has_elevator: yesNo(g(r, col.elevator)), has_manager: yesNo(g(r, col.manager)),
      total_price: total, parking_price: pPrice || null, parking_area_m2: pArea || null,
      unit_ping: unit === null ? null : Math.round(unit * 100) / 100,
      is_special: !!note && SPECIAL_RE.test(note), note,
      project_name: str(g(r, col.project)), rent_type: str(g(r, col.rentType)),
      furnished: yesNo(g(r, col.furniture)), equipment: str(g(r, col.equip)), period,
    })
  }
  return out
}

// ── Tải zip và giải nén các file CSV chính ──
export async function downloadLvrZip(url: string): Promise<{ files: Record<string, string>; period: string } | null> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (8386.tw lvr-sync)" }, cache: "no-store" })
  if (!res.ok) throw new Error(`download ${res.status}`)
  const buf = new Uint8Array(await res.arrayBuffer())
  // Nếu kỳ dữ liệu chưa phát hành, server trả trang HTML thay vì zip (chữ ký zip = "PK")
  if (buf.length < 4 || buf[0] !== 0x50 || buf[1] !== 0x4b) return null
  const unz = unzipSync(buf, { filter: f => /(^|\/)[a-z]_lvr_land_[abc]\.csv$/i.test(f.name) || /build_time\.xml$/i.test(f.name) })
  const files: Record<string, string> = {}
  let period = ""
  for (const [name, data] of Object.entries(unz)) {
    const text = strFromU8(data)
    if (/build_time\.xml$/i.test(name)) period = (text.match(/<lvr_time>([\s\S]*?)<\/lvr_time>/)?.[1] || "").trim()
    else files[name] = text
  }
  return { files, period }
}

// ── Gọi RPC Supabase bằng fetch (không phụ thuộc alias @/ để script node dùng được) ──
// Lưu ý: biến môi trường có thể chứa sẵn "/rest/v1/" ở cuối -> chuẩn hoá về gốc
const sbUrl = () => (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "")

async function rpc<T = unknown>(fn: string, body: Record<string, unknown>): Promise<T> {
  const url = sbUrl(), key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("missing supabase env")
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body), cache: "no-store",
  })
  if (!res.ok) throw new Error(`rpc ${fn} ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const t = await res.text()
  return (t ? JSON.parse(t) : null) as T
}

async function alreadyImported(period: string): Promise<boolean> {
  const url = sbUrl(), key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const res = await fetch(`${url}/rest/v1/lvr_sync_log?select=period&period=eq.${encodeURIComponent(period)}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store",
  })
  if (!res.ok) return false
  return ((await res.json()) as unknown[]).length > 0
}

export interface LvrSyncResult { source: string; period: string; skipped?: string; parsed: number; written: number; byKind: Record<string, number> }

// Nhập 1 nguồn (kỳ hiện tại hoặc 1 quý). force=true để nhập lại dù đã có trong log.
export async function syncLvr(opts: { season?: string; force?: boolean; token: string }): Promise<LvrSyncResult> {
  const source = opts.season ? `season:${opts.season}` : "current"
  const zip = await downloadLvrZip(opts.season ? lvrSeasonUrl(opts.season) : LVR_CURRENT_URL)
  if (!zip) return { source, period: "", skipped: "not_published", parsed: 0, written: 0, byKind: {} }

  const period = opts.season ? `season:${opts.season}` : `current:${zip.period}`
  if (!opts.force && (await alreadyImported(period))) {
    return { source, period, skipped: "already_imported", parsed: 0, written: 0, byKind: {} }
  }

  const all: LvrRow[] = []
  for (const [name, text] of Object.entries(zip.files)) all.push(...parseLvrCsv(name, text, period))
  // bỏ trùng id trong cùng 1 lần nhập (ON CONFLICT không xử lý được 2 dòng cùng id trong 1 câu lệnh)
  const uniq = Array.from(new Map(all.map(r => [r.id, r])).values())

  const byKind: Record<string, number> = {}
  for (const r of uniq) byKind[r.kind] = (byKind[r.kind] || 0) + 1

  let written = 0
  const BATCH = 1000
  for (let i = 0; i < uniq.length; i += BATCH) {
    written += (await rpc<number>("lvr_ingest", { p_token: opts.token, p_rows: uniq.slice(i, i + BATCH) })) || 0
  }
  await rpc("lvr_log", { p_token: opts.token, p_period: period, p_rows: written, p_info: zip.period || opts.season || "" })
  return { source, period, parsed: uniq.length, written, byKind }
}

// Quý gần nhất có thể đã phát hành (vd hôm nay 2026-10 -> thử 115S3, 115S2)
export function recentSeasons(now = new Date(), count = 2): string[] {
  const out: string[] = []
  let y = now.getFullYear() - 1911, q = Math.floor(now.getMonth() / 3) // quý trước quý hiện tại
  for (let i = 0; i < count; i++) {
    if (q === 0) { y -= 1; q = 4 }
    out.push(`${y}S${q}`)
    q -= 1
  }
  return out
}
