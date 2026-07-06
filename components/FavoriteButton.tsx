"use client"
import { Heart } from "lucide-react"
import { useFavorites } from "@/hooks/useFavorites"

interface Props {
  propertyId: string
  size?: "sm" | "lg"
}

export default function FavoriteButton({ propertyId, size = "sm" }: Props) {
  const { toggle, isFavorite } = useFavorites()
  const liked = isFavorite(propertyId)

  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(propertyId) }}
      className={`flex items-center justify-center rounded-full border transition
        ${size === "lg"
          ? "w-10 h-10 border-gray-200 bg-white shadow-sm hover:scale-110"
          : "w-8 h-8 border-gray-200 bg-white/90 hover:scale-110"}
        ${liked
          ? "border-red-200 text-red-500"
          : "text-gray-300 hover:text-red-400"}`}
      title={liked ? "Bỏ yêu thích" : "Thêm yêu thích"}
    >
      <Heart size={size === "lg" ? 20 : 16} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
    </button>
  )
}