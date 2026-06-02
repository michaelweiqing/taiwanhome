import { useState, useEffect } from "react"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem("favorites")
      if (saved) setFavorites(JSON.parse(saved))
    } catch {}
  }, [])

  function toggle(id: string) {
    setFavorites(prev => {
      const next = prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
      try {
        localStorage.setItem("favorites", JSON.stringify(next))
      } catch {}
      return next
    })
  }

  function isFavorite(id: string) {
    if (!mounted) return false  // ← server luôn trả false, tránh hydration mismatch
    return favorites.includes(id)
  }

  return { favorites, toggle, isFavorite, mounted }
}