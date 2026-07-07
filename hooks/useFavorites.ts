import { useState, useEffect, useCallback } from "react"

const FAVORITES_KEY = "favorites"
const EVENT_NAME = "taiwanhome:favorites-changed"

function readFavorites(): string[] {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFavorites(readFavorites())

    // Đồng bộ giữa mọi nơi dùng useFavorites() trong cùng tab (Navbar, BottomTabBar, PropertyCard...)
    function handleChange() {
      setFavorites(readFavorites())
    }
    window.addEventListener(EVENT_NAME, handleChange)
    // Đồng bộ giữa các tab/cửa sổ khác nhau
    window.addEventListener("storage", handleChange)
    return () => {
      window.removeEventListener(EVENT_NAME, handleChange)
      window.removeEventListener("storage", handleChange)
    }
  }, [])

  const toggle = useCallback((id: string) => {
    const current = readFavorites()
    const next = current.includes(id)
      ? current.filter(f => f !== id)
      : [...current, id]
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
    } catch {}
    setFavorites(next)
    window.dispatchEvent(new Event(EVENT_NAME))
  }, [])

  const isFavorite = useCallback((id: string) => {
    if (!mounted) return false  // ← server luôn trả false, tránh hydration mismatch
    return favorites.includes(id)
  }, [mounted, favorites])

  return { favorites, toggle, isFavorite, mounted }
}