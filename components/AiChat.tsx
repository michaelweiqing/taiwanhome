"use client"
// components/AiChat.tsx
// Lõi hội thoại 8386 AI (Giai đoạn 2-3) — dùng chung cho AiSearchBox (trang chủ)
// và AiChatWidget (nút nổi mobile). Giữ state hội thoại nhiều lượt, câu hỏi ngược,
// điểm phù hợp, phương án thay thế, và lưu nhu cầu (subscribe) khi chưa có nhà ưng ý.
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Sparkles, Loader2, ArrowRight, Bell, Send } from "lucide-react"
import type { Property } from "@/lib/data"
import type { ParsedFilters } from "@/lib/aiSearch"
import AiResultCard from "@/components/AiResultCard"

interface ScoredProperty { property: Property; score: number; checklist: { label: string; met: boolean; soft: boolean }[] }
interface Alternative { label: string; count: number; filters: ParsedFilters; listingsUrl: string }

type ChatMsg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "ai"; kind: "error" }
  | { id: string; role: "ai"; kind: "notUnderstood" }
  | { id: string; role: "ai"; kind: "followup"; question: string; options: string[] }
  | { id: string; role: "ai"; kind: "subscribed" }
  | {
      id: string; role: "ai"; kind: "results"
      summary: string[]; usedSummary?: string[]; relaxedSteps: string[]
      results: ScoredProperty[]; totalCount: number; listingsUrl: string
      alternatives: Alternative[]; filters: ParsedFilters
    }

const EXAMPLES = [
  "Tôi cần thuê nhà ở Đài Trung, khoảng 15 nghìn, 2 phòng ngủ, có chỗ để xe và gần MRT",
  "Mua nhà ở Đài Bắc dưới 1000 vạn, gần MRT",
  "Phòng trọ giá rẻ gần chỗ làm, có máy giặt",
  "Nhà 3 phòng ngủ ở Nam Đồn, Đài Trung, cho nuôi thú cưng, ưu tiên có thang máy",
]

const HISTORY_KEY = "taiwanhome_ai_search_history"

interface HistoryEntry { summary: string[]; filters: ParsedFilters; ts: number }

function saveHistory(summary: string[], filters: ParsedFilters) {
  if (!summary.length) return
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const list: HistoryEntry[] = raw ? JSON.parse(raw) : []
    const key = summary.join("|")
    const dedup = list.filter(h => h.summary.join("|") !== key)
    dedup.unshift({ summary, filters, ts: Date.now() })
    localStorage.setItem(HISTORY_KEY, JSON.stringify(dedup.slice(0, 5)))
  } catch {}
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export default function AiChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(false)
  const [previousFilters, setPreviousFilters] = useState<ParsedFilters | undefined>(undefined)
  const [followUpRound, setFollowUpRound] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [subscribeFor, setSubscribeFor] = useState<Alternative["filters"] | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setHistory(loadHistory()) }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

  function uid() { return Math.random().toString(36).slice(2) }

  async function runSearch(text?: string) {
    const message = (text ?? q).trim()
    if (!message || loading) return
    setQ("")
    setMessages(m => [...m, { id: uid(), role: "user", text: message }])
    setLoading(true)
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, previousFilters, followUpRound }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setMessages(m => [...m, { id: uid(), role: "ai", kind: "error" }])
        return
      }
      if (data.needsFollowUp) {
        setPreviousFilters(data.filters)
        setFollowUpRound(r => r + 1)
        setMessages(m => [...m, { id: uid(), role: "ai", kind: "followup", question: data.followUp.question, options: data.followUp.options }])
        return
      }
      if (!data.understood) {
        setMessages(m => [...m, { id: uid(), role: "ai", kind: "notUnderstood" }])
        return
      }
      setPreviousFilters(data.filters)
      setMessages(m => [...m, {
        id: uid(), role: "ai", kind: "results",
        summary: data.summary, usedSummary: data.usedSummary, relaxedSteps: data.relaxedSteps,
        results: data.results, totalCount: data.totalCount, listingsUrl: data.listingsUrl,
        alternatives: data.alternatives || [], filters: data.filters,
      }])
      saveHistory(data.summary, data.filters)
      setHistory(loadHistory())
    } catch {
      setMessages(m => [...m, { id: uid(), role: "ai", kind: "error" }])
    } finally {
      setLoading(false)
    }
  }

  // Tìm lại nhanh từ lịch sử tìm kiếm hoặc phương án thay thế — không gọi Claude lại
  async function runDirect(filters: ParsedFilters, bubbleText: string) {
    if (loading) return
    setMessages(m => [...m, { id: uid(), role: "user", text: bubbleText }])
    setLoading(true)
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directFilters: filters }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setMessages(m => [...m, { id: uid(), role: "ai", kind: "error" }])
        return
      }
      setPreviousFilters(data.filters)
      setFollowUpRound(1)
      setMessages(m => [...m, {
        id: uid(), role: "ai", kind: "results",
        summary: data.summary, usedSummary: data.usedSummary, relaxedSteps: data.relaxedSteps,
        results: data.results, totalCount: data.totalCount, listingsUrl: data.listingsUrl,
        alternatives: data.alternatives || [], filters: data.filters,
      }])
      saveHistory(data.summary, data.filters)
      setHistory(loadHistory())
    } catch {
      setMessages(m => [...m, { id: uid(), role: "ai", kind: "error" }])
    } finally {
      setLoading(false)
    }
  }

  async function submitSubscribe(filters: ParsedFilters, phone: string, line: string, name: string) {
    if (!phone.trim()) return
    try {
      const res = await fetch("/api/ai-search/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, contactPhone: phone, contactLine: line || undefined, contactName: name || undefined }),
      })
      const data = await res.json()
      if (res.ok && !data.error) {
        setMessages(m => [...m, { id: uid(), role: "ai", kind: "subscribed" }])
      } else {
        setMessages(m => [...m, { id: uid(), role: "ai", kind: "error" }])
      }
    } catch {
      setMessages(m => [...m, { id: uid(), role: "ai", kind: "error" }])
    } finally {
      setSubscribeFor(null)
    }
  }

  return (
    <div className={compact ? "flex flex-col h-full" : "max-w-2xl mx-auto mt-4"}>
      <div className={compact ? "flex flex-col h-full" : "bg-white rounded-2xl shadow-lg border border-red-100 p-4 sm:p-5"}>
        {!compact && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center shrink-0">
                <Sparkles size={14} strokeWidth={2.4} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">8386 AI — Trợ lý tìm nhà</span>
            </div>
            <p className="text-xs text-gray-400 mb-3 pl-9">
              Không biết phải lọc nhà thế nào? Cứ nói nhu cầu của bạn bằng tiếng Việt.
            </p>
          </>
        )}

        <div className={compact ? "flex-1 overflow-y-auto space-y-3 pr-0.5" : "space-y-3 max-h-[65vh] overflow-y-auto pr-0.5"}>
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5">
              {history.length > 0 && history.map((h, i) => (
                <button key={i} onClick={() => runDirect(h.filters, `↺ ${h.summary.join(", ")}`)}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100 transition text-left">
                  ↺ {h.summary.slice(0, 2).join(", ")}
                </button>
              ))}
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => runSearch(ex)}
                  className="text-xs bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100 transition text-left">
                  💬 {ex}
                </button>
              ))}
            </div>
          )}

          {messages.map(msg => {
            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-red-600 text-white text-sm rounded-2xl rounded-br-sm px-3.5 py-2 max-w-[85%]">
                    {msg.text}
                  </div>
                </div>
              )
            }
            if (msg.kind === "error") {
              return (
                <AiBubble key={msg.id}>
                  Có lỗi khi tìm nhà, bạn thử lại giúp mình nhé, hoặc dùng bộ lọc phía trên.
                </AiBubble>
              )
            }
            if (msg.kind === "notUnderstood") {
              return (
                <AiBubble key={msg.id}>
                  Mình chưa hiểu rõ nhu cầu tìm nhà của bạn 🤔 Bạn thử mô tả cụ thể hơn nhé, ví dụ: khu vực, ngân sách, số phòng ngủ...
                </AiBubble>
              )
            }
            if (msg.kind === "subscribed") {
              return (
                <AiBubble key={msg.id}>
                  ✅ Đã lưu nhu cầu của bạn! 8386 sẽ chủ động liên hệ ngay khi có tin đăng mới phù hợp.
                </AiBubble>
              )
            }
            if (msg.kind === "followup") {
              return (
                <AiBubble key={msg.id}>
                  <p className="mb-2">{msg.question}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.options.map(opt => (
                      <button key={opt} onClick={() => runSearch(opt)}
                        className="text-xs bg-white hover:bg-red-50 hover:text-red-600 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 transition font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                </AiBubble>
              )
            }
            return <ResultsBubble key={msg.id} msg={msg} onAlt={runDirect} onSubscribe={() => setSubscribeFor(msg.filters)} />
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 pl-1">
              <Loader2 size={14} className="animate-spin" /> AI đang tìm nhà cho bạn...
            </div>
          )}

          {subscribeFor && (
            <SubscribeForm onSubmit={(phone, line, name) => submitSubscribe(subscribeFor, phone, line, name)} onCancel={() => setSubscribeFor(null)} />
          )}

          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 mt-3 shrink-0">
          <textarea
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runSearch() } }}
            rows={compact ? 1 : 2}
            placeholder={messages.length === 0 ? "Tôi cần thuê nhà ở Đài Trung, khoảng 15 nghìn, 2 phòng ngủ..." : "Nhắn tiếp: tìm rẻ hơn, thêm chỗ đậu xe..."}
            className="flex-1 resize-none text-sm outline-none text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:border-red-400"
          />
          <button
            onClick={() => runSearch()}
            disabled={loading || !q.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 flex items-center justify-center gap-1.5"
          >
            {compact ? <Send size={16} /> : (loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={15} strokeWidth={2.2} />)}
            {!compact && (loading ? "Đang tìm..." : "Tìm nhà")}
          </button>
        </div>
      </div>
    </div>
  )
}

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-50 text-gray-700 text-sm rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[92%]">
        {children}
      </div>
    </div>
  )
}

type ResultsMsg = Extract<ChatMsg, { kind: "results" }>

function ResultsBubble({
  msg, onAlt, onSubscribe,
}: { msg: ResultsMsg; onAlt: (f: ParsedFilters, label: string) => void; onSubscribe: () => void }) {
  const showSubscribe = msg.totalCount < 3 || msg.relaxedSteps.length > 0

  return (
    <div className="bg-gray-50 rounded-2xl rounded-bl-sm p-3">
      <div className="text-xs font-semibold text-gray-400 mb-1.5">🎯 Mình đã hiểu nhu cầu của bạn:</div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {msg.summary.map((c, i) => (
          <span key={i} className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">{c}</span>
        ))}
      </div>

      {msg.relaxedSteps.length > 0 && (
        <div className="text-xs text-orange-600 bg-orange-50 rounded-xl px-3 py-2 mb-2">
          Hiện chưa có căn nào đáp ứng đầy đủ 100% yêu cầu. Mình đã {msg.relaxedSteps.join(", ")} để tìm ra {msg.totalCount} căn gần đúng nhất bên dưới.
        </div>
      )}

      {msg.results.length === 0 ? (
        <div className="text-xs text-gray-500 bg-white rounded-xl px-3 py-2 mb-2">
          Hiện tại 8386 chưa có căn nào phù hợp. Bạn có thể nhờ 8386 chủ động tìm giúp khi có tin mới nhé.
        </div>
      ) : (
        <>
          <div className="text-xs font-semibold text-gray-400 mb-2">
            ✨ AI tìm thấy {msg.totalCount} căn phù hợp{msg.results.length < msg.totalCount ? `, xem trước ${msg.results.length} căn` : ""}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            {msg.results.map(r => (
              <AiResultCard key={r.property.id} property={r.property} score={r.score} checklist={r.checklist} />
            ))}
          </div>
        </>
      )}

      {msg.alternatives.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {msg.alternatives.map((alt, i) => (
            <button key={i} onClick={() => onAlt(alt.filters, `Thử: ${alt.label}`)}
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2.5 py-1.5 rounded-full border border-blue-100 transition font-medium">
              💡 {alt.label} — xem {alt.count} căn
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-1">
        {msg.totalCount > 0 && (
          <Link href={msg.listingsUrl} className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700">
            Xem tất cả {msg.totalCount} căn <ArrowRight size={14} strokeWidth={2.4} />
          </Link>
        )}
        {showSubscribe && (
          <button onClick={onSubscribe} className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700">
            <Bell size={14} strokeWidth={2.4} /> Nhờ 8386 tìm giúp
          </button>
        )}
      </div>
    </div>
  )
}

function SubscribeForm({
  onSubmit, onCancel,
}: { onSubmit: (phone: string, line: string, name: string) => void; onCancel: () => void }) {
  const [phone, setPhone] = useState("")
  const [line, setLine] = useState("")
  const [name, setName] = useState("")

  return (
    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 space-y-2">
      <div className="text-xs font-semibold text-orange-700">
        🔔 Để lại thông tin, 8386 sẽ chủ động liên hệ ngay khi có nhà mới phù hợp:
      </div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên của bạn (không bắt buộc)"
        className="w-full text-sm bg-white border border-orange-100 rounded-lg px-3 py-2 outline-none focus:border-orange-300" />
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại *" required
        className="w-full text-sm bg-white border border-orange-100 rounded-lg px-3 py-2 outline-none focus:border-orange-300" />
      <input value={line} onChange={e => setLine(e.target.value)} placeholder="LINE ID (không bắt buộc)"
        className="w-full text-sm bg-white border border-orange-100 rounded-lg px-3 py-2 outline-none focus:border-orange-300" />
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSubmit(phone, line, name)} disabled={!phone.trim()}
          className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition">
          Gửi
        </button>
        <button onClick={onCancel} className="px-4 text-sm text-gray-500 hover:text-gray-700">Huỷ</button>
      </div>
    </div>
  )
}
