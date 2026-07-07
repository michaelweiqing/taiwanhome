"use client"
import { useEffect, useState } from "react"
import { useLang } from "@/context/LangContext"
import { Home, X, Compass, ArrowUp } from "lucide-react"

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

    if (localStorage.getItem("pwa-dismissed")) return

    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
    const isIOSChrome = isIOS && /CriOS/i.test(ua)
    const isIOSFirefox = isIOS && /FxiOS/i.test(ua)

    if (isIOS && (isIOSChrome || isIOSFirefox || !isSafari)) {
      // iOS dùng trình duyệt khác Safari → nhắc mở Safari
      setTimeout(() => setShowBanner(true), 3000)
      return
    }

    // Bắt sự kiện beforeinstallprompt (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShowBanner(true), 3000)
    }
    window.addEventListener("beforeinstallprompt", handler as any)

    // iOS Safari → hướng dẫn thủ công
    if (isIOS && isSafari) {
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

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  const isIOSChrome = isIOS && /CriOS/i.test(ua)
  const isIOSNonSafari = isIOS && (isIOSChrome || !isSafari)

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
            <Home size={24} strokeWidth={2} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 text-sm">
              {lang === "zh" ? "加入主畫面" : "Thêm vào màn hình"}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              {isIOSNonSafari
                ? (lang === "zh"
                    ? "請用 Safari 開啟本頁面，才能加入主畫面"
                    : "Vui lòng mở trang này bằng Safari để cài app")
                : isIOS
                  ? (lang === "zh"
                      ? "點擊底部 分享 → 加入主畫面"
                      : "Nhấn nút Chia sẻ ↑ → Thêm vào màn hình chính")
                  : (lang === "zh"
                      ? "安裝App，快速找房更方便"
                      : "Cài app để tìm nhà nhanh hơn")}
            </div>
          </div>
          <button onClick={handleDismiss}
            className="text-gray-300 hover:text-gray-500 shrink-0 mt-0.5">
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* iOS Chrome / non-Safari → hướng dẫn mở Safari */}
        {isIOSNonSafari && (
          <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2.5 text-xs text-blue-700 flex items-start gap-2">
            <Compass size={16} strokeWidth={2} className="shrink-0" />
            <span>
              {lang === "zh"
                ? "複製網址 → 打開 Safari → 貼上網址 → 分享 → 加入主畫面"
                : "Copy link → Mở Safari → Dán link → Chia sẻ → Thêm vào màn hình"}
            </span>
          </div>
        )}

        {/* iOS Safari → hướng dẫn share */}
        {isIOS && !isIOSNonSafari && (
          <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
            <ArrowUp size={16} strokeWidth={2.2} />
            <span>
              {lang === "zh"
                ? "Safari → 分享 → 加入主畫面"
                : "Safari → Chia sẻ → Thêm vào màn hình"}
            </span>
          </div>
        )}

        {/* Android Chrome → nút cài */}
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
      </div>
    </div>
  )
}
