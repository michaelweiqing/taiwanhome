// lib/yungchingPoi.ts
// Lấy "生活機能" (tiện ích xung quanh) của 1 tin trên buy.yungching.com.tw qua API công khai mà chính trang 永慶 dùng:
//   GET https://buy.yungching.com.tw/api/v2/information/poi?id=<mã tin trong URL /house/<id>>
// Trả về các nhóm 交通/學校/政府/醫療/超商/購物/停車場/休閒娛樂, mỗi địa điểm có toạ độ + khoảng cách (mét) tới căn nhà.
// Từ khoảng cách + toạ độ các địa điểm, ta suy ra lại toạ độ tâm (căn nhà) bằng phương pháp bình phương tối thiểu.

export interface PoiItem { n: string; s: string; la: number; ln: number; d: number }
export interface PoiCategory { k: string; items: PoiItem[] }
export interface PoiData { yc_id: string; center: { lat: number; lng: number } | null; categories: PoiCategory[] }

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
  "Accept": "application/json",
  "Accept-Language": "zh-TW,zh;q=0.9",
  "Referer": "https://buy.yungching.com.tw/",
}

// Thứ tự nhóm hiển thị (giống trang 永慶)
const w = (...codes: number[]) => String.fromCharCode(...codes)
const CATEGORY_ORDER = [
  w(0x4ea4, 0x901a),          // 交通
  w(0x5b78, 0x6821),          // 學校
  w(0x653f, 0x5e9c),          // 政府
  w(0x91ab, 0x7642),          // 醫療
  w(0x8d85, 0x5546),          // 超商
  w(0x8cfc, 0x7269),          // 購物
  w(0x505c, 0x8eca, 0x5834),  // 停車場
  w(0x4f11, 0x9592, 0x5a1b, 0x6a02), // 休閒娛樂
]
const MAX_PER_CATEGORY = 40

export function ycIdFromUrl(url: string): string | null {
  return url.match(/\/house\/(\d+)/)?.[1] ?? null
}

// Suy ra toạ độ tâm từ các địa điểm (toạ độ + khoảng cách). Trả null nếu dữ liệu không nhất quán.
export function trilaterate(items: { la: number; ln: number; d: number }[]): { lat: number; lng: number } | null {
  const pts = items.filter(p => Number.isFinite(p.la) && Number.isFinite(p.ln) && Number.isFinite(p.d) && p.d > 0)
  if (pts.length < 4) return null
  const ky = 111320
  let lat = pts.reduce((s, p) => s + p.la, 0) / pts.length
  let lng = pts.reduce((s, p) => s + p.ln, 0) / pts.length
  for (let it = 0; it < 30; it++) {
    const kx = 111320 * Math.cos((lat * Math.PI) / 180)
    let a11 = 0, a12 = 0, a22 = 0, b1 = 0, b2 = 0
    for (const p of pts) {
      const dx = (p.ln - lng) * kx, dy = (p.la - lat) * ky
      const r = Math.hypot(dx, dy) || 1e-6
      const res = r - p.d
      // d(res)/d(lng_m) = -dx/r ; d(res)/d(lat_m) = -dy/r
      const jx = -dx / r, jy = -dy / r
      a11 += jx * jx; a12 += jx * jy; a22 += jy * jy
      b1 += jx * res; b2 += jy * res
    }
    const det = a11 * a22 - a12 * a12
    if (Math.abs(det) < 1e-9) return null
    const sx = -(a22 * b1 - a12 * b2) / det
    const sy = -(-a12 * b1 + a11 * b2) / det
    lng += sx / kx; lat += sy / ky
    if (Math.hypot(sx, sy) < 0.05) break
  }
  const kx = 111320 * Math.cos((lat * Math.PI) / 180)
  const rms = Math.sqrt(pts.reduce((s, p) => s + (Math.hypot((p.ln - lng) * kx, (p.la - lat) * ky) - p.d) ** 2, 0) / pts.length)
  if (!(rms < 40)) return null
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) }
}

export async function fetchYungchingPois(sourceUrl: string, timeoutMs = 20000): Promise<PoiData | null> {
  const id = ycIdFromUrl(sourceUrl)
  if (!id) return null
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetch(`https://buy.yungching.com.tw/api/v2/information/poi?id=${id}`, {
      headers: HEADERS, signal: ctl.signal, cache: "no-store",
    })
    if (!res.ok) return null
    const json = await res.json()
    const pois: any[] = json?.data?.pois
    if (!Array.isArray(pois) || !pois.length) return null

    const categories: PoiCategory[] = []
    for (const p of pois) {
      const items: PoiItem[] = (p.poiDetails ?? [])
        .map((d: any) => ({
          n: String(d.poiTitle ?? "").trim(), s: String(d.poiSubName ?? "").trim(),
          la: Number(d.poiLat), ln: Number(d.poiLng), d: Math.round(Number(d.distance)),
        }))
        .filter((d: PoiItem) => d.n && Number.isFinite(d.la) && Number.isFinite(d.ln) && Number.isFinite(d.d))
        .sort((a: PoiItem, b: PoiItem) => a.d - b.d)
        .slice(0, MAX_PER_CATEGORY)
      if (items.length) categories.push({ k: String(p.poiItem), items })
    }
    if (!categories.length) return null
    categories.sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a.k), ib = CATEGORY_ORDER.indexOf(b.k)
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    })
    const center = trilaterate(categories.flatMap(c => c.items))
    return { yc_id: id, center, categories }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
