"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"
import type { PropertyReel } from "@/lib/data"
import { Lock, CheckCircle2, XCircle, Trash2, Loader2, RefreshCw, Clapperboard, LogOut } from "lucide-react"

type StatusFilter = "pending" | "approved" | "rejected" | "all"

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "pending",  label: "Chờ duyệt" },
  { key: "approved", label: "Đã duyệt" },
  { key: "rejected", label: "Đã từ chối" },
  { key: "all",      label: "Tất cả" },
]

export default function AdminReelsClient() {
  const supabase = createClient()

  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [authing, setAuthing] = useState(false)

  const [status, setStatus] = useState<StatusFilter>("pending")
  const [reels, setReels] = useState<PropertyReel[]>([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function fetchReels(pw: string, st: StatusFilter) {
    setLoading(true)
    const { data, error } = await supabase.rpc("admin_list_reels", { p_password: pw, p_status: st })
    setLoading(false)
    if (error) {
      setAuthed(false)
      sessionStorage.removeItem("admin_reels_pw")
      setAuthError(error.message === "invalid_password" ? "Sai mật khẩu" : error.message)
      return
    }
    setAuthed(true)
    setAuthError("")
    sessionStorage.setItem("admin_reels_pw", pw)
    setReels((data || []) as PropertyReel[])
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_reels_pw")
    if (saved) { setPassword(saved); fetchReels(saved, "pending") }
  }, [])

  useEffect(() => {
    if (authed) fetchReels(password, status)
  }, [status])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthing(true)
    await fetchReels(password, status)
    setAuthing(false)
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_reels_pw")
    setAuthed(false)
    setPassword("")
    setReels([])
  }

  async function moderate(id: string, newStatus: "approved" | "rejected") {
    setBusyId(id)
    const { error } = await supabase.rpc("moderate_property_reel", { p_id: id, p_status: newStatus, p_password: password })
    setBusyId(null)
    if (!error) setReels(rs => rs.filter(r => r.id !== id))
    else alert(error.message)
  }

  async function removeReel(id: string) {
    if (!confirm("Xoá video này vĩnh viễn? Không thể hoàn tác.")) return
    setBusyId(id)
    const { error } = await supabase.rpc("admin_delete_reel", { p_id: id, p_password: password })
    setBusyId(null)
    if (!error) setReels(rs => rs.filter(r => r.id !== id))
    else alert(error.message)
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24">
        <form onSubmit={handleLogin} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} strokeWidth={2} />
          </div>
          <h1 className="font-bold text-gray-900 mb-1">Duyệt video Reels</h1>
          <p className="text-xs text-gray-400 mb-5">Nhập mật khẩu quản trị để tiếp tục</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 mb-3" />
          {authError && <p className="text-red-500 text-xs mb-3">{authError}</p>}
          <button type="submit" disabled={authing || !password}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {authing ? <Loader2 size={15} className="animate-spin" /> : null} Đăng nhập
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
          <Clapperboard size={20} strokeWidth={2.2} className="text-red-500" /> Duyệt video Reels
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchReels(password, status)}
            className="text-gray-400 hover:text-gray-700 border border-gray-200 rounded-xl p-2 transition">
            <RefreshCw size={15} strokeWidth={2.2} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleLogout}
            className="text-xs text-gray-400 border border-gray-200 rounded-xl px-3 py-2 hover:text-red-500 hover:bg-red-50 transition flex items-center gap-1">
            <LogOut size={13} strokeWidth={2.2} /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setStatus(tb.key)}
            className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-xl transition ${
              status === tb.key ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>
            {tb.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-16">Đang tải...</p>
      ) : reels.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-16">Không có video nào ở mục này.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reels.map(reel => (
            <div key={reel.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <video src={reel.video_url} poster={reel.thumbnail_url || undefined}
                controls muted playsInline preload="metadata"
                className="w-full aspect-[9/16] max-h-72 object-cover bg-black" />

              <div className="p-3 flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${
                    reel.status === "approved" ? "bg-emerald-600" : reel.status === "rejected" ? "bg-gray-400" : "bg-amber-500"
                  }`}>
                    {reel.status === "approved" ? "Đã duyệt" : reel.status === "rejected" ? "Đã từ chối" : "Chờ duyệt"}
                  </span>
                  <span className="text-[10px] text-gray-300">
                    {reel.uploader_type === "admin" ? "Admin đăng" : "Khách đăng"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {reel.title_vi || reel.title_zh || "(Không có tiêu đề)"}
                </p>
                {reel.price != null && (
                  <p className="text-red-600 font-bold text-sm">
                    {reel.listing_type === "rent"
                      ? `${Number(reel.price).toLocaleString()} Đài tệ/tháng`
                      : `${Number(reel.price).toLocaleString()} vạn Đài tệ`}
                  </p>
                )}

                <p className="text-[11px] text-gray-400">
                  {reel.city_vi || reel.city} · {new Date(reel.created_at).toLocaleString("vi-VN")}
                  {reel.duration_seconds ? ` · ${Math.round(reel.duration_seconds)}s` : ""}
                </p>
                <a href={`/listings/${reel.property_id}`} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] text-blue-500 hover:underline">
                  Xem tin đăng gốc →
                </a>

                <div className="mt-auto pt-2 flex items-center gap-2">
                  {reel.status !== "approved" && (
                    <button onClick={() => moderate(reel.id, "approved")} disabled={busyId === reel.id}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg py-2 transition">
                      <CheckCircle2 size={13} strokeWidth={2.2} /> Duyệt
                    </button>
                  )}
                  {reel.status !== "rejected" && (
                    <button onClick={() => moderate(reel.id, "rejected")} disabled={busyId === reel.id}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg py-2 transition">
                      <XCircle size={13} strokeWidth={2.2} /> Từ chối
                    </button>
                  )}
                  <button onClick={() => removeReel(reel.id)} disabled={busyId === reel.id}
                    className="text-gray-300 hover:text-red-500 disabled:opacity-50 p-2 transition">
                    {busyId === reel.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} strokeWidth={2.2} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
