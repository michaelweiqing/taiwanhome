// app/listings/[id]/page.tsx

import { notFound } from "next/navigation"
import { getPropertyById, getSimilarProperties } from "@/lib/data"
import ListingDetailClient from "./ListingDetailClient"

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const property = await getPropertyById(id)
    if (!property) notFound()

    const similar = await getSimilarProperties(id, (property.listing_type as "rent" | "buy") || "buy", 6, {
      propertyType: property.property_type,
      district:     property.district,
      city:         property.city,
      price:        Number(property.price),
    })

    return <ListingDetailClient property={property} similar={similar} />
  } catch (err) {
    console.error("ListingDetail error:", err)
    notFound()
  }
}