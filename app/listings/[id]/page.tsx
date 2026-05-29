// app/listings/[id]/page.tsx — Server Component, fetch từ Supabase

import { notFound } from "next/navigation"
import { getPropertyById, getSimilarProperties, pingToM2, formatPrice } from "@/lib/data"
import ListingDetailClient from "./ListingDetailClient"

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [property, similar] = await Promise.all([
    getPropertyById(params.id),
    getSimilarProperties(params.id, "rent"), // tạm dùng rent, sẽ override trong client
  ])

  if (!property) notFound()

  const similarFinal = await getSimilarProperties(params.id, property.listing_type)

  return <ListingDetailClient property={property} similar={similarFinal} />
}
