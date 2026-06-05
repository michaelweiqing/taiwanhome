// app/listings/page.tsx — Server Component, fetch từ Supabase
export const revalidate = 0

import { searchProperties } from "@/lib/data"
import ListingsClient from "./ListingsClient"

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: {
    type?: string
    city?: string
    district?: string        // ← MỚI
    property_type?: string   // ← MỚI
    price?: string           // ← MỚI (dạng "min-max", vd: "15000-25000")
    sort?: string
    q?: string               // ← MỚI (từ khoá tìm kiếm text)
  }
}) {
  // Parse khoảng giá từ chuỗi "min-max"
  let minPrice: number | undefined
  let maxPrice: number | undefined
  if (searchParams.price) {
    const parts = searchParams.price.split("-")
    const min = Number(parts[0])
    const max = Number(parts[1])
    if (!isNaN(min) && min > 0) minPrice = min
    if (!isNaN(max) && max < 9999999)  maxPrice = max
  }

  const properties = await searchProperties({
    listingType:  searchParams.type as "rent" | "buy" | undefined,
    city:         searchParams.city,
    district:     searchParams.district,
    propertyType: searchParams.property_type as "apartment" | "house" | "studio" | "villa" | undefined,
    sortBy:       (searchParams.sort as "newest" | "price_asc" | "price_desc") ?? "newest",
    minPrice,
    maxPrice,
  })

  // Giải mã q (có thể đã bị encodeURIComponent ở client)
  const searchQuery = searchParams.q ? decodeURIComponent(searchParams.q) : undefined

  return (
    <ListingsClient
      initialProperties={properties}
      searchQuery={searchQuery}
    />
  )
}
