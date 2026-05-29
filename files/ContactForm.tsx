"use client"
// components/ContactForm.tsx — Form liên hệ sidebar

import { useState } from "react"
import type { Property } from "@/lib/data"
import { formatPrice } from "@/lib/data"
import { useLang } from "@/context/LangContext"

export default function ContactForm({ property: p }: { property: Property }) {
  const { lang, t } = useLang()
  const [name, setName]       = useState("")
  const [phone, setPhone]     = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus]   = useState<"idle"|"sending"|"sent">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    // TODO: thay bằng fetch("/api/contact", ...) khi có backend
    await new Promise(r => setTimeout(r, 900))
    setStatus("sent")
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-4 shadow-sm">

      {/* Header — giá */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 text-white">
        <p className="text-[11px] text-red-200 mb-0.5 uppercase tracking-wide">
          {p.listing_type === "rent" ? (lang === "zh" ? "月租金" : "Tiền thuê/tháng") : (lang === "zh" ? "售價" : "Giá bán")}
        </p>
        <p className="text-2xl font-bold leading-none">{formatPrice(p, lang)}</p>
        {p.price_per_ping && (
          <p className="text-red-200 text-xs mt-1">
            {lang === "zh" ? `每坪 ${p.price_per_ping.toLocaleString()}萬` : `${p.price_per_ping.toLocaleString()} vạn/ping`}
          </p>
        )}
      </div>

      {/* Nút hành động nhanh */}
      <div className="grid grid-cols-2 gap-2 p-3 border-b border-gray-100">
        <a
          href={`tel:${p.agent_phone}`}
          className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700
                     text-white py-2.5 rounded-xl text-sm font-semibold transition"
        >
          📞 {t.callNow}
        </a>
        <a
          href={`https://line.me/ti/p/~${p.agent_line}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600
                     text-white py-2.5 rounded-xl text-sm font-semibold transition"
        >
          💬 {t.lineContact}
        </a>
      </div>

      {/* Thông tin môi giới */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-sm
                        flex items-center justify-center shrink-0">
          {p.agent_name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{p.agent_name}</p>
          <p className="text-gray-400 text-xs">{p.agent_phone}</p>
        </div>
        <button
          onClick={() => setStatus("idle")}
          className="ml-auto text-[11px] text-red-600 border border-red-200 rounded-lg px-2.5 py-1
                     hover:bg-red-50 transition shrink-0"
        >
          {t.scheduleVisit}
        </button>
      </div>

      {/* Form hỏi */}
      <div className="p-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">{t.contactForm}</p>

        {status === "sent" ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm text-center">
            {t.sent}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={t.yourName} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
            />
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder={t.yourPhone} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition"
            />
            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100
                         transition resize-none"
            />
            <button
              type="submit" disabled={status === "sending"}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300
                         text-white py-3 rounded-xl text-sm font-semibold transition"
            >
              {status === "sending" ? t.sending : t.send}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
