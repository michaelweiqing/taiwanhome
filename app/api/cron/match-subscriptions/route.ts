// app/api/cron/match-subscriptions/route.ts
// Giai đoạn 3 (mục 15): chạy định kỳ (Vercel Cron), dò các "nhu cầu đã lưu" (ai_search_subscriptions)
// xem có tin đăng MỚI nào khớp không, nếu có thì báo cho admin (Michael) qua LINE để chủ động liên hệ khách.
// LƯU Ý: gói Vercel Hobby chỉ cho phép Cron chạy tối đa 1 lần/ngày -> đây là bản tin tổng hợp hằng ngày,
// không phải cảnh báo tức thời. Nếu nâng lên Vercel Pro có thể đổi lịch chạy theo giờ trong vercel.json.
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { searchProperties, type Property } from "@/lib/data"
import { toFilterOptions, applyExtras, type ParsedFilters } from "@/lib/aiSearch"

async function notifyAdmin(text: string) {
  const token = process.env.LINE_CHANNEL_TOKEN
  const userId = process.env.LINE_ADMIN_USER_ID
  if (!token || !userId) { console.error("LINE env missing"); return }
  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: userId, messages: [{ type: "text", text }] }),
  }).catch(err => console.error("LINE notify error:", err))
}

interface Subscription {
  id: string
  filters: ParsedFilters
  summary: string | null
  contact_name: string | null
  contact_phone: string
  contact_line: string | null
  last_checked_at: string
}

export async function GET(req: NextRequest) {
  // Xác thực request đến từ Vercel Cron (header do Vercel tự gắn khi có CRON_SECRET trong env)
  const authHeader = req.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  try {
    const { data: subs, error } = await supabase.rpc("get_active_ai_subscriptions")
    if (error) throw new Error(error.message)

    const subscriptions = (subs || []) as Subscription[]
    let notified = 0

    for (const sub of subscriptions) {
      const sinceMs = new Date(sub.last_checked_at).getTime()
      const merged = await searchProperties(toFilterOptions(sub.filters))
      const filtered = applyExtras(merged, sub.filters)
      const freshMatches: Property[] = filtered.filter(p => new Date(p.posted_at).getTime() > sinceMs)

      if (freshMatches.length > 0) {
        const brief = freshMatches.slice(0, 3).map(p =>
          `• ${p.title_vi || p.title_zh} — NT$${Number(p.price).toLocaleString()}${p.listing_type === "rent" ? "/tháng" : " vạn"} — /listings?city=${encodeURIComponent(p.city)}`
        ).join("\n")

        await notifyAdmin(
          `🔔 8386 AI: có ${freshMatches.length} tin mới khớp nhu cầu đã lưu\n` +
          `${sub.summary || "(không rõ tiêu chí cụ thể)"}\n` +
          `📞 ${sub.contact_phone}${sub.contact_line ? `\n💬 LINE: ${sub.contact_line}` : ""}${sub.contact_name ? `\n👤 ${sub.contact_name}` : ""}\n\n` +
          brief
        )
        notified++
      }

      await supabase.rpc("touch_ai_subscription", { p_id: sub.id, p_matched_count: freshMatches.length })
    }

    return NextResponse.json({ ok: true, checked: subscriptions.length, notified })
  } catch (err: any) {
    console.error("cron match-subscriptions error:", err)
    return NextResponse.json({ error: err.message || "unknown_error" }, { status: 500 })
  }
}
