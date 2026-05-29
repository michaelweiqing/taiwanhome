import { getSimilarProperties } from "@/lib/data"
import PropertyCard from "@/components/PropertyCard"

interface Props {
  currentId: string
  listingType: "rent" | "buy"
}

export default async function SimilarListings({ currentId, listingType }: Props) {
  const similar = await getSimilarProperties(currentId, listingType, 3)

  if (!similar.length) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {similar.map(p => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  )
}
