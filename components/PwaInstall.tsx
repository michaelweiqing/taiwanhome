"use client"
import { useEffect, useState } from "react"
import { useLang } from "@/context/LangContext"

export default function PwaInstall() {
  const { lang } = useLang()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Đăng ký Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error)
    }

    // Kiểm tra đã cài chưa (standalone = đã cài)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true)
      return
    }

    // Bắt sự kiện beforeinstallprompt (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Hiện banner sau 3 giây
      setTimeout(() => setShowBanner(true), 3000)
    }
    window.addEventListener("beforeinstallprompt", handler as any)

    // iOS: hiện hướng dẫn thủ công nếu Safari
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isIOS && isSafari && !localStorage.getItem("pwa-dismissed")) {
      setTimeout(() => setShowBanner(true), 3000)
    }

    return () => window.removeEventListener("beforeinstallprompt", handler as any)
  }, [])

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") setInstalled(true)
      setDeferredPrompt(null)
    }
    setShowBanner(false)
  }

  function handleDismiss() {
    setShowBanner(false)
    localStorage.setItem("pwa-dismissed", "1")
  }

  if (installed || !showBanner) return null

  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0 text-2xl">
            🏠
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 text-sm">
              {lang === "zh" ? "加入主畫面" : "Thêm vào màn hình"}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              {isIOS
                ? (lang === "zh"
                    ? '點擊底部 分享 → 加入主畫面'
                    : 'Nhấn nút Chia sẻ ↑ → Thêm vào màn hình chính')
                : (lang === "zh"
                    ? '安裝App，快速找房更方便'
                    : 'Cài app để tìm nhà nhanh hơn')}
            </div>
          </div>
          <button onClick={handleDismiss}
            className="text-gray-300 hover:text-gray-500 text-lg leading-none shrink-0 mt-0.5">
            ✕
          </button>
        </div>

        {!isIOS && (
          <div className="flex gap-2 mt-3">
            <button onClick={handleDismiss}
              className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-xl py-2 hover:bg-gray-50 transition">
              {lang === "zh" ? "稍後" : "Để sau"}
            </button>
            <button onClick={handleInstall}
              className="flex-1 text-sm bg-red-600 text-white rounded-xl py-2 font-semibold hover:bg-red-700 transition">
              {lang === "zh" ? "立即安裝" : "Cài ngay"}
            </button>
          </div>
        )}

        {isIOS && (
          <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
            <span className="text-base">⬆️</span>
            <span>
              {lang === "zh"
                ? "Safari → 分享 → 加入主畫面"
                : "Safari → Chia sẻ → Thêm vào màn hình"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
