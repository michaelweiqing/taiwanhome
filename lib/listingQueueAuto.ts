// lib/listingQueueAuto.ts — tự xử lý các tin "Trùng lặp" đứng riêng lẻ trong hàng đợi.
// Tin trùng mà các tin trùng với nó vẫn còn trong hàng đợi (đang chờ / thiếu ảnh / lỗi / cũng báo trùng)
// nằm trong khung so sánh → để admin tự chọn. Còn lại (tin kia đã đăng, đã bỏ…) → tự bấm "Không trùng"
// và cho vào danh sách chờ đăng.
import { sbRpc, nextStatus, type QueueRow } from "@/lib/listingImport"

export async function autoClearStandaloneDuplicates(token: string): Promise<number> {
  const dups = await sbRpc<QueueRow[]>("import_queue_list", { p_password: token, p_status: "duplicate" })
  // Chỉ xử lý tin báo trùng với "tin đang chờ" khác; trùng với tin ĐÃ ĐĂNG trên web thì để admin quyết (Thay thế / Bỏ)
  const cand = dups.filter(r => r.error && /tin đang chờ/.test(r.error) && !/tin đã đăng/.test(r.error))
  if (!cand.length) return 0

  const pending = new Set<number>(dups.map(r => r.id))
  for (const st of ["ready", "needs_photos", "needs_translation", "error"]) {
    const rows = await sbRpc<QueueRow[]>("import_queue_list", { p_password: token, p_status: st })
    rows.forEach(r => pending.add(r.id))
  }

  let cleared = 0
  for (const r of cand) {
    const refs = [...(r.error || "").matchAll(/tin đang chờ #(\d+)/g)].map(m => Number(m[1]))
    if (refs.some(id => id !== r.id && pending.has(id))) continue   // còn tin trùng trong hàng đợi → khung so sánh, để admin chọn
    await sbRpc("import_queue_update", {
      p_password: token, p_id: r.id, p_draft_patch: { dup_ok: true }, p_images: null,
      p_status: nextStatus(r.draft, r.images), p_priority: null,
    })
    cleared++
  }
  return cleared
}
