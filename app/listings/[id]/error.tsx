"use client"
import { useEffect } from "react"

export default function ListingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Listing error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 border border-red-100 max-w-md w-full text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Không thể tải trang</h2>
        <p className="text-sm text-gray-500 mb-1 font-mono bg-gray-50 rounded p-2 break-all">
          {error.message}
        </p>
        <button onClick={reset}
          className="mt-4 bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition">
          Thử lại
        </button>
      </div>
    </div>
  )
}
