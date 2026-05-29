"use client"
import { properties } from "@/lib/data"
import PropertyCard from "@/components/PropertyCard"

interface Props { currentId: string; listingType: "rent" | "buy" }

export default function SimilarListings({ currentId, listingType }: Props) {
  const similar = properties
    .filter(p => p.id !== currentId && p.listing_type === listingType)
    .slice(0, 3)
  if (!similar.length) return null
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {similar.map(p => <PropertyCard key={p.id} property={p} />)}
    </div>
  )
}
