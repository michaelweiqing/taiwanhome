import { useState, useEffect } from "react"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  // Load từ localStorage khi mount
  useEffect(() => {
    const saved = localStorage.getItem("favorites")
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  function toggle(id: string) {
    setFavorites(prev => {
      const next = prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
      localStorage.setItem("favorites", JSON.stringify(next))
      return next
    })
  }

  function isFavorite(id: string) {
    return favorites.includes(id)
  }

  return { favorites, toggle, isFavorite }
}