// app/listings/[id]/page.tsx

import { notFound } from "next/navigation"
import { getPropertyById, getSimilarProperties } from "@/lib/data"
import ListingDetailClient from "./ListingDetailClient"

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>   // ← Next.js 15+ params là Promise
}) {
  const { id } = await params       // ← phải await

  const property = await getPropertyById(id)
  if (!property) notFound()

  const similar = await getSimilarProperties(id, property.listing_type)

  return <ListingDetailClient property={property} similar={similar} />
}