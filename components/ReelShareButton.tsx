"use client"
import { useState, useRef, useEffect } from "react"
import { Link2, Check } from "lucide-react"
import { useLang } from "@/context/LangContext"

interface Props {
  url: string
  title: string
  text: string
}

// Nút chia sẻ dùng riêng cho Reel viewer (khác ShareButton.tsx dùng cho trang chung)
// vì cần chia sẻ đúng link property_id của reel đang xem, không phải URL trang hiện tại.
export default function ReelShareButton({ url, title, text }: Props) {
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

  function isMobileViewport() {
    if (typeof window === "undefined") return false
    return window.matchMedia("(max-width: 640px)").matches
  }

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    // Trên mobile, ưu tiên share sheet hệ thống (đã có sẵn LINE/Zalo/Instagram nếu
    // khách cài app) — chỉ mở panel riêng khi không có navigator.share hoặc trên desktop.
    if (isMobileViewport() && typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ url, title, text }) } catch { /* huỷ chia sẻ */ }
      return
    }
    setOpen(o => !o)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => { setCopied(false); setOpen(false) }, 1200)
    } catch { /* clipboard bị chặn — bỏ qua */ }
  }

  function shareTo(platform: "facebook" | "line" | "zalo", e: React.MouseEvent) {
    e.stopPropagation()
    const shareUrl =
      platform === "facebook" ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      : platform === "line" ? `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`
      : `https://zalo.me/share?u=${encodeURIComponent(url)}`
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500")
    setOpen(false)
  }

  // Instagram không có share-intent URL công khai cho link (giới hạn từ Instagram) —
  // dùng share sheet hệ thống nếu có (mobile, đã cài app Instagram), nếu không thì
  // copy link để khách tự dán vào Instagram (tin nhắn/story).
  async function shareToInstagram(e: React.MouseEvent) {
    e.stopPropagation()
    if (isMobileViewport() && typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ url, title, text }); setOpen(false); return } catch { /* huỷ chia sẻ */ }
      return
    }
    await copyLink()
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

  // Zalo chưa đăng ký Official Account nên không dùng widget SDK chính thức được —
  // dùng monogram "Z" đơn giản, không vi phạm bản quyền logo.
  const ZaloIcon = (
    <span className="w-5 h-5 rounded-md bg-[#0068FF] text-white text-[11px] font-black flex items-center justify-center shrink-0">
      Z
    </span>
  )

  // Instagram: dùng khung camera vẽ tay đơn giản (không tái tạo logo gốc)
  const InstagramIcon = (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0%" stopColor="#FFB800" />
          <stop offset="50%" stopColor="#E1306C" />
          <stop offset="100%" stopColor="#5851DB" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="#E1306C" stroke="none" />
    </svg>
  )

  // Icon nút chia sẻ chính — mũi tên "share" + khung video/play, nền gradient cam
  const ShareVideoIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.2 15.3c0-3.6 2.6-6.3 6-6.3h.9V5.6l5.2 4.6-5.2 4.6v-3.4h-.9c-2.3 0-4.1 1.9-4.1 4.2v.9"
        stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <rect x="5.6" y="15.3" width="9.2" height="6.3" rx="1.4" fill="white"/>
      <path d="M8.9 17.1v2.7l2.7-1.35-2.7-1.35z" fill="#EA580C"/>
    </svg>
  )

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        aria-label={lang === "zh" ? "分享影片" : "Chia sẻ video"}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-md shadow-orange-900/30 hover:brightness-105 active:scale-95 transition"
      >
        {ShareVideoIcon}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <button onClick={e => { e.stopPropagation(); copyLink() }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
            {copied
              ? <Check size={16} strokeWidth={2.2} className="text-green-500 shrink-0" />
              : <Link2 size={16} strokeWidth={2.2} className="text-gray-400 shrink-0" />}
            {copied
              ? (lang === "zh" ? "已複製連結！" : "Đã sao chép liên kết!")
              : (lang === "zh" ? "複製連結" : "Sao chép liên kết")}
          </button>

          <button onClick={e => shareTo("facebook", e)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-50">
            {FacebookIcon} Facebook
          </button>

          <button onClick={e => shareTo("line", e)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-50">
            {LineIcon} LINE
          </button>

          <button onClick={e => shareTo("zalo", e)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-50">
            {ZaloIcon} Zalo
          </button>

          <button onClick={shareToInstagram}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-50">
            {InstagramIcon}
            Instagram
          </button>
        </div>
      )}
    </div>
  )
}
