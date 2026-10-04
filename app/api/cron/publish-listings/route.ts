// app/api/cron/publish-listings/route.ts
// Vercel Cron mỗi sáng: lấy các tin trong hàng đợi (/admin/dang-tin) và đăng lên web,
// số tin mỗi ngày theo cài đặt (mặc định 2). Tin chưa dịch sẽ được dịch lại trước khi đăng.
// Gửi tóm tắt cho admin qua LINE.
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { sbRpc, retranslateQueueRow, type QueueRow } from "@/lib/listingImport"

export const maxDuration = 120
export const dynamic = "force-dynamic"

async function notifyAdmin(text: string) {
  const token = process.env.LINE_CHANNEL_TOKEN, userId = process.env.LINE_ADMIN_USER_ID
  if (!token || !userId) return
  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: userId, messages: [{ type: "text", text }] }),
  }).catch(err => console.error("LINE notify error:", err))
}

export async function GET(req: NextRequest) {
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const token = process.env.LVR_INGEST_TOKEN // token máy chủ, được hàm SQL import_auth chấp nhận
  if (!token) return NextResponse.json({ error: "LVR_INGEST_TOKEN missing" }, { status: 500 })

  const published: string[] = [], problems: string[] = []
  try {
    const batch = await sbRpc<QueueRow[]>("import_next_batch", { p_password: token })
    for (let row of batch) {
      try {
        if (!row.draft?.translated) {
          row = await retranslateQueueRow(row, token)
          if (!row.draft?.translated) { problems.push(`#${row.id} chưa dịch được`); continue }
        }
        if (!row.images?.length) { problems.push(`#${row.id} chưa có ảnh`); continue }
        const pid = await sbRpc<string>("import_publish", { p_password: token, p_id: row.id })
        published.push(`• ${row.draft.title_vi || row.draft.title_zh}\n  https://8386.tw/listings/${pid}`)
      } catch (e: any) {
        problems.push(`#${row.id} ${row.draft?.title_zh || row.source_url}: ${e.message}`)
      }
    }
    if (published.length) { revalidatePath("/"); revalidatePath("/listings") }

    const waiting = await sbRpc<QueueRow[]>("import_queue_list", { p_password: token, p_status: "active" })
    const needPhotos = waiting.filter(r => r.status === "needs_photos").length
    const ready = waiting.filter(r => r.status === "ready").length
    if (published.length || problems.length || needPhotos) {
      await notifyAdmin(
        `🏠 8386 tự đăng tin hôm nay: ${published.length} căn\n` +
        (published.length ? published.join("\n") + "\n" : "") +
        (problems.length ? `\n⚠️ Lỗi:\n${problems.join("\n")}\n` : "") +
        `\n📋 Hàng đợi: ${ready} sẵn sàng · ${needPhotos} cần thêm ảnh\nhttps://8386.tw/admin/dang-tin`
      )
    }
    return NextResponse.json({ ok: true, published: published.length, problems })
  } catch (err: any) {
    console.error("cron publish-listings error:", err)
    return NextResponse.json({ error: err.message || "unknown_error" }, { status: 500 })
  }
}
