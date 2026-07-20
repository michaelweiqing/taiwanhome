// app/listings/page.tsx — Server Component, fetch từ Supabase
export const revalidate = 0

import { searchProperties } from "@/lib/data"
import ListingsClient from "./ListingsClient"

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string
    city?: string
    district?: string
    property_type?: string
    price?: string          // "min-max"
    rooms?: string          // "1" | "2" | "3" | "4" | "5+"
    area?: string           // "min-max" (坪)
    age?: string            // "min-max" (năm)
    floor?: string          // "1" | "2-6" | "6-12" | "12+" | "basement" | "whole" — lọc phía client
    parking?: string        // "yes" | "no"
    sort?: string
    q?: string
  }>
}) {
  const params = await searchParams

  // Parse khoảng "min-max" dùng chung cho giá / diện tích / tuổi nhà
  function parseRange(raw?: string, openMax = 9999999): [number | undefined, number | undefined] {
    if (!raw) return [undefined, undefined]
    const parts = raw.split("-")
    const min = Number(parts[0])
    const max = Number(parts[1])
    return [
      !isNaN(min) && min > 0 ? min : undefined,
      !isNaN(max) && max < openMax ? max : undefined,
    ]
  }

  const [minPrice, maxPrice] = parseRange(params.price)
  const [minArea, maxArea]   = parseRange(params.area, 9999)
  const [minAge, maxAge]     = parseRange(params.age, 999)

  let bedrooms: number | undefined
  let bedroomsMin: number | undefined
  if (params.rooms === "5+") bedroomsMin = 5
  else if (params.rooms) bedrooms = Number(params.rooms)

  const parking = params.parking === "yes" ? true : params.parking === "no" ? false : undefined

  const properties = await searchProperties({
    listingType:  params.type as "rent" | "buy" | undefined,
    city:         params.city,
    district:     params.district,
    propertyType: params.property_type as "apartment" | "house" | "studio" | "villa" | undefined,
    sortBy:       (params.sort as "newest" | "price_asc" | "price_desc") ?? "newest",
    minPrice, maxPrice, minArea, maxArea, minAge, maxAge, bedrooms, bedroomsMin, parking,
  })

  const searchQuery = params.q ? decodeURIComponent(params.q) : undefined

  return (
    <ListingsClient
      initialProperties={properties}
      searchQuery={searchQuery}
      floorFilter={params.floor}
      rawParams={{
        type: params.type,
        city: params.city,
        district: params.district,
        property_type: params.property_type,
        price: params.price,
        rooms: params.rooms,
        area: params.area,
        age: params.age,
        floor: params.floor,
        parking: params.parking,
        sort: params.sort,
      }}
    />
  )
}
