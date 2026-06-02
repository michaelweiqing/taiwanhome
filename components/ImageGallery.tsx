"use client"
// components/ImageGallery.tsx — Gallery ảnh: ảnh lớn + thumbnail strip

import { useState, useCallback } from "react"

interface Props { images: string[]; title: string }

export default function ImageGallery({ images, title }: Props) {
  const [active, setActive] = useState(0)
  const len = images.length

  const prev = useCallback(() => setActive(a => (a - 1 + len) % len), [len])
  const next = useCallback(() => setActive(a => (a + 1) % len), [len])

  if (len === 0) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-gray-100 flex items-center justify-center text-6xl text-gray-200">
        🏠
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* ── Ảnh chính ── */}
      <div className="relative w-full h-[240px] sm:h-[360px] lg:h-[460px] rounded-2xl overflow-hidden bg-gray-100 group">
        <img
          key={active}
          src={images[active]}
          alt={`${title} ${active + 1}`}
          className="w-full h-[260px] sm:h-[400px] object-cover"
        />

        {/* Dim overlay khi hover để nút nổi hơn */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />

        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs
                        px-2.5 py-1 rounded-full backdrop-blur-sm select-none">
          {active + 1} / {len}
        </div>

        {/* Prev / Next */}
        {len > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2
                         w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-md
                         flex items-center justify-center text-gray-800 text-base
                         opacity-0 group-hover:opacity-100 transition"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-md
                         flex items-center justify-center text-gray-800 text-base
                         opacity-0 group-hover:opacity-100 transition"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {len > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-thin">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                active === i
                  ? "border-red-500 scale-[1.04] shadow"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
