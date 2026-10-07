// app/api/admin/import-link/route.ts
// Trang admin /admin/dang-tin gọi API này:
//   { password, url }                 -> đọc link, tạo bản nháp, thêm vào hàng đợi đăng tin
//   { password, id, action: "translate" } -> dịch lại sang tiếng Việt 1 tin trong hàng đợi
import { NextRequest, NextResponse } from "next/server"
import { importFromUrl, retranslateQueueRow, copyListingImages, nextStatus, sbRpc, type QueueRow } from "@/lib/listingImport"

export const maxDuration = 120
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { password, url, id, action } = await req.json()
    if (!password) return NextResponse.json({ error: "missing_password" }, { status: 401 })
    // Kiểm tra mật khẩu (hàm SQL báo lỗi invalid_password nếu sai)
    await sbRpc("import_settings_get", { p_password: password })

    if ((action === "translate" || action === "photos") && id) {
      const rows = await sbRpc<QueueRow[]>("import_queue_list", { p_password: password, p_status: "all" })
      const row = rows.find(r => r.id === Number(id))
      if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 })
      if (action === "translate") return NextResponse.json({ row: await retranslateQueueRow(row, password) })

      // Lấy album ảnh từ link gốc (giữ lại ảnh admin đã tự tải lên, bỏ ảnh bìa tự động cũ)
      const { images: album, warning } = await copyListingImages(row.source_url, row.draft?.id || String(row.id), row.draft?.cover_image_url)
      // Giữ ảnh admin tự tải lên (tên "user-...") và ảnh ngoài thư mục import; thay toàn bộ ảnh tự động cũ bằng album mới
      // Nếu không lấy được album (trang nguồn chặn / chỉ có ảnh bìa) thì giữ nguyên ảnh cũ
      if (album.length <= 1 && row.images.length > 1) {
        return NextResponse.json({ row, warning: warning || "Không lấy được album ảnh từ link, giữ nguyên ảnh cũ", added: 0 })
      }
      const own = row.images.filter(u => /\/user-/.test(u) || !/\/import\//.test(u))
      const images = [...album, ...own.filter(u => !album.includes(u))]
      const updated = await sbRpc<QueueRow>("import_queue_update", {
        p_password: password, p_id: row.id, p_images: images,
        p_status: row.status === "published" ? null : nextStatus(row.draft, images),
      })
      return NextResponse.json({ row: updated, warning, added: album.length })
    }

    const clean = String(url || "").trim()
    if (!/^https?:\/\//.test(clean)) return NextResponse.json({ error: "Link không hợp lệ" }, { status: 400 })

    try {
      const r = await importFromUrl(clean)
      // Kiểm tra trùng: cùng đường + diện tích + tầng + số phòng + giá với tin đã đăng hoặc tin đang chờ
      const dups = await sbRpc<{ kind: string; ref_id: string; title: string; price: number; link: string }[]>(
        "import_dup_candidates", { p_password: password, p_draft: r.draft, p_queue_id: null })
      let status: string = r.status, warning = r.warning
      if (dups.length) {
        status = "duplicate"
        const desc = dups.map(d => d.kind === "property" ? `tin đã đăng 編號 ${d.ref_id} (${d.title})` : `tin đang chờ #${d.ref_id} (${d.title})`).join("; ")
        warning = `⚠️ Nhà này đã có: ${desc}`
      }
      const row = await sbRpc<QueueRow>("import_queue_add", {
        p_password: password, p_url: clean, p_draft: r.draft, p_images: r.images, p_status: status, p_error: warning || null,
      })
      return NextResponse.json({ row, warning, duplicate: dups.length > 0 })
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
