// lib/poiSync.ts
// Đồng bộ "tiện ích xung quanh" (生活機能) từ 永慶 vào bảng property_pois.
// Mọi hàm đều không ném lỗi ra ngoài: nếu bảng/hàm SQL chưa được tạo hoặc 永慶 từ chối, chỉ trả về số lượng 0.
import { sbRpc } from "@/lib/listingImport"
import { fetchYungchingPois } from "@/lib/yungchingPoi"
import { sleep } from "@/lib/yungchingCheck"

// Lấy & lưu tiện ích cho 1 tin (dùng ngay sau khi đăng tin mới). `password` = token máy chủ hoặc mật khẩu admin.
export async function refreshPoisFor(password: string, propertyId: string, sourceUrl: string): Promise<boolean> {
  try {
    const data = await fetchYungchingPois(sourceUrl)
    if (!data) return false
    return !!(await sbRpc<boolean>("import_poi_upsert", { p_password: password, p_property_id: propertyId, p_data: data }))
  } catch (e) {
    console.error("refreshPoisFor error:", propertyId, e)
    return false
  }
}

// Bù dữ liệu cho các tin 永慶 đang đăng mà chưa có (hoặc quá 60 ngày) tiện ích xung quanh.
export async function backfillPois(password: string, limit = 30): Promise<{ ids: string[]; failed: number; remaining: boolean }> {
  const ids: string[] = []
  let failed = 0
  let cands: { property_id: string; source_url: string }[] = []
  try {
    cands = await sbRpc<{ property_id: string; source_url: string }[]>("import_poi_candidates", { p_password: password, p_limit: limit })
  } catch (e) {
    console.error("import_poi_candidates error:", e)
    return { ids, failed, remaining: false }
  }
  for (const c of cands) {
    if (await refreshPoisFor(password, c.property_id, c.source_url)) ids.push(c.property_id)
    else failed++
    await sleep(300)
  }
  return { ids, failed, remaining: cands.length >= limit }
}
