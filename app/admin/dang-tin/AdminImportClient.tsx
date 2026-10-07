"use client"
// /admin/dang-tin — Dán link tin nhà, hệ thống tự đọc thông tin + dịch Việt, xếp hàng và tự đăng mỗi ngày.
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-browser"
import type { QueueRow } from "@/lib/listingImport"
import {
  Lock, LogOut, Loader2, Link2, Upload, Send, Trash2, ArrowUp, Languages, X, ExternalLink, CheckCircle2, RefreshCw,
} from "lucide-react"

type Tab = "active" | "published" | "all"
const PW_KEY = "admin_import_pw"

const STATUS: Record<string, { label: string; cls: string }> = {
  ready:             { label: "Sẵn sàng đăng",   cls: "bg-green-50 text-green-700" },
  needs_photos:      { label: "Cần thêm ảnh",     cls: "bg-amber-50 text-amber-700" },
  needs_translation: { label: "Chưa dịch tiếng Việt", cls: "bg-orange-50 text-orange-700" },
  published:         { label: "Đã đăng",          cls: "bg-blue-50 text-blue-700" },
  duplicate:         { label: "⚠️ Trùng lặp – nhà đã đăng trước đó", cls: "bg-red-100 text-red-700" },
  error:             { label: "Lỗi",              cls: "bg-red-50 text-red-700" },
  removed:           { label: "Đã bỏ",            cls: "bg-gray-100 text-gray-500" },
}

const nextStatus = (translated: boolean | undefined, images: string[]) =>
  !translated ? "needs_translation" : images.length >= 3 ? "ready" : "needs_photos"

export default function AdminImportClient() {
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [tab, setTab] = useState<Tab>("active")
  const [rows, setRows] = useState<QueueRow[]>([])
  const [loading, setLoading] = useState(false)
  const [perDay, setPerDay] = useState(10)
  const [links, setLinks] = useState("")
  const [confirmOk, setConfirmOk] = useState(false)
  const [progress, setProgress] = useState<string[]>([])
  const [importing, setImporting] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load(pw: string, t: Tab) {
    setLoading(true)
    const { data, error } = await supabase.rpc("import_queue_list", { p_password: pw, p_status: t })
    setLoading(false)
    if (error) {
      setAuthed(false); sessionStorage.removeItem(PW_KEY)
      setAuthError(error.message === "invalid_password" ? "Sai mật khẩu" : error.message)
      return
    }
    setAuthed(true); setAuthError(""); sessionStorage.setItem(PW_KEY, pw)
    setRows((data || []) as QueueRow[])
    const s = await supabase.rpc("import_settings_get", { p_password: pw })
    if (typeof s.data === "number") setPerDay(s.data)
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY)
    if (saved) { setPassword(saved); load(saved, "active") }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { if (authed) load(password, tab) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const replaceRow = (r: QueueRow) => setRows(rs => rs.map(x => (x.id === r.id ? r : x)))

  async function update(row: QueueRow, args: { draft?: Record<string, unknown>; images?: string[]; status?: string; priority?: number }) {
    setBusyId(row.id)
    const { data, error } = await supabase.rpc("import_queue_update", {
      p_password: password, p_id: row.id, p_draft_patch: args.draft ?? null, p_images: args.images ?? null,
      p_status: args.status ?? null, p_priority: args.priority ?? null,
    })
    setBusyId(null)
    if (error) { alert(error.message); return null }
    const r = data as QueueRow
    if (args.status === "removed") setRows(rs => rs.filter(x => x.id !== row.id)); else replaceRow(r)
    return r
  }

  // ── Dán link -> xử lý lần lượt từng link ──
  async function importLinks() {
    const urls = [...new Set(links.split(/\s+/).map(s => s.trim()).filter(s => /^https?:\/\//.test(s)))]
    if (!urls.length) { alert("Chưa có link hợp lệ"); return }
    setImporting(true); setProgress([])
    for (const [i, url] of urls.entries()) {
      setProgress(p => [...p, `⏳ (${i + 1}/${urls.length}) ${url}`])
      try {
        const res = await fetch("/api/admin/import-link", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, url }),
        })
        const j = await res.json()
        const msg = j.error
          ? `❌ ${url} — ${j.error}`
          : `✅ ${j.row?.draft?.title_zh || url}${j.warning ? ` (⚠️ ${j.warning})` : ""}`
        setProgress(p => [...p.slice(0, -1), msg])
      } catch (e: any) {
        setProgress(p => [...p.slice(0, -1), `❌ ${url} — ${e.message}`])
      }
      // Nghỉ giữa các link để không gửi quá nhiều yêu cầu dồn dập tới trang nguồn (tránh bị chặn 403)
      if (i < urls.length - 1) {
        for (let s = 60; s > 0; s--) {   // nghỉ 60 giây, hiện đếm ngược
          setProgress(p => [...p.filter(x => !x.startsWith("⏸")), `⏸ Nghỉ ${s} giây trước link tiếp theo...`])
          await new Promise(r => setTimeout(r, 1000))
        }
        setProgress(p => p.filter(x => !x.startsWith("⏸")))
      }
    }
    setImporting(false); setLinks("")
    load(password, tab)
  }

  async function uploadPhotos(row: QueueRow, files: FileList | null) {
    if (!files?.length) return
    setBusyId(row.id)
    const added: string[] = []
    for (const [i, f] of Array.from(files).entries()) {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase()
      // tiền tố "user-" để phân biệt ảnh admin tự tải lên với ảnh lấy tự động từ link
      const path = `import/${row.draft.id || row.id}/user-${Date.now()}-${i + 1}.${ext}`
      const { error } = await supabase.storage.from("properties").upload(path, f, { contentType: f.type || "image/jpeg" })
      if (error) { alert(`Lỗi tải ảnh ${f.name}: ${error.message}`); continue }
      added.push(supabase.storage.from("properties").getPublicUrl(path).data.publicUrl)
    }
    setBusyId(null)
    const images = [...row.images, ...added]
    await update(row, { images, status: row.status === "published" ? undefined : nextStatus(row.draft.translated, images) })
  }

  async function removePhoto(row: QueueRow, url: string) {
    const images = row.images.filter(u => u !== url)
    await update(row, { images, status: row.status === "published" ? undefined : nextStatus(row.draft.translated, images) })
  }

  async function publishNow(row: QueueRow) {
    if (!confirm(`Đăng ngay "${row.draft.title_zh}" lên web?`)) return
    setBusyId(row.id)
    const { data, error } = await supabase.rpc("import_publish", { p_password: password, p_id: row.id })
    setBusyId(null)
    if (error) alert(error.message === "no_images" ? "Cần ít nhất 1 ảnh" : error.message)
    else if (!data) alert("⚠️ Không đăng: nhà này trùng với tin đã đăng trước đó (xem cảnh báo trên tin).")
    load(password, tab)
  }

  async function retranslate(row: QueueRow) {
    setBusyId(row.id)
    const res = await fetch("/api/admin/import-link", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: row.id, action: "translate" }),
    })
    const j = await res.json()
    setBusyId(null)
    if (j.error) alert(j.error); else if (j.row) replaceRow(j.row)
  }

  async function retryLink(row: QueueRow) {
    setBusyId(row.id)
    const res = await fetch("/api/admin/import-link", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, url: row.source_url }),
    })
    const j = await res.json()
    setBusyId(null)
    if (j.row) replaceRow(j.row)
    if (j.error) alert(j.error)
  }

  async function fetchPhotos(row: QueueRow) {
    setBusyId(row.id)
    const res = await fetch("/api/admin/import-link", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: row.id, action: "photos" }),
    })
    const j = await res.json()
    setBusyId(null)
    if (j.error) alert(j.error)
    else { if (j.row) replaceRow(j.row); if (j.warning) alert(j.warning) }
  }

  async function savePerDay(v: number) {
    setPerDay(v)
    await supabase.rpc("import_settings_set", { p_password: password, p_per_day: v })
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24">
        <form onSubmit={e => { e.preventDefault(); load(password, tab) }}
          className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4"><Lock size={20} /></div>
          <h1 className="font-bold text-gray-900 mb-1">Đăng tin từ link</h1>
          <p className="text-xs text-gray-500 mb-4">Nhập mật khẩu quản trị</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 outline-none focus:border-red-400" />
          {authError && <p className="text-xs text-red-600 mb-3">{authError}</p>}
          <button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 text-sm font-semibold">
            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Đăng nhập"}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">🏠 Đăng tin từ link</h1>
          <p className="text-xs text-gray-500">Dán link tin nhà → hệ thống tự đọc thông tin, dịch Việt, xếp hàng và tự đăng mỗi sáng (khoảng 8:47).</p>
        </div>
        <button onClick={() => { sessionStorage.removeItem(PW_KEY); setAuthed(false); setPassword("") }}
          className="text-xs text-gray-500 hover:text-red-600 inline-flex items-center gap-1"><LogOut size={14} /> Thoát</button>
      </div>

      {/* Dán link */}
      <section className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><Link2 size={16} /> Link tin nhà (mỗi dòng 1 link)</label>
        <textarea value={links} onChange={e => setLinks(e.target.value)} rows={4}
          placeholder={"https://buy.yungching.com.tw/house/7504731\nhttps://..."}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400 font-mono" />
        <label className="flex items-start gap-2 text-xs text-gray-700">
          <input type="checkbox" checked={confirmOk} onChange={e => setConfirmOk(e.target.checked)} className="mt-0.5" />
          <span>Tôi xác nhận các nhà này do cửa hàng tôi nhận ủy thác (委託) hoặc được phép bán chung (聯賣). Tin đăng sẽ ghi tên công ty môi giới theo 不動產經紀業管理條例.</span>
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          <button disabled={importing || !confirmOk || !links.trim()} onClick={importLinks}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl px-4 py-2 text-sm font-semibold">
            {importing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Thêm vào hàng đợi
          </button>
          <label className="text-xs text-gray-600 flex items-center gap-2">
            Tự đăng mỗi ngày:
            <select value={perDay} onChange={e => savePerDay(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs">
              {[0, 1, 2, 3, 5, 8, 10, 15, 20].map(v => <option key={v} value={v}>{v === 0 ? "Tạm dừng" : `${v} căn`}</option>)}
            </select>
          </label>
        </div>
        {progress.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1 max-h-48 overflow-y-auto">
            {progress.map((p, i) => <div key={i} className="break-all">{p}</div>)}
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {([["active", "Đang chờ đăng"], ["published", "Đã đăng"], ["all", "Tất cả"]] as [Tab, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === k ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>{label}</button>
        ))}
        <button onClick={() => load(password, tab)} className="ml-auto text-gray-500 hover:text-gray-800"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
      </div>

      {rows.length === 0 && !loading && <p className="text-sm text-gray-500 text-center py-10">Chưa có tin nào.</p>}
      <div className="space-y-3">
        {rows.map(r => <QueueCard key={r.id} row={r} busy={busyId === r.id}
          onUpload={f => uploadPhotos(r, f)} onRemovePhoto={u => removePhoto(r, u)}
          onSave={draft => update(r, { draft })} onPublish={() => publishNow(r)} onTranslate={() => retranslate(r)}
          onPhotos={() => fetchPhotos(r)} onRetry={() => retryLink(r)}
          onTop={() => update(r, { priority: (r.priority || 0) + 10 })}
          onReady={() => update(r, { status: "ready" })}
          onNotDup={() => confirm("Xác nhận đây KHÔNG phải nhà đã đăng (chỉ giống thông tin)?") &&
            update(r, { draft: { dup_ok: true }, status: nextStatus(r.draft.translated, r.images) })}
          onRemove={() => confirm("Bỏ tin này khỏi hàng đợi?") && update(r, { status: "removed" })} />)}
      </div>
    </div>
  )
}

interface CardProps {
  row: QueueRow; busy: boolean
  onUpload: (f: FileList | null) => void; onRemovePhoto: (u: string) => void
  onSave: (draft: Record<string, unknown>) => void; onPublish: () => void; onTranslate: () => void
  onPhotos: () => void; onRetry: () => void; onTop: () => void; onReady: () => void; onRemove: () => void
  onNotDup: () => void
}

function QueueCard({ row, busy, onUpload, onRemovePhoto, onSave, onPublish, onTranslate, onPhotos, onRetry, onTop, onReady, onRemove, onNotDup }: CardProps) {
  const d = row.draft || ({} as QueueRow["draft"])
  const st = STATUS[row.status] || { label: row.status, cls: "bg-gray-100 text-gray-600" }
  const [edit, setEdit] = useState(false)
  const [titleVi, setTitleVi] = useState(d.title_vi || "")
  const [price, setPrice] = useState(String(d.price ?? ""))
  const [company, setCompany] = useState(d.agent_company || "")
  const done = row.status === "published"
  const dup = row.status === "duplicate"

  return (
    <article className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className={`px-2 py-0.5 rounded-full font-semibold ${st.cls}`}>{st.label}</span>
            <span className="text-gray-400">#{row.id}{d.id ? ` · 編號 ${d.id}` : ""}</span>
            {row.priority > 0 && <span className="text-red-500">★ ưu tiên</span>}
            <a href={row.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 inline-flex items-center gap-0.5">nguồn <ExternalLink size={11} /></a>
            {row.property_id && <a href={`/listings/${row.property_id}`} target="_blank" className="text-green-700 inline-flex items-center gap-0.5">xem trên web <ExternalLink size={11} /></a>}
          </div>
          <h3 className="font-bold text-gray-900 mt-1">{d.title_zh || row.source_url}</h3>
          {d.title_vi && d.title_vi !== d.title_zh && <p className="text-sm text-gray-700">{d.title_vi}</p>}
          {d.price ? (
            <p className="text-xs text-gray-500 mt-1">
              {d.city}{d.district} · <b className="text-red-600">{d.price.toLocaleString()} 萬</b>
              {d.area_ping ? ` · ${d.area_ping} 坪` : ""}{d.area_land_ping ? ` · đất ${d.area_land_ping} 坪` : ""}
              {d.bedrooms ? ` · ${d.bedrooms} phòng` : ""}{d.age ? ` · ${d.age} năm` : ""}
              {d.agent_company ? ` · ${d.agent_company}` : ""}
            </p>
          ) : null}
          {row.error && <p className="text-xs text-red-600 mt-1">⚠️ {row.error}</p>}
        </div>
        {busy && <Loader2 size={18} className="animate-spin text-gray-400 shrink-0" />}
      </div>

      {/* Ảnh */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {row.images.map(u => (
          <div key={u} className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="w-24 h-18 object-cover rounded-lg border border-gray-100" style={{ height: 72 }} />
            {!done && <button onClick={() => onRemovePhoto(u)} className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow p-0.5 text-gray-600 hover:text-red-600"><X size={12} /></button>}
          </div>
        ))}
        {!done && (
          <label className="shrink-0 w-24 h-[72px] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-[11px] text-gray-500 cursor-pointer hover:border-red-300 hover:text-red-600">
            <Upload size={16} /> Thêm ảnh
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => { onUpload(e.target.files); e.target.value = "" }} />
          </label>
        )}
      </div>

      {edit && (
        <div className="grid sm:grid-cols-3 gap-2 mt-3">
          <input value={titleVi} onChange={e => setTitleVi(e.target.value)} placeholder="Tiêu đề tiếng Việt" className="sm:col-span-3 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Giá (萬)" className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Công ty môi giới (經紀業名稱)" className="sm:col-span-2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          <button onClick={() => { onSave({ title_vi: titleVi, price: Number(price) || d.price, agent_company: company || null }); setEdit(false) }}
            className="bg-gray-900 text-white rounded-lg px-3 py-1.5 text-sm">Lưu</button>
        </div>
      )}

      {!done && (
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          {dup ? (
            <button disabled={busy} onClick={onNotDup} className="inline-flex items-center gap-1 border border-gray-300 text-gray-700 rounded-lg px-3 py-1.5"><CheckCircle2 size={13} /> Không trùng, vẫn cho đăng</button>
          ) : (
            <button disabled={busy || !row.images.length} onClick={onPublish} className="inline-flex items-center gap-1 bg-red-600 text-white rounded-lg px-3 py-1.5 disabled:opacity-40"><Send size={13} /> Đăng ngay</button>
          )}
          {row.status === "needs_photos" && row.images.length > 0 && (
            <button disabled={busy} onClick={onReady} className="inline-flex items-center gap-1 border border-green-200 text-green-700 rounded-lg px-3 py-1.5"><CheckCircle2 size={13} /> Đủ ảnh, cho vào lịch đăng</button>
          )}
          {row.status === "needs_translation" && (
            <button disabled={busy} onClick={onTranslate} className="inline-flex items-center gap-1 border border-orange-200 text-orange-700 rounded-lg px-3 py-1.5"><Languages size={13} /> Dịch lại</button>
          )}
          {row.status === "error" && (
            <button disabled={busy} onClick={onRetry} className="inline-flex items-center gap-1 border border-red-200 text-red-700 rounded-lg px-3 py-1.5"><RefreshCw size={13} /> Thử lại</button>
          )}
          {row.status !== "error" && row.images.length < 30 && (
            <button disabled={busy} onClick={onPhotos} className="inline-flex items-center gap-1 border border-blue-200 text-blue-700 rounded-lg px-3 py-1.5"><RefreshCw size={13} /> Lấy ảnh từ link</button>
          )}
          {row.status !== "error" && <button onClick={() => setEdit(e => !e)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700">Sửa nhanh</button>}
          <button disabled={busy} onClick={onTop} className="inline-flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700"><ArrowUp size={13} /> Đăng sớm hơn</button>
          <button disabled={busy} onClick={onRemove} className="inline-flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:text-red-600"><Trash2 size={13} /> Bỏ</button>
        </div>
      )}
    </article>
  )
}
