"use client"
import { useState, useCallback, useEffect } from "react"
import { Home, X } from "lucide-react"

interface Props { images: string[]; title: string }

export default function ImageGallery({ images, title }: Props) {
  const [active, setActive]       = useState(0)
  const [lightbox, setLightbox]   = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const len = images.length

  const prev = useCallback(() => setActive(a => (a - 1 + len) % len), [len])
  const next = useCallback(() => setActive(a => (a + 1) % len), [len])

  // Khoá scroll body khi lightbox mở
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [lightbox])

  // Keyboard nav
  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft")  prev()
      if (e.key === "Escape")     setLightbox(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [lightbox, prev, next])

  function onTouchStart(e: React.TouchEvent) { setTouchStart(e.touches[0].clientX) }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStart - e.changedTouches[0].clientX
    if (diff > 50)  next()
    if (diff < -50) prev()
  }

  if (len === 0) {
    return (
      <div className="w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-200"
        style={{ aspectRatio: "4/3" }}><Home size={56} strokeWidth={1.5} /></div>
    )
  }

  return (
    <>
      {/* ── Gallery thường ── */}
      <div className="w-full space-y-2">
        {/* Ảnh chính */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in"
          style={{ aspectRatio: "4/3" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setLightbox(true)}>
          <img
            key={active}
            src={images[active]}
            alt={`${title} ${active + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            {active + 1} / {len}
          </div>
          {/* Hint icon fullscreen */}
          <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 md:hidden">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
            {len > 1 ? `1/${len}` : ""}
          </div>
          {len > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center text-gray-800 text-lg">‹</button>
              <button onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center text-gray-800 text-lg">›</button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {len > 1 && (
          <div className="w-full overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <div className="flex gap-2 pb-1" style={{ width: "max-content" }}>
              {images.map((src, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    active === i ? "border-red-500 shadow" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ width: 64, height: 48 }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox fullscreen ── */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 shrink-0">
            <span className="text-white text-sm font-medium">{active + 1} / {len}</span>
            <button onClick={() => setLightbox(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition">
              <X size={20} strokeWidth={2.2} />
            </button>
          </div>

          {/* Ảnh fullscreen */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <img
              key={active}
              src={images[active]}
              alt={`${title} ${active + 1}`}
              className="max-w-full max-h-full object-contain select-none"
            />

            {len > 1 && (
              <>
                <button onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-2xl transition">
                  ‹
                </button>
                <button onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-2xl transition">
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip dưới */}
          {len > 1 && (
            <div className="shrink-0 overflow-x-auto px-4 py-3 bg-black/80"
              style={{ scrollbarWidth: "none" }}>
              <div className="flex gap-2" style={{ width: "max-content" }}>
                {images.map((src, i) => (
                  <button key={i} onClick={() => setActive(i)}
                    className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      active === i ? "border-red-500" : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                    style={{ width: 56, height: 42 }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
