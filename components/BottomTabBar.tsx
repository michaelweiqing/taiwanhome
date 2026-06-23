"use client"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useLang } from "@/context/LangContext"
import { useFavorites } from "@/hooks/useFavorites"
import SearchDrawer from "@/components/SearchDrawer"

export default function BottomTabBar() {
  const pathname = usePathname()
  const { lang } = useLang()
  const { favorites } = useFavorites()
  const [searchOpen, setSearchOpen] = useState(false)

  const isSearch = pathname.startsWith("/listings")

  return (
    <>
      {/* spacer để content không bị che */}
      <div className="h-16 md:hidden" />

      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 shadow-lg md:hidden">
        <div className="flex items-stretch h-16">

          {/* Trang chủ */}
          <Link href="/"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              pathname === "/" ? "text-red-600" : "text-gray-400"
            }`}>
            <svg viewBox="0 0 24 24" fill={pathname==="/" ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 12l9-9 9 9M4 10.5V20a1 1 0 001 1h5v-5h4v5h5a1 1 0 001-1V10.5" />
            </svg>
            <span className="text-[10px] font-medium leading-none">
              {lang === "zh" ? "首頁" : "Trang chủ"}
            </span>
          </Link>

          {/* Tìm kiếm — mở drawer */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              isSearch || searchOpen ? "text-red-600" : "text-gray-400"
            }`}>
            <svg viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M21 21l-4-4" />
            </svg>
            <span className="text-[10px] font-medium leading-none">
              {lang === "zh" ? "搜尋" : "Tìm kiếm"}
            </span>
          </button>

          {/* Yêu thích */}
          <Link href="/favorites"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
              pathname === "/favorites" ? "text-red-600" : "text-gray-400"
            }`}>
            <svg viewBox="0 0 24 24" fill={pathname==="/favorites" ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">
              {lang === "zh" ? "收藏" : "Yêu thích"}
            </span>
            {favorites.length > 0 && (
              <span className="absolute top-2 right-[calc(50%-14px)] bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                {favorites.length > 99 ? "99+" : favorites.length}
              </span>
            )}
          </Link>

          {/* Cá nhân */}
          <Link href="/profile"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              pathname === "/profile" ? "text-red-600" : "text-gray-400"
            }`}>
            <svg viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              <circle cx="12" cy="8" r="4" />
              <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className="text-[10px] font-medium leading-none">
              {lang === "zh" ? "個人" : "Cá nhân"}
            </span>
          </Link>

        </div>
      </nav>

      {/* Search Drawer */}
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
