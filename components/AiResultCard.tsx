"use client"
// components/AiResultCard.tsx
// Bọc PropertyCard sẵn có + thêm "8386 AI Score" (mục 10) và giải thích "vì sao phù hợp" (mục 9)
// KHÔNG sửa PropertyCard gốc — chỉ thêm phần điểm số/giải thích bên dưới để tránh đụng UI cũ.
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import PropertyCard from "@/components/PropertyCard"
import type { Property } from "@/lib/data"

interface ChecklistItem { label: string; met: boolean; soft: boolean }

export default function AiResultCard({
  property, score, checklist,
}: { property: Property; score: number; checklist: ChecklistItem[] }) {
  const [open, setOpen] = useState(false)
  const color = score >= 85 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-gray-400"

  return (
    <div className="flex flex-col gap-1.5">
      <PropertyCard property={property} />
      {checklist.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 px-2.5 py-2">
          <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white">
              <span className={`${color} rounded-full px-2 py-0.5`}>{score}% phù hợp</span>
            </span>
            <span className="text-[11px] text-gray-400 inline-flex items-center gap-0.5">
              Vì sao phù hợp? {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          </button>
          {open && (
            <ul className="mt-2 space-y-1">
              {checklist.map((c, i) => (
                <li key={i} className="text-[11px] flex items-start gap-1.5">
                  <span>{c.met ? "🟢" : "🟡"}</span>
                  <span className={c.met ? "text-gray-600" : "text-gray-400"}>
                    {c.label}{c.soft ? " (ưu tiên)" : ""}{!c.met ? " — chưa đáp ứng" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
