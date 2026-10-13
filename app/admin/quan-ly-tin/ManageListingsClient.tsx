"use client"
// Trang admin: xem tất cả tin, đánh dấu Đã bán / Gỡ / Đăng lại. Dùng chung mật khẩu với /admin/dang-tin.
import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase-browser"

type Status = "active" | "sold" | "removed"
interface Row {
  listing_id: string; src: string; title_zh: string | null; title_vi: string | null
  city: string | null; district: string | null; listing_type: string | null; price: number | null
  status: Status; status_reason: string | null; status_changed_at: string | null
  posted_at: string | null; views: number | null; source_url: string | null
  last_checked_at: string | null; last_check_result: string | null
}

const BADGE: Record<Status, { label: string; cls: string }> = {
  active:  { label: "Đang đăng", cls: "bg-green-100 text-green-700" },
  sold:    { label: "Đã bán",    cls: "bg-blue-100 text-blue-700" },
  removed: { label: "Đã gỡ",     cls: "bg-gray-200 text-gray-600" },
}

export default function ManageListingsClient() {
  const supabase = useMemo(() => createClient(), [])
  const [pw, setPw] = useState("")
  const [authed, setAuthed] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [filter, setFilter] = useState<"all" | Status>("active")
  const [q, setQ] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  async function load(password: string) {
    setLoading(true); setErr("")
    const { data, error } = await supabase.rpc("admin_list_listings", { p_password: password })
    setLoading(false)
    if (error) { setErr("Sai mật khẩu hoặc lỗi: " + error.message); setAuthed(false); return }
    sessionStorage.setItem("admin_import_pw", password)
    setRows((data || []) as Row[]); setAuthed(true)
  }

  useEffect(() => {
    try { const saved = sessionStorage.getItem("admin_import_pw"); if (saved) { setPw(saved); load(saved) } } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function setStatus(r: Row, status: Status) {
    const verb = status === "sold" ? "đánh dấu ĐÃ BÁN" : status === "removed" ? "GỠ" : "ĐĂNG LẠI"
    if (!window.confirm(`${verb} tin này?\n${r.title_vi || r.title_zh || r.listing_id}`)) return
    setBusy(r.listing_id)
    const res = await fetch("/api/admin/listing-status", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw, id: r.listing_id, status, reason: status === "active" ? "manual_restore" : "manual" }),
    })
    setBusy(null)
    if (!res.ok) { alert("Không đổi được trạng thái"); return }
    setRows(rs => rs.map(x => x.listing_id === r.listing_id ? { ...x, status, status_reason: status === "active" ? "manual_restore" : "manual" } : x))
  }

  const counts = useMemo(() => ({
    all: rows.length,
    active: rows.filter(r => r.status === "active").length,
    sold: rows.filter(r => r.status === "sold").length,
    removed: rows.filter(r => r.status === "removed").length,
  }), [rows])

  const shown = rows.filter(r => {
    if (filter !== "all" && r.status !== filter) return false
    if (!q.trim()) return true
    const s = q.trim().toLowerCase()
    return [r.title_zh, r.title_vi, r.city, r.district, r.listing_id].some(v => (v || "").toLowerCase().includes(s))
  })

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <h1 className="text-lg font-bold mb-4">Quản lý tin đăng</h1>
        <form onSubmit={e => { e.preventDefault(); load(pw) }} className="space-y-3">
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Mật khẩu admin"
            className="w-full border rounded-xl px-3 py-2.5 text-sm" />
          <button className="w-full bg-red-500 text-white rounded-xl py-2.5 font-semibold text-sm">{loading ? "..." : "Đăng nhập"}</button>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-lg font-bold">Quản lý tin đăng</h1>
        <a href="/admin/dang-tin" className="text-sm text-blue-600 underline">← Đăng tin từ link</a>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {(["active", "sold", "removed", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${filter === f ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600"}`}>
            {f === "all" ? "Tất cả" : BADGE[f].label} ({counts[f]})
          </button>
        ))}
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm..." className="ml-auto border rounded-full px-3 py-1.5 text-xs w-40" />
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Tin có nguồn 永慶 được kiểm tra tự động mỗi ngày; nếu 永慶 gỡ thì tin ở đây tự chuyển sang "Đã gỡ". Có thể bấm "Đăng lại" nếu cần.
      </p>
      <div className="space-y-2">
        {shown.map(r => (
          <div key={r.listing_id} className="bg-white border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE[r.status].cls}`}>{BADGE[r.status].label}</span>
                <span className="text-[10px] text-gray-400">{r.src === "user" ? "Khách đăng" : "Admin"}</span>
                {r.status_reason === "yungching_gone" && <span className="text-[10px] text-amber-600">永慶 đã gỡ</span>}
              </div>
              <a href={`/listings/${r.listing_id}`} target="_blank" className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-red-600">
                {r.title_vi || r.title_zh || r.listing_id}
              </a>
              <p className="text-[11px] text-gray-400">
                {[r.city, r.district].filter(Boolean).join(" ")} · {r.views || 0} lượt xem
                {r.source_url && <> · <a href={r.source_url} target="_blank" className="underline">永慶</a>
                  {r.last_check_result && ` (kiểm tra: ${r.last_check_result}${r.last_checked_at ? " " + new Date(r.last_checked_at).toLocaleDateString("vi-VN") : ""})`}</>}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {r.status === "active" ? (
                <>
                  <button disabled={busy === r.listing_id} onClick={() => setStatus(r, "sold")} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 disabled:opacity-40">Đã bán</button>
                  <button disabled={busy === r.listing_id} onClick={() => setStatus(r, "removed")} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 disabled:opacity-40">Gỡ</button>
                </>
              ) : (
                <button disabled={busy === r.listing_id} onClick={() => setStatus(r, "active")} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 disabled:opacity-40">Đăng lại</button>
              )}
            </div>
          </div>
        ))}
        {shown.length === 0 && <p className="text-center text-sm text-gray-400 py-10">Không có tin nào.</p>}
      </div>
    </div>
  )
}
