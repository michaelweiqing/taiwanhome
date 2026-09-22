"use client"
// components/DistrictMultiSelect.tsx
// Dropdown chọn nhiều quận/huyện (tối đa `max`) trong cùng 1 thành phố — dùng chung
// cho ô tìm kiếm trang chủ (HomeClient) và drawer tìm kiếm mobile (SearchDrawer).
import { useEffect, useRef, useState } from "react"

interface DistrictOption { zh: string; vi: string }

interface Props {
  lang: "zh" | "vi"
  districts: DistrictOption[]
  selected: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
  max?: number
  className: string   // classes của trigger button — truyền vào giống className của <select> gốc
}

export default function DistrictMultiSelect({ lang, districts, selected, onChange, disabled, max = 4, className }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Đóng dropdown + xoá lựa chọn không còn thuộc thành phố hiện tại khi đổi thành phố
  useEffect(() => { setOpen(false) }, [districts])

  function toggle(zh: string) {
    if (selected.includes(zh)) {
      onChange(selected.filter(d => d !== zh))
      return
    }
    if (selected.length >= max) return
    onChange([...selected, zh])
  }

  const label = selected.length === 0
    ? (lang === "zh" ? "選擇區域" : "Chọn quận/huyện")
    : selected.length === 1
      ? (lang === "zh" ? selected[0] : (districts.find(d => d.zh === selected[0])?.vi ?? selected[0]))
      : (lang === "zh" ? `已選 ${selected.length} 個區域` : `Đã chọn ${selected.length} khu vực`)

  return (
    <div className="relative flex-1" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className={`${className} text-left truncate`}
      >
        <span className={selected.length === 0 ? "text-gray-400" : "text-gray-700"}>{label}</span>
      </button>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>

      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1">
          {districts.map(d => {
            const checked = selected.includes(d.zh)
            const limitReached = !checked && selected.length >= max
            return (
              <label key={d.zh}
                className={`flex items-center gap-2 px-3 py-2 text-sm ${limitReached ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-red-50"}`}>
                <input type="checkbox" checked={checked} disabled={limitReached}
                  onChange={() => toggle(d.zh)}
                  className="accent-red-600 w-4 h-4 shrink-0" />
                <span className="text-gray-700">{lang === "zh" ? d.zh : `${d.vi} (${d.zh})`}</span>
              </label>
            )
          })}
          <div className="px-3 py-1.5 text-xs text-gray-400 border-t border-gray-100 mt-1">
            {lang === "zh" ? `最多選擇 ${max} 個區域` : `Chọn tối đa ${max} khu vực`}
          </div>
        </div>
      )}
    </div>
  )
}
