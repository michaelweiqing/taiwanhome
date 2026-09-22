"use client"
// components/DistrictMultiSelect.tsx
// Dropdown chọn nhiều quận/huyện (tối đa `max`) trong cùng 1 thành phố — dùng chung
// cho ô tìm kiếm trang chủ (HomeClient) và drawer tìm kiếm mobile (SearchDrawer).
//
// Panel được render qua Portal vào document.body (định vị bằng toạ độ thật của nút
// trigger) thay vì nằm lồng trong DOM tại chỗ — vì khung tìm kiếm ở trang chủ có
// `overflow-hidden` (để bo góc thẻ trắng), nên nếu render tại chỗ panel sẽ bị cắt
// cụt/chật chội. Render qua portal giúp panel luôn hiển thị đầy đủ, không bị cha nào
// clip mất.
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

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
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  function updatePosition() {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos({ top: rect.bottom + 6, left: rect.left, width: rect.width })
  }

  // Cập nhật vị trí panel khi mở, và bám theo khi cuộn trang / đổi kích thước cửa sổ
  useEffect(() => {
    if (!open) return
    updatePosition()
    const onScrollOrResize = () => updatePosition()
    window.addEventListener("scroll", onScrollOrResize, true)
    window.addEventListener("resize", onScrollOrResize)
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true)
      window.removeEventListener("resize", onScrollOrResize)
    }
  }, [open])

  // Đóng khi click ra ngoài cả nút trigger lẫn panel (panel nằm ở portal nên phải kiểm tra riêng)
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (btnRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  // Đóng dropdown khi đổi thành phố (danh sách quận/huyện thay đổi)
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
    <div className="relative flex-1">
      <button
        ref={btnRef}
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className={`${className} text-left truncate`}
      >
        <span className={selected.length === 0 ? "text-gray-400" : "text-gray-700"}>{label}</span>
      </button>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>

      {open && !disabled && pos && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: Math.max(pos.width, 260),
            maxHeight: "min(70vh, 380px)",
          }}
          className="z-[100] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl py-1"
        >
          {districts.map(d => {
            const checked = selected.includes(d.zh)
            const limitReached = !checked && selected.length >= max
            return (
              <label key={d.zh}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm ${limitReached ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-red-50"}`}>
                <input type="checkbox" checked={checked} disabled={limitReached}
                  onChange={() => toggle(d.zh)}
                  className="accent-red-600 w-4 h-4 shrink-0" />
                <span className="text-gray-700">{lang === "zh" ? d.zh : `${d.vi} (${d.zh})`}</span>
              </label>
            )
          })}
          <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100 mt-1 sticky bottom-0 bg-white">
            {lang === "zh" ? `最多選擇 ${max} 個區域` : `Chọn tối đa ${max} khu vực`}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
