// app/api/ai-search/route.ts
// 8386 AI - Trợ lý tìm nhà bằng tiếng Việt (Giai đoạn 2: hội thoại nhiều lượt,
// câu hỏi ngược, bắt buộc/ưu tiên có trọng số, 8386 AI Score, phương án thay thế)
import { NextRequest, NextResponse } from "next/server"
import {
  callClaude, clean, stagedSearch, buildListingsUrl, buildSummary,
  scoreProperty, nextFollowUp, buildBudgetAlternative, type ParsedFilters,
} from "@/lib/aiSearch"

export async function POST(req: NextRequest) {
  try {
    const { message, previousFilters, followUpRound, directFilters } = await req.json() as {
      message?: string
      previousFilters?: ParsedFilters
      followUpRound?: number
      directFilters?: ParsedFilters   // bỏ qua bước gọi Claude — dùng khi bấm lại lịch sử tìm kiếm / phương án thay thế
    }

    let parsed: ParsedFilters
    if (directFilters && Object.keys(directFilters).length > 0) {
      parsed = clean(directFilters)
    } else {
      if (!message?.trim()) {
        return NextResponse.json({ error: "empty_message" }, { status: 400 })
      }
      const raw = await callClaude(message, previousFilters)
      parsed = clean(raw)
    }
    // directFilters nghĩa là đã biết chắc tiêu chí (lịch sử/phương án thay thế) -> không hỏi lại
    const round = directFilters ? 999 : (followUpRound || 0)

    // Câu hỏi ngược (mục 4) — chỉ khi chưa từng hỏi trong hội thoại này
    const followUp = nextFollowUp(parsed, round)
    if (followUp) {
      return NextResponse.json({
        understood: true,
        needsFollowUp: true,
        followUp,
        filters: parsed,
        summary: buildSummary(parsed),
        results: [], totalCount: 0, listingsUrl: "/listings", relaxedSteps: [], alternatives: [],
      })
    }

    const noCriteria = Object.keys(parsed).length === 0
    if (noCriteria) {
      return NextResponse.json({
        understood: false,
        needsFollowUp: false,
        summary: [], results: [], totalCount: 0, listingsUrl: "/listings", relaxedSteps: [], alternatives: [],
      })
    }

    const { results, usedFilters, relaxedSteps } = await stagedSearch(parsed)

    // 8386 AI Score + giải thích "vì sao phù hợp" (mục 9, 10) — tính trên bộ lọc GỐC, không phải bộ đã nới lỏng
    const scored = results
      .map(p => scoreProperty(p, parsed))
      .sort((a, b) => b.score - a.score)

    // Phương án thay thế bổ sung (mục 14): mở ngân sách +30% nếu có set giá
    const budgetAlt = relaxedSteps.length > 0 || results.length === 0
      ? await buildBudgetAlternative(parsed)
      : null
    const alternatives = budgetAlt ? [{ ...budgetAlt, listingsUrl: buildListingsUrl(budgetAlt.filters) }] : []

    return NextResponse.json({
      understood: true,
      needsFollowUp: false,
      filters: parsed,
      summary: buildSummary(parsed),
      usedSummary: relaxedSteps.length ? buildSummary(usedFilters) : undefined,
      results: scored.slice(0, 6),
      totalCount: results.length,
      listingsUrl: buildListingsUrl(relaxedSteps.length ? usedFilters : parsed),
      relaxedSteps,
      alternatives,
    })
  } catch (err: any) {
    console.error("ai-search error:", err)
    return NextResponse.json({ error: err.message || "unknown_error" }, { status: 500 })
  }
}
