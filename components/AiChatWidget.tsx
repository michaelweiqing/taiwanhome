"use client"
// components/AiChatWidget.tsx
// Nút nổi 🤖 8386 AI cho mobile (mục 20-21) — mở panel trượt lên chứa AiChat.
// Chỉ hiện trên mobile (md:hidden) vì bản desktop đã có AiSearchBox ngay trên trang chủ.
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sparkles, X } from "lucide-react"
import AiChat from "@/components/AiChat"

export default function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Trang chủ đã có AiSearchBox inline — ẩn nút nổi ở đó để tránh trùng lặp
  if (pathname === "/") return null

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="8386 AI - Trợ lý tìm nhà"
          className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-orange-500 shadow-xl flex items-center justify-center active:scale-95 transition"
        >
          <Sparkles size={22} strokeWidth={2.2} className="text-white" />
        </button>
      )}

      {open && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/40 flex items-end" onClick={() => setOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white w-full rounded-t-2xl shadow-2xl flex flex-col"
            style={{ height: "85vh" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center">
                  <Sparkles size={14} strokeWidth={2.4} className="text-white" />
                </div>
                <span className="font-bold text-gray-900 text-sm">8386 AI — Trợ lý tìm nhà</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} strokeWidth={2.2} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden px-3 pb-3 pt-2">
              <AiChat compact />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
