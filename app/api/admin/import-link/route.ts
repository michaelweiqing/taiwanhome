// app/api/admin/import-link/route.ts
// Trang admin /admin/dang-tin gọi API này:
//   { password, url }                 -> đọc link, tạo bản nháp, thêm vào hàng đợi đăng tin
//   { password, id, action: "translate" } -> dịch lại sang tiếng Việt 1 tin trong hàng đợi
import { NextRequest, NextResponse } from "next/server"
import { importFromUrl, retranslateQueueRow, sbRpc, type QueueRow } from "@/lib/listingImport"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { password, url, id, action } = await req.json()
    if (!password) return NextResponse.json({ error: "missing_password" }, { status: 401 })
    // Kiểm tra mật khẩu (hàm SQL báo lỗi invalid_password nếu sai)
    await sbRpc("import_settings_get", { p_password: password })

    if (action === "translate" && id) {
      const rows = await sbRpc<QueueRow[]>("import_queue_list", { p_password: password, p_status: "all" })
      const row = rows.find(r => r.id === Number(id))
      if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 })
      return NextResponse.json({ row: await retranslateQueueRow(row, password) })
    }

    const clean = String(url || "").trim()
    if (!/^https?:\/\//.test(clean)) return NextResponse.json({ error: "Link không hợp lệ" }, { status: 400 })

    try {
      const r = await importFromUrl(clean)
      const row = await sbRpc<QueueRow>("import_queue_add", {
        p_password: password, p_url: clean, p_draft: r.draft, p_images: r.images, p_status: r.status, p_error: r.warning || null,
      })
      return NextResponse.json({ row, warning: r.warning })
    } catch (e: any) {
      const row = await sbRpc<QueueRow>("import_queue_add", {
        p_password: password, p_url: clean, p_draft: {}, p_images: [], p_status: "error", p_error: e.message || "unknown_error",
      })
      return NextResponse.json({ row, error: e.message }, { status: 200 })
    }
  } catch (err: any) {
    const status = /invalid_password/.test(err.message) ? 401 : 500
    return NextResponse.json({ error: err.message || "unknown_error" }, { status })
  }
}
