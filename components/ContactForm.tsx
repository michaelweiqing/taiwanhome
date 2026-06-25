"use client"
import { useState } from "react"
import { useLang } from "@/context/LangContext"
import { createClient } from "@/lib/supabase-browser"

interface Props {
  agentName: string
  agentPhone: string
  agentLine: string
  propertyTitle: string
  propertyId: string
  agentAvatar?: string | null
  agentIsProfessional?: boolean
  agentDeveloper?: string | null
  agentCompany?: string | null
}

export default function ContactForm({ agentName, agentPhone, agentLine, propertyTitle, propertyId, agentAvatar, agentIsProfessional = false, agentDeveloper, agentCompany }: Props) {
  const { lang } = useLang()
  const [form, setForm] = useState({ name: "", phone: "", message: "" })
  const [sent, setSent] = useState(false)

  const lineUrl = agentLine
    ? (agentLine.startsWith("http") ? agentLine : `https://line.me/ti/p/${agentLine}`)
    : null
  const telUrl  = `tel:${agentPhone}`

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!form.name || !form.phone) return
    const supabase = createClient()
    await supabase.from("inquiries").insert({
      property_id: propertyId,
      title:       propertyTitle,
      name:        form.name,
      phone:       form.phone,
      message:     form.message || null,
      lang,
    })
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ name: "", phone: "", message: "" })
  }

  return (
    <div className="space-y-4">

      {/* Nút liên hệ */}
      <div className={`grid gap-2 ${lineUrl ? "grid-cols-2" : "grid-cols-1"}`}>
        <a href={telUrl}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition text-sm">
          📞 {lang === "zh" ? "立即致電" : "Gọi ngay"}
        </a>
        {lineUrl && (
          <a href={lineUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b04c] text-white font-bold py-2.5 rounded-xl transition text-sm">
            💬 LINE
          </a>
        )}
      </div>

      {/* Thông tin đại lý */}
      <div className="flex flex-col items-center gap-3 py-2">
        {agentAvatar ? (
          <img
            src={agentAvatar}
            alt={agentName}
            className="rounded-full object-cover object-top border-2 border-red-100 shrink-0"
            style={{ width: 112, height: 112 }}
          />
        ) : (
          <div className="rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-3xl shrink-0"
            style={{ width: 112, height: 112 }}>
            {agentName.charAt(0)}
          </div>
        )}
        <div className="text-center">
          <p className="font-bold text-gray-900 text-lg">{agentName}</p>
          <p className="text-base text-gray-500 mt-0.5">{agentPhone}</p>
        </div>
      </div>

      {/* Thông tin công ty — chỉ hiện nếu là môi giới chuyên nghiệp */}
      {agentIsProfessional && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1 text-xs text-gray-600 border border-gray-100">
          <p className="font-bold text-gray-800 text-sm">
            {lang === "zh" ? "永慶不動產" : "Công ty môi giới Vĩnh Khánh (永慶不動產)"}
          </p>
          <p>好市多德聚仁加盟店</p>
          <p className="pt-1">
            {lang === "zh"
              ? "營業員證號：(113)登字第456212號"
              : "Giấy phép hành nghề số (113) 登字第456212號"}
          </p>
          <p>經紀人證號：陳秀貞（104）中市經紀字第01633號</p>
          {agentDeveloper && (
            <p className="border-t border-gray-200 mt-2 pt-2">
              {lang === "zh" ? "開發承辦人：" : "Người phụ trách: "}{agentDeveloper}
            </p>
          )}
          {agentCompany && (
            <p>
              {lang === "zh" ? "公司名稱：" : "Công ty: "}{agentCompany}
            </p>
          )}
        </div>
      )}

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
