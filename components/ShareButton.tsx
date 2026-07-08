"use client"
import { useState, useRef, useEffect } from "react"
import { Share2, Link2, Check, X } from "lucide-react"
import { useLang } from "@/context/LangContext"

export default function ShareButton() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open])

  // Khoá cuộn nền khi bottom-sheet mobile đang mở
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  function getShareData() {
    const url = typeof window !== "undefined" ? window.location.href : "https://8386.tw"
    const title = "8386找房網 | Bất Động Sản Đài Loan"
    const text = lang === "zh"
      ? "台灣中越雙語房產平台，快來看看！"
      : "Nền tảng BĐS Đài Loan song ngữ Trung-Việt, xem thử nhé!"
    return { url, title, text }
  }

  async function handleClick() {
    const data = getShareData()
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data)
      } catch {
        /* người dùng huỷ chia sẻ — không làm gì */
      }
      return
    }
    setOpen(o => !o)
  }

  async function copyLink() {
    const { url } = getShareData()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => { setCopied(false); setOpen(false) }, 1200)
    } catch {
      /* clipboard bị chặn — bỏ qua */
    }
  }

  function shareTo(platform: "facebook" | "line") {
    const { url } = getShareData()
    const shareUrl = platform === "facebook"
      ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      : `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500")
    setOpen(false)
  }

  const FacebookIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  )

  const LineIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#06C755" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M12 2C6.477 2 2 5.686 2 10.222c0 4.06 3.548 7.463 8.34 8.11.325.07.766.216.878.497.101.255.066.654.032.912l-.142.855c-.043.255-.203.996.874.543 1.078-.454 5.813-3.424 7.933-5.863C21.36 13.716 22 12.026 22 10.222 22 5.686 17.523 2 12 2zm-4.13 10.61H6.36a.34.34 0 01-.34-.34V8.4a.34.34 0 01.34-.34h.34a.34.34 0 01.34.34v3.19h1.83a.34.34 0 01.34.34v.34a.34.34 0 01-.34.34zm1.86-.34a.34.34 0 01-.34.34h-.34a.34.34 0 01-.34-.34V8.4a.34.34 0 01.34-.34h.34a.34.34 0 01.34.34zm4.22 0a.34.34 0 01-.34.34h-.34a.35.35 0 01-.28-.14l-1.62-2.2v2.02a.34.34 0 01-.34.34h-.34a.34.34 0 01-.34-.34V8.4a.34.34 0 01.34-.34h.35c.106 0 .207.05.27.14l1.62 2.2V8.4a.34.34 0 01.34-.34h.34a.34.34 0 01.34.34zm3.55-2.87a.34.34 0 01-.34.34h-1.83v.72h1.83a.34.34 0 01.34.34v.34a.34.34 0 01-.34.34h-2.51a.34.34 0 01-.34-.34V8.4a.34.34 0 01.34-.34h2.51a.34.34 0 01.34.34z"/>
    </svg>
  )

  return (
    <div className="relative" ref={ref}>
      {/* Nút chia sẻ — Mobile: icon tròn màu đỏ nổi bật, dễ bấm */}
      <button
        onClick={handleClick}
        aria-label={lang === "zh" ? "分享網站" : "Chia sẻ trang web"}
        className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white shadow-md shadow-red-600/30 active:scale-95 transition"
      >
        <Share2 size={19} strokeWidth={2.3} />
      </button>

      {/* Nút chia sẻ — Desktop: dạng viền nhỏ gọn như cũ */}
      <button
        onClick={handleClick}
        aria-label={lang === "zh" ? "分享網站" : "Chia sẻ trang web"}
        className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition whitespace-nowrap"
      >
        <Share2 size={14} strokeWidth={2.2} />
        <span>{lang === "zh" ? "分享" : "Chia sẻ"}</span>
      </button>

      {/* ===== Mobile: bottom-sheet full width, icon to, dễ bấm bằng ngón cái ===== */}
      {open && (
        <div className="sm:hidden">
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setOpen(false)} />
          <div className="fixed left-0 right-0 bottom-0 z-[70] bg-white rounded-t-2xl shadow-2xl pb-[max(env(safe-area-inset-bottom),16px)]">
            <div className="flex justify-center pt-2.5 pb-1">
              <span className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="font-bold text-gray-900 text-sm">
                {lang === "zh" ? "分享網站" : "Chia sẻ trang web"}
              </span>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 transition">
                <X size={18} strokeWidth={2.2} className="text-gray-500" />
              </button>
            </div>
            <div className="px-4 pt-2 pb-2 grid grid-cols-3 gap-3">
              <button onClick={copyLink} className="flex flex-col items-center gap-1.5">
                <span className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                  {copied
                    ? <Check size={22} strokeWidth={2.3} className="text-green-500" />
                    : <Link2 size={22} strokeWidth={2.2} className="text-gray-500" />}
                </span>
                <span className="text-xs text-gray-600 text-center leading-tight">
                  {copied
                    ? (lang === "zh" ? "已複製！" : "Đã sao chép!")
                    : (lang === "zh" ? "複製連結" : "Sao chép")}
                </span>
              </button>

              <button onClick={() => shareTo("facebook")} className="flex flex-col items-center gap-1.5">
                <span className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  {FacebookIcon}
                </span>
                <span className="text-xs text-gray-600">Facebook</span>
              </button>

              <button onClick={() => shareTo("line")} className="flex flex-col items-center gap-1.5">
                <span className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  {LineIcon}
                </span>
                <span className="text-xs text-gray-600">LINE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Desktop: dropdown neo góc phải nút ===== */}
      {open && (
        <div className="hidden sm:block absolute right-0 top-[calc(100%+6px)] z-50 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            {copied
              ? <Check size={16} strokeWidth={2.2} className="text-green-500 shrink-0" />
              : <Link2 size={16} strokeWidth={2.2} className="text-gray-400 shrink-0" />}
            {copied
              ? (lang === "zh" ? "已複製連結！" : "Đã sao chép liên kết!")
              : (lang === "zh" ? "複製連結" : "Sao chép liên kết")}
          </button>

          <button
            onClick={() => shareTo("facebook")}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-50"
          >
            {FacebookIcon}
            Facebook
          </button>

          <button
            onClick={() => shareTo("line")}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-50"
          >
            {LineIcon}
            LINE
          </button>
        </div>
      )}
    </div>
  )
}
