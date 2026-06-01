"use client"
import { useEffect, useState } from "react"
import { getAllProperties } from "@/lib/data"
import type { Property } from "@/lib/data"
import PropertyCard from "@/components/PropertyCard"
import { useLang } from "@/context/LangContext"

export default function FavoritesPage() {
  const { lang } = useLang()
  const [props, setProps] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids: string[] = JSON.parse(localStorage.getItem("favorites") || "[]")
    if (ids.length === 0) { setLoading(false); return }

    getAllProperties().then(all => {
      setProps(all.filter(p => ids.includes(p.id)))
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">
        ❤️ {lang === "zh" ? "我的收藏" : "Nhà yêu thích"}
      </h1>

      {loading ? (
        <p className="text-gray-400 text-center py-20">Đang tải...</p>
      ) : props.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🤍</p>
          <p className="text-gray-500">
            {lang === "zh" ? "尚無收藏物件" : "Chưa có nhà yêu thích nào"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {props.map(p => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  )
}