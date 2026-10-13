// app/api/cron/sync-yungching/route.ts
// Vercel Cron mỗi ngày: kiểm tra các tin đã đăng có nguồn từ 永慶. Tin nào 永慶 đã gỡ (404 + tiêu đề báo lỗi)
// thì chuyển sang status 'removed' trên website. Có nhiều lớp an toàn (xem hằng số bên dưới).
//   ?dry=1   chỉ kiểm tra, không gỡ gì
//   ?force=1 bỏ qua chốt chặn "gỡ hàng loạt bất thường"
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { sbRpc } from "@/lib/listingImport"
import { checkYungchingUrl, sleep, mapLimit, type YcResult } from "@/lib/yungchingCheck"

export const maxDuration = 300
export const dynamic = "force-dynamic"

const MAX_REMOVE_PER_RUN = 40
const SUSPICIOUS_MIN = 10
const SUSPICIOUS_RATIO = 0.5

interface Candidate { queue_id: number | string; source_url: string; property_id: string; title_zh: string | null; title_vi: string | null }

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
  const token = process.env.LVR_INGEST_TOKEN
  if (!token) return NextResponse.json({ error: "LVR_INGEST_TOKEN missing" }, { status: 500 })
  const dry = req.nextUrl.searchParams.get("dry") === "1"
  const force = req.nextUrl.searchParams.get("force") === "1"

  try {
    const cands = await sbRpc<Candidate[]>("import_sync_candidates", { p_password: token })
    const results = new Map<string, YcResult>()
    await mapLimit(cands, 3, async c => {
      results.set(String(c.queue_id), await checkYungchingUrl(c.source_url))
      await sleep(250)
    })

    const live = cands.filter(c => results.get(String(c.queue_id))?.state === "live")
    let gone = cands.filter(c => results.get(String(c.queue_id))?.state === "gone")
    const unknown = cands.filter(c => results.get(String(c.queue_id))?.state === "unknown")

    // Ghi kết quả kiểm tra (để trang admin hiển thị)
    if (!dry) {
      await sbRpc("import_sync_record", {
        p_password: token,
        p_results: cands.map(c => ({ id: Number(c.queue_id), result: results.get(String(c.queue_id))?.state ?? "unknown" })),
      }).catch(e => console.error("sync_record error:", e))
    }

    // Xác nhận lần 2 cho các tin nghi đã gỡ
    if (gone.length) {
      await sleep(3000)
      const again: Candidate[] = []
      await mapLimit(gone, 3, async c => {
        const r = await checkYungchingUrl(c.source_url)
        if (r.state === "gone") again.push(c)
        await sleep(250)
      })
      gone = again
    }

    // Chốt chặn bất thường
    let aborted: string | null = null
    if (gone.length && live.length === 0) aborted = "không có trang nào còn sống — có thể 永慶 đang chặn"
    else if (!force && gone.length >= SUSPICIOUS_MIN && gone.length / cands.length > SUSPICIOUS_RATIO)
      aborted = `quá nhiều tin biến mất cùng lúc (${gone.length}/${cands.length})`

    let removed: string[] = []
    if (!dry && !aborted && gone.length) {
      const batch = gone.slice(0, MAX_REMOVE_PER_RUN)
      removed = await sbRpc<string[]>("import_sync_remove", {
        p_password: token,
        p_ids: batch.map(c => c.property_id),
        p_reason: "yungching_gone",
      })
      if (removed.length) {
        revalidatePath("/")
        revalidatePath("/listings")
        for (const id of removed) revalidatePath(`/listings/${id}`)
      }
    }

    const removedSet = new Set(removed)
    const removedItems = gone.filter(c => removedSet.has(c.property_id))
    if (removedItems.length || aborted) {
      await notifyAdmin(
        (removedItems.length
          ? `🗑️ 8386 đã gỡ ${removedItems.length} tin vì 永慶 không còn rao:\n` +
            removedItems.map(c => `• ${c.title_vi || c.title_zh || c.property_id}\n  https://8386.tw/listings/${c.property_id}`).join("\n") + "\n"
          : "") +
        (aborted ? `\n⚠️ Dừng gỡ tin: ${aborted}\n` : "") +
        `\nQuản lý / đăng lại: https://8386.tw/admin/quan-ly-tin`
      )
    }

    return NextResponse.json({
      ok: true, dry, checked: cands.length, live: live.length, gone: gone.length,
      unknown: unknown.length, removed: removed.length, aborted,
    })
  } catch (err: any) {
    console.error("cron sync-yungching error:", err)
    return NextResponse.json({ error: err.message || "unknown_error" }, { status: 500 })
  }
}
