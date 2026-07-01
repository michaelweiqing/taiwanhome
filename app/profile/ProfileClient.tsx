"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import { formatPrice } from "@/lib/data"
import type { Property } from "@/lib/data"
import { useLang } from "@/context/LangContext"

interface UserSession { phone: string; name: string }

export default function ProfileClient() {
  const { lang } = useLang()
  const router   = useRouter()
  const supabase = createClient()

  const [user, setUser]         = useState<UserSession | null>(null)
  const [listings, setListings] = useState<Property[]>([])
  const [loading, setLoading]   = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  function handleLogout() {
    localStorage.removeItem("taiwanhome_user")
    router.push("/login")
  }

  if (!user) return <div className="text-center py-20 text-gray-400">Đang kiểm tra đăng nhập...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

      {/* Thông tin tài khoản */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-2xl font-black shrink-0">
          {(user.name || user.phone).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">{user.name || user.phone}</p>
          <p className="text-sm text-gray-400">📱 {user.phone}</p>
        </div>
        <button onClick={handleLogout}
          className="text-xs text-gray-400 border border-gray-200 rounded-xl px-3 py-2 hover:text-red-500 hover:bg-red-50 transition shrink-0">
          {lang === "zh" ? "登出" : "Đăng xuất"}
        </button>
      </div>

      {/* Đăng tin mới */}
      <Link href="/submit"
        className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition text-sm">
        ➕ {lang === "zh" ? "刊登新物件" : "Đăng tin mới"}
      </Link>

      {/* Danh sách tin đăng */}
      <div>
        <h2 className="text-base font-black text-gray-900 mb-3">
          🏠 {lang === "zh" ? "我的刊登" : "Tin đăng của tôi"} {listings.length > 0 && `(${listings.length})`}
        </h2>

        {loading ? (
          <p className="text-gray-400 text-center py-16 text-sm">Đang tải...</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
            <p className="text-4xl mb-3">📭</p>
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
            {listings.map(p => {
              const title = lang === "zh" ? (p.title_zh || p.title_vi) : (p.title_vi || p.title_zh)
              const img = p.images?.[0]
              return (
                <div key={p.id} className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-3 shadow-sm">
                  <Link href={`/listings/${p.id}`} className="shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                      {img ? <img src={img} className="w-full h-full object-cover" /> : <span className="text-2xl">🏠</span>}
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
                      <span className="text-[11px] text-gray-400">👁 {p.views || 0} {lang==="zh"?"次瀏覽":"lượt xem"}</span>
                      <div className="flex items-center gap-3">
                        <Link href={`/submit/edit/${p.id}`}
                          className="text-[11px] text-gray-400 hover:text-blue-600 transition">
                          {lang==="zh" ? "✏️ 編輯" : "✏️ Sửa"}
                        </Link>
                        <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                          className="text-[11px] text-gray-400 hover:text-red-500 disabled:opacity-40 transition">
                          {deletingId === p.id ? "..." : (lang==="zh" ? "🗑 刪除" : "🗑 Xoá")}
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
    </div>
  )
}
