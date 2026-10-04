// app/api/cron/lvr-sync/route.ts
// Đồng bộ 實價登錄 (giá giao dịch thực tế) từ dữ liệu mở của 內政部 vào Supabase.
// Vercel Cron gọi mỗi ngày (giờ UTC trong vercel.json):
//   /api/cron/lvr-sync               -> kỳ mới nhất (Bộ Nội chính phát hành ngày 1, 11, 21 hằng tháng)
//   /api/cron/lvr-sync?mode=season   -> dữ liệu theo quý (bù đủ các ngày còn thiếu khi quý mới phát hành)
// Gọi tay: /api/cron/lvr-sync?season=115S2&force=1 (header Authorization: Bearer <CRON_SECRET> nếu đã đặt)
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { syncLvr, recentSeasons, type LvrSyncResult } from "@/lib/lvr"

export const maxDuration = 300
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const token = process.env.LVR_INGEST_TOKEN
  if (!token) return NextResponse.json({ error: "LVR_INGEST_TOKEN missing" }, { status: 500 })

  const sp = req.nextUrl.searchParams
  const force = sp.get("force") === "1"
  const results: LvrSyncResult[] = []
  try {
    const season = sp.get("season")
    if (season && /^\d{3}S[1-4]$/.test(season)) {
      results.push(await syncLvr({ season, force, token }))
    } else if (sp.get("mode") === "season") {
      for (const s of recentSeasons()) {
        const r = await syncLvr({ season: s, force, token })
        results.push(r)
        if (r.written > 0) break // mỗi lần chạy chỉ nhập tối đa 1 quý để không quá thời gian
      }
    } else {
      results.push(await syncLvr({ force, token }))
    }
    if (results.some(r => r.written > 0)) revalidatePath("/gia-thi-truong")
    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    console.error("cron lvr-sync error:", err)
    return NextResponse.json({ error: err.message || "unknown_error", results }, { status: 500 })
  }
}
