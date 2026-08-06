"use client"
// components/AiSearchBox.tsx
// 8386 AI — Trợ lý tìm nhà bằng tiếng Việt (giao diện, Giai đoạn 1)
import { useState } from "react"
import Link from "next/link"
import { Sparkles, Loader2, ArrowRight } from "lucide-react"
import type { Property } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import PropertyCard from "@/components/PropertyCard"

interface AiSearchResponse {
  understood: boolean
  summary: string[]
  usedSummary?: string[]
  results: Property[]
  totalCount: number
  listingsUrl: string
  relaxedSteps: string[]
  error?: string
}

const EXAMPLES = [
  "Tôi cần thuê nhà ở Đài Trung, khoảng 10 nghìn, 2 phòng ngủ, có chỗ đậu xe",
  "Mua nhà ở Đài Bắc dưới 1000 vạn, gần MRT",
  "Phòng trọ giá rẻ gần chỗ làm, có máy giặt",
  "Nhà 3 phòng ngủ ở Nam Đồn, Đài Trung, cho nuôi thú cưng",
]

export default function AiSearchBox() {
  const { lang } = useLang()
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [resp, setResp] = useState<AiSearchResponse | null>(null)
  const [error, setError] = useState(false)

  async function runSearch(text?: string) {
    const message = (text ?? q).trim()
    if (!message || loading) return
    setQ(message)
    setLoading(true)
    setError(false)
    setResp(null)
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const data: AiSearchResponse = await res.json()
      if (!res.ok || data.error) { setError(true) } else { setResp(data) }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center shrink-0">
            <Sparkles size={14} strokeWidth={2.4} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">
            {lang === "zh" ? "8386 AI — 找房助手" : "8386 AI — Trợ lý tìm nhà"}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3 pl-9">
          {lang === "zh" ? "不知道怎麼篩選？直接用越南文說出您的需求。" : "Không biết phải lọc nhà thế nào? Cứ nói nhu cầu của bạn bằng tiếng Việt."}
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runSearch() } }}
            rows={2}
            placeholder="Tôi cần thuê nhà ở Đài Trung, khoảng 15 nghìn, 2 phòng ngủ, có chỗ để xe và gần MRT."
            className="flex-1 resize-none text-sm outline-none text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:border-red-400"
          />
          <button
            onClick={() => runSearch()}
            disabled={loading || !q.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 flex items-center justify-center gap-1.5 sm:min-w-[120px]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={15} strokeWidth={2.2} />}
            {loading ? "Đang tìm..." : "Tìm nhà bằng AI"}
          </button>
        </div>

        {!resp && !loading && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => runSearch(ex)}
                className="text-xs bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100 transition text-left"
              >
                💬 {ex}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-3 text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">
            Có lỗi khi tìm nhà, bạn thử lại giúp mình nhé, hoặc dùng bộ lọc phía trên.
          </div>
        )}

        {resp && !resp.understood && (
          <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
            Mình chưa hiểu rõ nhu cầu tìm nhà của bạn 🤔 Bạn thử mô tả cụ thể hơn nhé, ví dụ: khu vực, ngân sách, số phòng ngủ...
          </div>
        )}

        {resp && resp.understood && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <div className="text-xs font-semibold text-gray-400 mb-1.5">🎯 Mình đã hiểu nhu cầu của bạn:</div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {resp.summary.map((c, i) => (
                <span key={i} className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">{c}</span>
              ))}
            </div>

            {resp.relaxedSteps.length > 0 && (
              <div className="text-xs text-orange-600 bg-orange-50 rounded-xl px-3 py-2 mb-3">
                Hiện chưa có căn nào đáp ứng đầy đủ 100% yêu cầu. Mình đã {resp.relaxedSteps.join(", ")} để tìm ra {resp.totalCount} căn gần đúng nhất bên dưới.
              </div>
            )}

            {resp.results.length === 0 ? (
              <div className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                Hiện tại 8386 chưa có căn nào phù hợp. Bạn thử nới ngân sách hoặc đổi khu vực xem sao, hoặc liên hệ trực tiếp để được tư vấn tìm nhà nhé.
              </div>
            ) : (
              <>
                <div className="text-xs font-semibold text-gray-400 mb-2">
                  ✨ AI tìm thấy {resp.totalCount} căn phù hợp{resp.results.length < resp.totalCount ? `, xem trước ${resp.results.length} căn` : ""}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resp.results.map(p => <PropertyCard key={p.id} property={p} />)}
                </div>
              </>
            )}

            <Link
              href={resp.listingsUrl}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Xem tất cả {resp.totalCount} căn phù hợp <ArrowRight size={14} strokeWidth={2.4} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
