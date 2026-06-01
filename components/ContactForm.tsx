"use client"
import { useState } from "react"
import type { Property } from "@/lib/data"
import { useLang } from "@/context/LangContext"

interface Props { property: Property }

export default function ContactForm({ property: p }: Props) {
  const { lang } = useLang()
  const [form, setForm] = useState({ name: "", phone: "", message: "" })
  const [sent, setSent] = useState(false)

  const agentName = lang === "zh" ? p.agent_name : (p.agent_name_vi || p.agent_name)
  const avatar    = p.agent_avatar || null

  const lineUrl = `https://line.me/R/ti/p/${p.agent_line}`
  const telUrl  = `tel:${p.agent_phone}`

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit() {
    if (!form.name || !form.phone) return
    // TODO: gửi về Supabase hoặc email
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ name: "", phone: "", message: "" })
  }

  return (
    <div className="sticky top-4 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">

      {/* Giá */}
      <div className="bg-red-600 text-white rounded-xl p-4">
        <p className="text-xs font-medium opacity-80 mb-1">
          {lang === "zh" ? (p.listing_type === "rent" ? "月租金" : "售價") : (p.listing_type === "rent" ? "GIÁ THUÊ" : "GIÁ BÁN")}
        </p>
        <p className="text-2xl font-black">
          {p.listing_type === "rent"
            ? `NT$${p.price.toLocaleString()}${lang === "zh" ? "/月" : "/tháng"}`
            : `${p.price.toLocaleString()}${lang === "zh" ? "萬" : " vạn NTD"}`}
        </p>
        {p.price_per_ping && (
          <p className="text-xs opacity-80 mt-0.5">
            {p.price_per_ping.toLocaleString()}{lang === "zh" ? "萬/ping" : " vạn/ping"}
          </p>
        )}
      </div>

      {/* Nút liên hệ */}
      <div className="grid grid-cols-2 gap-2">
        <a href={telUrl}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition text-sm">
          📞 {lang === "zh" ? "立即致電" : "Gọi ngay"}
        </a>
        <a href={lineUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b04c] text-white font-bold py-2.5 rounded-xl transition text-sm">
          💬 LINE
        </a>
      </div>

      {/* Thông tin đại lý */}
      <div className="flex items-center gap-3 py-1">
        {avatar ? (
          <img src={avatar} alt={agentName}
            className="w-12 h-12 rounded-full object-cover border-2 border-red-100 shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg shrink-0">
            {agentName.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-bold text-gray-900">{agentName}</p>
          <p className="text-sm text-gray-500">{p.agent_phone}</p>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Form tư vấn */}
      <div>
        <p className="font-semibold text-gray-800 mb-3 text-sm">
          {lang === "zh" ? "預約看屋" : "Gửi yêu cầu tư vấn"}
        </p>
        <div className="space-y-2">
          <input name="name" value={form.name} onChange={handleChange}
            placeholder={lang === "zh" ? "姓名 *" : "Họ tên *"}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 transition" />
          <input name="phone" value={form.phone} onChange={handleChange}
            placeholder={lang === "zh" ? "電話 *" : "Số điện thoại *"}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 transition" />
          <textarea name="message" value={form.message} onChange={handleChange}
            rows={3}
            placeholder={lang === "zh" ? "留言..." : "Ví dụ: Tôi muốn đặt lịch xem nhà, ngày nào tiện?"}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 transition resize-none" />
          <button onClick={handleSubmit}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition text-sm">
            {sent
              ? (lang === "zh" ? "✅ 已送出！" : "✅ Đã gửi!")
              : (lang === "zh" ? "送出" : "Gửi ngay")}
          </button>
        </div>
      </div>
    </div>
  )
}