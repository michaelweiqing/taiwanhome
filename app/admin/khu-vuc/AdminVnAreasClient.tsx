"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"
import { Lock, Loader2, LogOut, RefreshCw, MapPin, Plus, Trash2, Pencil, X } from "lucide-react"

const PW_KEY = "admin_vn_pw"

type Community = {
  id: string; slug: string; city: string; city_vi: string; district: string
  name_zh: string; name_vi: string; description_zh: string | null; description_vi: string | null
  population_note_zh: string | null; population_note_vi: string | null
  lat: number | null; lng: number | null; display_order: number; is_active: boolean
}
type Place = {
  id: string; community_id: string; category: string
  name_zh: string; name_vi: string | null; address: string | null; phone: string | null
  notes_zh: string | null; notes_vi: string | null; display_order: number
}

const CATEGORIES = [
  { val: "market", label: "🛒 Chợ / Siêu thị" },
  { val: "restaurant", label: "🍜 Quán ăn Việt" },
  { val: "shop", label: "🏪 Cửa hàng Việt" },
  { val: "church", label: "⛪ Nhà thờ" },
  { val: "hospital", label: "🏥 Bệnh viện" },
  { val: "university", label: "🎓 Trường đại học" },
  { val: "industrial_zone", label: "🏭 Khu công nghiệp" },
  { val: "bus_stop", label: "🚌 Trạm xe / Ga tàu" },
]

const emptyCommunity = (): Partial<Community> => ({
  slug: "", city: "台中市", city_vi: "Đài Trung", district: "",
  name_zh: "", name_vi: "", description_zh: "", description_vi: "",
  population_note_zh: "", population_note_vi: "", lat: null, lng: null,
  display_order: 0, is_active: true,
})
const emptyPlace = (communityId: string): Partial<Place> => ({
  community_id: communityId, category: "shop",
  name_zh: "", name_vi: "", address: "", phone: "", notes_zh: "", notes_vi: "", display_order: 0,
})

export default function AdminVnAreasClient() {
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [authing, setAuthing] = useState(false)

  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [placesLoading, setPlacesLoading] = useState(false)

  const [editingCommunity, setEditingCommunity] = useState<Partial<Community> | null>(null)
  const [editingPlace, setEditingPlace] = useState<Partial<Place> | null>(null)
  const [saving, setSaving] = useState(false)

  async function fetchCommunities(pw: string) {
    setLoading(true)
    const { data, error } = await supabase.rpc("admin_list_vn_communities", { p_password: pw })
    setLoading(false)
    if (error) {
      setAuthed(false)
      sessionStorage.removeItem(PW_KEY)
      setAuthError(error.message === "invalid_password" ? "Sai mật khẩu" : error.message)
      return
    }
    setAuthed(true)
    setAuthError("")
    sessionStorage.setItem(PW_KEY, pw)
    setCommunities((data || []) as Community[])
  }

  async function fetchPlaces(communityId: string) {
    setPlacesLoading(true)
    const { data, error } = await supabase.rpc("admin_list_vn_places", { p_password: password, p_community_id: communityId })
    setPlacesLoading(false)
    if (!error) setPlaces((data || []) as Place[])
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY)
    if (saved) { setPassword(saved); fetchCommunities(saved) }
  }, [])

  useEffect(() => {
    if (selectedId) fetchPlaces(selectedId)
    else setPlaces([])
  }, [selectedId])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthing(true)
    await fetchCommunities(password)
    setAuthing(false)
  }

  function handleLogout() {
    sessionStorage.removeItem(PW_KEY)
    setAuthed(false); setPassword(""); setCommunities([]); setSelectedId(null); setPlaces([])
  }

  async function saveCommunity() {
    if (!editingCommunity) return
    setSaving(true)
    const c = editingCommunity
    const { error } = await supabase.rpc("admin_upsert_vn_community", {
      p_password: password, p_id: c.id ?? null, p_slug: c.slug, p_city: c.city, p_city_vi: c.city_vi,
      p_district: c.district, p_name_zh: c.name_zh, p_name_vi: c.name_vi,
      p_description_zh: c.description_zh || null, p_description_vi: c.description_vi || null,
      p_population_note_zh: c.population_note_zh || null, p_population_note_vi: c.population_note_vi || null,
      p_lat: c.lat ?? null, p_lng: c.lng ?? null, p_cover_image_url: null,
      p_display_order: c.display_order ?? 0, p_is_active: c.is_active ?? true,
    })
    setSaving(false)
    if (error) { alert(error.message); return }
    setEditingCommunity(null)
    fetchCommunities(password)
  }

  async function deleteCommunity(id: string) {
    if (!confirm("Xoá khu vực này? Toàn bộ địa điểm bên trong cũng sẽ bị xoá.")) return
    const { error } = await supabase.rpc("admin_delete_vn_community", { p_password: password, p_id: id })
    if (error) { alert(error.message); return }
    if (selectedId === id) setSelectedId(null)
    fetchCommunities(password)
  }

  async function savePlace() {
    if (!editingPlace || !selectedId) return
    setSaving(true)
    const p = editingPlace
    const { error } = await supabase.rpc("admin_upsert_vn_place", {
      p_password: password, p_id: p.id ?? null, p_community_id: selectedId, p_category: p.category,
      p_name_zh: p.name_zh, p_name_vi: p.name_vi || null, p_address: p.address || null,
      p_phone: p.phone || null, p_lat: null, p_lng: null,
      p_notes_zh: p.notes_zh || null, p_notes_vi: p.notes_vi || null, p_display_order: p.display_order ?? 0,
    })
    setSaving(false)
    if (error) { alert(error.message); return }
    setEditingPlace(null)
    fetchPlaces(selectedId)
  }

  async function deletePlace(id: string) {
    if (!confirm("Xoá địa điểm này?")) return
    const { error } = await supabase.rpc("admin_delete_vn_place", { p_password: password, p_id: id })
    if (error) { alert(error.message); return }
    if (selectedId) fetchPlaces(selectedId)
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24">
        <form onSubmit={handleLogin} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} strokeWidth={2} />
          </div>
          <h1 className="font-bold text-gray-900 mb-1">Bản đồ người Việt — Quản trị</h1>
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

  const selected = communities.find(c => c.id === selectedId) || null

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
          <MapPin size={20} strokeWidth={2.2} className="text-red-500" /> Bản đồ người Việt
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchCommunities(password)}
            className="text-gray-400 hover:text-gray-700 border border-gray-200 rounded-xl p-2 transition">
            <RefreshCw size={15} strokeWidth={2.2} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleLogout}
            className="text-xs text-gray-400 border border-gray-200 rounded-xl px-3 py-2 hover:text-red-500 hover:bg-red-50 transition flex items-center gap-1">
            <LogOut size={13} strokeWidth={2.2} /> Đăng xuất
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Cột trái: danh sách khu vực */}
        <div className="lg:col-span-2 space-y-3">
          <button onClick={() => setEditingCommunity(emptyCommunity())}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl py-2.5 transition">
            <Plus size={15} strokeWidth={2.5} /> Thêm khu vực mới
          </button>

          {loading ? (
            <p className="text-center text-gray-400 text-sm py-8">Đang tải...</p>
          ) : communities.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Chưa có khu vực nào.</p>
          ) : (
            <div className="space-y-2">
              {communities.map(c => (
                <div key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`cursor-pointer bg-white border rounded-xl p-3 transition ${
                    selectedId === c.id ? "border-red-400 ring-1 ring-red-200" : "border-gray-100 hover:border-gray-200"
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {c.name_vi} {!c.is_active && <span className="text-[10px] text-gray-400">(ẩn)</span>}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{c.name_zh} · {c.district}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setEditingCommunity(c) }}
                        className="text-gray-300 hover:text-blue-500 p-1.5 transition"><Pencil size={13} /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteCommunity(c.id) }}
                        className="text-gray-300 hover:text-red-500 p-1.5 transition"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cột phải: địa điểm trong khu vực đang chọn */}
        <div className="lg:col-span-3 space-y-3">
          {!selected ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-sm">
              👈 Chọn một khu vực bên trái để quản lý địa điểm (chợ, quán ăn, nhà thờ...)
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-sm">
                  📍 Địa điểm tại {selected.name_vi}
                </h2>
                <button onClick={() => setEditingPlace(emptyPlace(selected.id))}
                  className="flex items-center gap-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 transition">
                  <Plus size={13} strokeWidth={2.5} /> Thêm địa điểm
                </button>
              </div>

              {placesLoading ? (
                <p className="text-center text-gray-400 text-sm py-8">Đang tải...</p>
              ) : places.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Chưa có địa điểm nào — bấm "Thêm địa điểm" để bắt đầu.</p>
              ) : (
                <div className="space-y-2">
                  {places.map(p => (
                    <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-red-500 uppercase mb-0.5">
                          {CATEGORIES.find(c => c.val === p.category)?.label || p.category}
                        </p>
                        <p className="font-semibold text-gray-900 text-sm">{p.name_vi || p.name_zh}</p>
                        {p.address && <p className="text-xs text-gray-500">📍 {p.address}</p>}
                        {p.phone && <p className="text-xs text-gray-500">☎️ {p.phone}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setEditingPlace(p)}
                          className="text-gray-300 hover:text-blue-500 p-1.5 transition"><Pencil size={13} /></button>
                        <button onClick={() => deletePlace(p.id)}
                          className="text-gray-300 hover:text-red-500 p-1.5 transition"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal: thêm/sửa khu vực */}
      {editingCommunity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setEditingCommunity(null)}>
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{editingCommunity.id ? "Sửa khu vực" : "Thêm khu vực mới"}</h3>
              <button onClick={() => setEditingCommunity(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-2.5">
              <Field label="Slug (URL, vd: dai-ly)"><input value={editingCommunity.slug || ""} onChange={e => setEditingCommunity({ ...editingCommunity, slug: e.target.value })} className="ipt" /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Quận/huyện (zh, khớp properties.district)"><input value={editingCommunity.district || ""} onChange={e => setEditingCommunity({ ...editingCommunity, district: e.target.value })} className="ipt" /></Field>
                <Field label="Thứ tự hiển thị"><input type="number" value={editingCommunity.display_order ?? 0} onChange={e => setEditingCommunity({ ...editingCommunity, display_order: Number(e.target.value) })} className="ipt" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Tên (zh)"><input value={editingCommunity.name_zh || ""} onChange={e => setEditingCommunity({ ...editingCommunity, name_zh: e.target.value })} className="ipt" /></Field>
                <Field label="Tên (vi)"><input value={editingCommunity.name_vi || ""} onChange={e => setEditingCommunity({ ...editingCommunity, name_vi: e.target.value })} className="ipt" /></Field>
              </div>
              <Field label="Mô tả (vi)"><textarea value={editingCommunity.description_vi || ""} onChange={e => setEditingCommunity({ ...editingCommunity, description_vi: e.target.value })} className="ipt" rows={2} /></Field>
              <Field label="Mô tả (zh)"><textarea value={editingCommunity.description_zh || ""} onChange={e => setEditingCommunity({ ...editingCommunity, description_zh: e.target.value })} className="ipt" rows={2} /></Field>
              <Field label="Ghi chú cộng đồng người Việt (vi)"><textarea value={editingCommunity.population_note_vi || ""} onChange={e => setEditingCommunity({ ...editingCommunity, population_note_vi: e.target.value })} className="ipt" rows={2} /></Field>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={editingCommunity.is_active ?? true} onChange={e => setEditingCommunity({ ...editingCommunity, is_active: e.target.checked })} />
                Hiển thị công khai
              </label>
            </div>
            <button onClick={saveCommunity} disabled={saving || !editingCommunity.slug || !editingCommunity.district}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition">
              {saving ? "Đang lưu..." : "Lưu khu vực"}
            </button>
          </div>
        </div>
      )}

      {/* Modal: thêm/sửa địa điểm */}
      {editingPlace && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setEditingPlace(null)}>
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{editingPlace.id ? "Sửa địa điểm" : "Thêm địa điểm mới"}</h3>
              <button onClick={() => setEditingPlace(null)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-2.5">
              <Field label="Loại địa điểm">
                <select value={editingPlace.category || "shop"} onChange={e => setEditingPlace({ ...editingPlace, category: e.target.value })} className="ipt">
                  {CATEGORIES.map(c => <option key={c.val} value={c.val}>{c.label}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Tên (zh)"><input value={editingPlace.name_zh || ""} onChange={e => setEditingPlace({ ...editingPlace, name_zh: e.target.value })} className="ipt" /></Field>
                <Field label="Tên (vi)"><input value={editingPlace.name_vi || ""} onChange={e => setEditingPlace({ ...editingPlace, name_vi: e.target.value })} className="ipt" /></Field>
              </div>
              <Field label="Địa chỉ"><input value={editingPlace.address || ""} onChange={e => setEditingPlace({ ...editingPlace, address: e.target.value })} className="ipt" /></Field>
              <Field label="Điện thoại"><input value={editingPlace.phone || ""} onChange={e => setEditingPlace({ ...editingPlace, phone: e.target.value })} className="ipt" /></Field>
              <Field label="Ghi chú (vi)"><textarea value={editingPlace.notes_vi || ""} onChange={e => setEditingPlace({ ...editingPlace, notes_vi: e.target.value })} className="ipt" rows={2} /></Field>
              <Field label="Ghi chú (zh)"><textarea value={editingPlace.notes_zh || ""} onChange={e => setEditingPlace({ ...editingPlace, notes_zh: e.target.value })} className="ipt" rows={2} /></Field>
            </div>
            <button onClick={savePlace} disabled={saving || !editingPlace.name_zh}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition">
              {saving ? "Đang lưu..." : "Lưu địa điểm"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  )
}
