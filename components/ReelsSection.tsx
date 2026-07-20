"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useLang } from "@/context/LangContext"
import type { PropertyReel } from "@/lib/data"
import HlsVideo from "@/components/HlsVideo"
import ReelShareButton from "@/components/ReelShareButton"
import { Play, Volume2, VolumeX, X, ChevronLeft, ChevronRight, Clapperboard } from "lucide-react"

interface Props { reels: PropertyReel[] }

function formatReelPrice(reel: PropertyReel, lang: "zh" | "vi"): string {
  const price = Number(reel.price || 0)
  if (reel.listing_type === "rent") {
    return lang === "zh" ? `NT$${price.toLocaleString()}/月` : `NT$${price.toLocaleString()}/tháng`
  }
  return lang === "zh" ? `${price.toLocaleString()}萬` : `${price.toLocaleString()} vạn Đài tệ`
}

function ReelCard({ reel, lang, onOpen }: { reel: PropertyReel; lang: "zh" | "vi"; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapRef  = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = wrapRef.current
    const vid = videoRef.current
    if (!el || !vid) return
    const io = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? vid.play().catch(() => {}) : vid.pause() },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const title = lang === "zh" ? (reel.title_zh || reel.title_vi) : (reel.title_vi || reel.title_zh)

  return (
    <button ref={wrapRef} onClick={onOpen}
      className="relative shrink-0 w-[124px] h-[220px] rounded-2xl overflow-hidden bg-gray-900 snap-start text-left shadow-md active:scale-[0.97] transition">
      <HlsVideo ref={videoRef} src={reel.video_url} poster={reel.thumbnail_url || undefined}
        muted loop playsInline preload="metadata" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/10 pointer-events-none" />
      <div className="absolute top-2 left-2 bg-white/90 rounded-full p-1">
        <Play size={11} strokeWidth={2.5} className="text-red-600 fill-red-600" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        {reel.price != null && (
          <p className="text-white font-bold text-xs leading-tight mb-0.5 drop-shadow">
            {formatReelPrice(reel, lang)}
          </p>
        )}
        <p className="text-white/90 text-[10px] leading-tight line-clamp-2">{title}</p>
      </div>
    </button>
  )
}

function ReelViewer({ reels, startIndex, onClose }: { reels: PropertyReel[]; startIndex: number; onClose: () => void }) {
  const { lang } = useLang()
  const [index, setIndex] = useState(startIndex)
  const [muted, setMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reel = reels[index]

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    vid.currentTime = 0
    vid.muted = muted
    // Cố phát có tiếng theo yêu cầu (mở video = hành động click chủ động của khách).
    // Một số trình duyệt vẫn có thể chặn autoplay có âm thanh (chính sách tùy trình duyệt/thiết bị)
    // → nếu bị chặn, tự động fallback về tắt tiếng để video vẫn phát được thay vì đứng im.
    vid.play().catch(() => {
      if (!vid.muted) {
        vid.muted = true
        setMuted(true)
        vid.play().catch(() => {})
      }
    })
  }, [index, muted])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setIndex(i => Math.min(i + 1, reels.length - 1))
      if (e.key === "ArrowLeft") setIndex(i => Math.max(i - 1, 0))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [reels.length, onClose])

  if (!reel) return null
  const title = lang === "zh" ? (reel.title_zh || reel.title_vi) : (reel.title_vi || reel.title_zh)
  const listingId = reel.property_id
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/listings/${listingId}` : `/listings/${listingId}`
  const shareText = reel.price != null ? formatReelPrice(reel, lang) : (title || "")

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-white/10 rounded-full p-2">
        <X size={20} strokeWidth={2.2} />
      </button>

      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); setIndex(i => i - 1) }}
          className="hidden sm:flex absolute left-4 z-10 text-white/80 hover:text-white bg-white/10 rounded-full p-2">
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>
      )}
      {index < reels.length - 1 && (
        <button onClick={e => { e.stopPropagation(); setIndex(i => i + 1) }}
          className="hidden sm:flex absolute right-16 z-10 text-white/80 hover:text-white bg-white/10 rounded-full p-2">
          <ChevronRight size={22} strokeWidth={2.2} />
        </button>
      )}

      <div className="relative w-full max-w-[420px] h-full sm:h-[92vh] sm:rounded-2xl overflow-hidden bg-black"
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { (e.currentTarget as any)._x = e.touches[0].clientX }}
        onTouchEnd={e => {
          const startX = (e.currentTarget as any)._x
          const diff = e.changedTouches[0].clientX - startX
          if (diff < -50 && index < reels.length - 1) setIndex(i => i + 1)
          if (diff > 50 && index > 0) setIndex(i => i - 1)
        }}
      >
        <HlsVideo ref={videoRef} src={reel.video_url} muted={muted} playsInline autoPlay loop
          className="w-full h-full object-contain bg-black" onClick={() => setMuted(m => !m)} />

        <button onClick={() => setMuted(m => !m)}
          className="absolute top-4 left-4 text-white/90 bg-white/10 rounded-full p-2">
          {muted ? <VolumeX size={18} strokeWidth={2.2} /> : <Volume2 size={18} strokeWidth={2.2} />}
        </button>

        <div className="absolute top-4 right-16 sm:right-4 sm:top-16" onClick={e => e.stopPropagation()}>
          <ReelShareButton url={shareUrl} title={title || "8386找房網"} text={shareText} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 to-transparent">
          {reel.price != null && (
            <p className="text-white font-bold text-lg mb-1">{formatReelPrice(reel, lang)}</p>
          )}
          <p className="text-white/90 text-sm line-clamp-2 mb-3">{title}</p>
          <Link href={`/listings/${listingId}`}
            className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition">
            {lang === "zh" ? "查看物件詳情" : "Xem chi tiết tin đăng"}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ReelsSection({ reels }: Props) {
  const { lang } = useLang()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
            <Clapperboard size={17} strokeWidth={2.2} className="text-red-500" />
            {lang === "zh" ? "房屋短影音" : "Video ngắn về nhà"}
          </h2>
        </div>

        {reels.length === 0 ? (
          <div className="flex items-center gap-3 bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-4 py-5">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Clapperboard size={18} strokeWidth={2.2} />
            </div>
            <p className="text-sm text-gray-600">
              {lang === "zh" ? "尚無短影音" : "Chưa có video nào"}
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            {reels.map((reel, i) => (
              <ReelCard key={reel.id} reel={reel} lang={lang} onOpen={() => setOpenIndex(i)} />
            ))}
          </div>
        )}
      </div>

      {openIndex !== null && (
        <ReelViewer reels={reels} startIndex={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </div>
  )
}
