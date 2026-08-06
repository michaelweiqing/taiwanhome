// app/api/ai-search/subscribe/route.ts
// Giai đoạn 3 (mục 15): khách bấm "🔔 Theo dõi nhu cầu này" khi AI chưa tìm ra nhà ưng ý.
// Lưu tiêu chí vào Supabase + báo ngay cho admin (Michael) qua LINE để chủ động liên hệ khách,
// đồng thời cron job hằng ngày sẽ tự dò tin đăng mới khớp tiêu chí và báo tiếp (xem app/api/cron/match-subscriptions).
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { buildSummary, type ParsedFilters } from "@/lib/aiSearch"

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

export async function POST(req: NextRequest) {
  try {
    const { filters, contactPhone, contactLine, contactName } = await req.json() as {
      filters?: ParsedFilters
      contactPhone?: string
      contactLine?: string
      contactName?: string
    }
    if (!filters || Object.keys(filters).length === 0) {
      return NextResponse.json({ error: "missing_filters" }, { status: 400 })
    }
    if (!contactPhone?.trim()) {
      return NextResponse.json({ error: "missing_phone" }, { status: 400 })
    }

    const summaryChips = buildSummary(filters)
    const summaryText = summaryChips.join(" | ")

    const { data, error } = await supabase.rpc("insert_ai_search_subscription", {
      p_filters: filters,
      p_summary: summaryText,
      p_contact_phone: contactPhone.trim(),
      p_contact_line: contactLine?.trim() || null,
      p_contact_name: contactName?.trim() || null,
    })
    if (error) throw new Error(error.message)

    await notifyAdmin(
      `🔔 8386 AI: khách đang cần tìm nhà nhưng chưa có tin phù hợp\n` +
      `${summaryText || "(không rõ tiêu chí cụ thể)"}\n` +
      `📞 ${contactPhone}${contactLine ? `\n💬 LINE: ${contactLine}` : ""}${contactName ? `\n👤 ${contactName}` : ""}\n` +
      `Hệ thống sẽ tự báo tiếp khi có tin mới khớp tiêu chí này.`
    )

    return NextResponse.json({ ok: true, id: data })
  } catch (err: any) {
    console.error("ai-search subscribe error:", err)
    return NextResponse.json({ error: err.message || "unknown_error" }, { status: 500 })
  }
}
