// app/listings/page.tsx — Server Component, fetch từ Supabase

import { searchProperties } from "@/lib/data"
import ListingsClient from "./ListingsClient"

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { type?: string; city?: string; sort?: string }
}) {
  const properties = await searchProperties({
    listingType: searchParams.type as "rent" | "buy" | undefined,
    city: searchParams.city,
    sortBy: (searchParams.sort as "newest" | "price_asc" | "price_desc") ?? "newest",
  })

  return <ListingsClient initialProperties={properties} />
}
