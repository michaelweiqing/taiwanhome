"use client"
import { useState, useCallback, useRef } from "react"

interface Props { images: string[]; title: string }

export default function ImageGallery({ images, title }: Props) {
  const [active, setActive] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const len = images.length

  const prev = useCallback(() => setActive(a => (a - 1 + len) % len), [len])
  const next = useCallback(() => setActive(a => (a + 1) % len), [len])

  // Swipe trái/phải trên mobile
  function onTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX)
  }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStart - e.changedTouches[0].clientX
    if (diff > 50) next()
    if (diff < -50) prev()
  }

  if (len === 0) {
    return (
      <div className="w-full h-[240px] rounded-2xl bg-gray-100 flex items-center justify-center text-6xl text-gray-200">
        🏠
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Ảnh chính */}
      <div
        className="relative w-full h-[240px] sm:h-[380px] lg:h-[460px] rounded-2xl overflow-hidden bg-gray-100"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          key={active}
          src={images[active]}
          alt={`${title} ${active + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
          {active + 1} / {len}
        </div>

        {/* Prev / Next - luôn hiện trên mobile */}
        {len > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow-md flex items-center justify-center text-gray-800 text-lg">
              ‹
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow-md flex items-center justify-center text-gray-800 text-lg">
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip - cuộn ngang, KHÔNG xuống dòng */}
      {len > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {images.map((src, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                active === i
                  ? "border-red-500 scale-[1.04] shadow"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}>
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}