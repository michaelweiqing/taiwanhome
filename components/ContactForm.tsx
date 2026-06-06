"use client"
import { useState } from "react"
import { useLang } from "@/context/LangContext"

interface Props {
  agentName: string
  agentPhone: string
  agentLine: string
  propertyTitle: string
}

export default function ContactForm({ agentName, agentPhone, agentLine, propertyTitle }: Props) {
  const { lang } = useLang()
  const [form, setForm] = useState({ name: "", phone: "", message: "" })
  const [sent, setSent] = useState(false)

  const lineUrl = `https://line.me/R/ti/p/${agentLine}`
  const telUrl  = `tel:${agentPhone}`

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit() {
    if (!form.name || !form.phone) return
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ name: "", phone: "", message: "" })
  }

  return (
    <div className="space-y-4">

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
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="w-28 h-28 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-3xl shrink-0">
          {agentName.charAt(0)}
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-900 text-lg">{agentName}</p>
          <p className="text-base text-gray-500 mt-0.5">{agentPhone}</p>
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
            placeholder={lang === "zh" ? `詢問：${propertyTitle}` : `Hỏi về: ${propertyTitle}`}
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
