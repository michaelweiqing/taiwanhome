"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import { formatPrice } from "@/lib/data"
import type { Property } from "@/lib/data"
import { useLang } from "@/context/LangContext"
import { Smartphone, Plus, Home, Inbox, Eye, Pencil, Trash2, EyeOff, RotateCcw, Archive } from "lucide-react"

interface UserSession { phone: string; name: string }

export default function ProfileClient() {
  const { lang } = useLang()
  const router   = useRouter()
  const supabase = createClient()

  const [user, setUser]         = useState<UserSession | null>(null)
  const [listings, setListings] = useState<Property[]>([])
  const [loading, setLoading]   = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("taiwanhome_user")
    if (!stored) { router.replace("/login"); return }
    const u = JSON.parse(stored) as UserSession
    setUser(u)
    fetchListings(u.phone)
  }, [])

  async function fetchListings(phone: string) {
    setLoading(true)
    const { data } = await supabase
      .from("user_listings")
      .select("*")
      .eq("submitted_by", phone)
      .order("posted_at", { ascending: false })
    setListings((data || []) as Property[])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!user) return
    const ok = confirm(lang === "zh" ? "確定要刪除這則刊登嗎？此操作無法復原。" : "Bạn chắc chắn muốn xoá tin này? Không thể hoàn tác.")
    if (!ok) return
    setDeletingId(id)
    const { data, error } = await supabase.rpc("delete_own_user_listing", { p_id: id, p_phone: user.phone })
    if (!error && data) setListings(ls => ls.filter(l => l.id !== id))
    setDeletingId(null)
  }

  async function handleToggleActive(id: string, active: boolean) {
    if (!user) return
    setTogglingId(id)
    const { error } = await supabase.rpc("set_own_user_listing_active", { p_id: id, p_phone: user.phone, p_active: active })
    if (!error) setListings(ls => ls.map(l => l.id === id ? { ...l, is_active: active } : l))
    setTogglingId(null)
  }

  function handleLogout() {
    localStorage.removeItem("taiwanhome_user")
    router.push("/login")
  }

  if (!user) return <div className="text-center py-20 text-gray-400">Đang kiểm tra đăng nhập...</div>

  const activeListings   = listings.filter(l => l.is_active !== false)
  const inactiveListings = listings.filter(l => l.is_active === false)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

      {/* Thông tin tài khoản */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl font-black shrink-0">
          {(user.name || user.phone).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">{user.name || user.phone}</p>
          <p className="text-sm text-gray-400 flex items-center gap-1"><Smartphone size={12} strokeWidth={2.2} /> {user.phone}</p>
        </div>
        <button onClick={handleLogout}
          className="text-xs text-gray-400 border border-gray-200 rounded-xl px-3 py-2 hover:text-red-500 hover:bg-red-50 transition shrink-0">
          {lang === "zh" ? "登出" : "Đăng xuất"}
        </button>
      </div>

      {/* Đăng tin mới */}
      <Link href="/submit"
        className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition text-sm">
        <Plus size={16} strokeWidth={2.5} /> {lang === "zh" ? "刊登新物件" : "Đăng tin mới"}
      </Link>

      {/* Danh sách tin đăng đang hoạt động */}
      <div>
        <h2 className="text-base font-black text-gray-900 mb-3 flex items-center gap-1.5">
          <Home size={16} strokeWidth={2.2} className="text-red-500" /> {lang === "zh" ? "我的刊登" : "Tin đăng của tôi"} {activeListings.length > 0 && `(${activeListings.length})`}
        </h2>

        {loading ? (
          <p className="text-gray-400 text-center py-16 text-sm">Đang tải...</p>
        ) : activeListings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
            <Inbox size={36} strokeWidth={1.5} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 text-sm mb-4">
              {lang === "zh" ? "尚無刊登物件" : "Bạn chưa có tin đăng nào"}
            </p>
            <Link href="/submit"
              className="inline-block text-sm font-bold text-red-600 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition">
              {lang === "zh" ? "立即刊登" : "Đăng tin ngay"}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeListings.map(p => {
              const title = lang === "zh" ? (p.title_zh || p.title_vi) : (p.title_vi || p.title_zh)
              const img = p.images?.[0]
              return (
                <div key={p.id} className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-3 shadow-sm">
                  <Link href={`/listings/${p.id}`} className="shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                      {img ? <img src={img} className="w-full h-full object-cover" /> : <Home size={22} strokeWidth={1.8} className="text-gray-300" />}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${
                        p.listing_type === "rent" ? "bg-blue-600" : "bg-emerald-600"
                      }`}>
                        {p.listing_type === "rent" ? (lang==="zh"?"出租":"Cho thuê") : (lang==="zh"?"出售":"Bán")}
                      </span>
                      <span className="text-[10px] text-gray-300">
                        {new Date(p.posted_at).toLocaleDateString(lang==="zh"?"zh-TW":"vi-VN")}
                      </span>
                    </div>
                    <Link href={`/listings/${p.id}`} className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-red-600 transition">
                      {title}
                    </Link>
                    <p className="text-red-600 font-bold text-sm mt-0.5">{formatPrice(p, lang)}</p>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-[11px] text-gray-400 flex items-center gap-0.5"><Eye size={12} strokeWidth={2.2} /> {p.views || 0} {lang==="zh"?"次瀏覽":"lượt xem"}</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleToggleActive(p.id, false)} disabled={togglingId === p.id}
                          className="text-[11px] text-gray-400 hover:text-amber-600 disabled:opacity-40 transition flex items-center gap-0.5">
                          <EyeOff size={11} strokeWidth={2.2} /> {lang==="zh" ? "下架" : "Gỡ tin"}
                        </button>
                        <Link href={`/submit/edit/${p.id}`}
                          className="text-[11px] text-gray-400 hover:text-blue-600 transition flex items-center gap-0.5">
                          <Pencil size={11} strokeWidth={2.2} /> {lang==="zh" ? "編輯" : "Sửa"}
                        </Link>
                        <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                          className="text-[11px] text-gray-400 hover:text-red-500 disabled:opacity-40 transition flex items-center gap-0.5">
                          {deletingId === p.id ? "..." : <><Trash2 size={11} strokeWidth={2.2} /> {lang==="zh" ? "刪除" : "Xoá"}</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tin đã gỡ / tắt quảng cáo — không hiển thị công khai, có thể đăng lại khi cần */}
      {!loading && inactiveListings.length > 0 && (
        <div>
          <h2 className="text-base font-black text-gray-900 mb-3 flex items-center gap-1.5">
            <Archive size={16} strokeWidth={2.2} className="text-gray-400" /> {lang === "zh" ? "已下架的刊登" : "Tin đã gỡ"} ({inactiveListings.length})
          </h2>
          <p className="text-xs text-gray-400 -mt-2 mb-3">
            {lang === "zh" ? "不會顯示給其他人，可隨時重新上架" : "Chỉ mình bạn thấy, không hiển thị công khai — có thể đăng lại bất cứ lúc nào"}
          </p>
          <div className="space-y-3">
            {inactiveListings.map(p => {
              const title = lang === "zh" ? (p.title_zh || p.title_vi) : (p.title_vi || p.title_zh)
              const img = p.images?.[0]
              return (
                <div key={p.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex gap-3">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0 grayscale opacity-70">
                    {img ? <img src={img} className="w-full h-full object-cover" /> : <Home size={22} strokeWidth={1.8} className="text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-gray-400">
                        {lang==="zh" ? "已下架" : "Đã gỡ"}
                      </span>
                      <span className="text-[10px] text-gray-300">
                        {new Date(p.posted_at).toLocaleDateString(lang==="zh"?"zh-TW":"vi-VN")}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 line-clamp-1">{title}</p>
                    <p className="text-gray-500 font-bold text-sm mt-0.5">{formatPrice(p, lang)}</p>
                    <div className="mt-auto flex items-center justify-end gap-3 pt-1">
                      <button onClick={() => handleToggleActive(p.id, true)} disabled={togglingId === p.id}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-40 transition flex items-center gap-0.5">
                        <RotateCcw size={11} strokeWidth={2.2} /> {togglingId === p.id ? "..." : (lang==="zh" ? "重新上架" : "Đăng lại")}
                      </button>
                      <Link href={`/submit/edit/${p.id}`}
                        className="text-[11px] text-gray-400 hover:text-blue-600 transition flex items-center gap-0.5">
                        <Pencil size={11} strokeWidth={2.2} /> {lang==="zh" ? "編輯" : "Sửa"}
                      </Link>
                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                        className="text-[11px] text-gray-400 hover:text-red-500 disabled:opacity-40 transition flex items-center gap-0.5">
                        {deletingId === p.id ? "..." : <><Trash2 size={11} strokeWidth={2.2} /> {lang==="zh" ? "刪除" : "Xoá"}</>}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
