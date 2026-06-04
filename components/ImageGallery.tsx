"use client"
import { useState, useCallback } from "react"

interface Props { images: string[]; title: string }

export default function ImageGallery({ images, title }: Props) {
  const [active, setActive] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const len = images.length

  const prev = useCallback(() => setActive(a => (a-1+len)%len), [len])
  const next = useCallback(() => setActive(a => (a+1)%len), [len])

  function onTouchStart(e: React.TouchEvent) { setTouchStart(e.touches[0].clientX) }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStart - e.changedTouches[0].clientX
    if (diff > 50) next()
    if (diff < -50) prev()
  }

  if (len === 0) {
    return (
      <div className="w-full rounded-2xl bg-gray-100 flex items-center justify-center text-6xl text-gray-200"
        style={{ aspectRatio:"4/3" }}>🏠</div>
    )
  }

  return (
    <div className="w-full space-y-2">
      {/* Ảnh chính — dùng aspect ratio thay chiều cao cố định */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gray-100"
        style={{ aspectRatio:"4/3" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}>
        <img
          key={active}
          src={images[active]}
          alt={`${title} ${active+1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
          {active+1} / {len}
        </div>
        {len > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center text-gray-800 text-lg">‹</button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow flex items-center justify-center text-gray-800 text-lg">›</button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {len > 1 && (
        <div className="w-full overflow-x-auto"
          style={{ scrollbarWidth:"none", msOverflowStyle:"none" }}>
          <div className="flex gap-2 pb-1" style={{ width:"max-content" }}>
            {images.map((src, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  active===i ? "border-red-500 shadow" : "border-transparent opacity-60 hover:opacity-100"
                }`}
                style={{ width:64, height:48 }}>
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
