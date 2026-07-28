import { Property } from "@/lib/data"

const SCHEMA_TYPE: Record<string, string> = {
  apartment: "Apartment",
  apartment_walkup: "Apartment",
  house: "House",
  studio: "Apartment",
  villa: "House",
}

export function ListingJsonLd({ property: p }: { property: Property }) {
  const description = Array.isArray(p.description_vi)
    ? p.description_vi.join(" ")
    : (p.description_zh || p.description_vi || "")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[p.property_type] ?? "House",
    name: p.title_zh,
    description,
    url: `https://8386.tw/listings/${p.id}`,
    image: p.images?.length ? p.images : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.district,
      addressRegion: p.city,
      addressCountry: "TW",
    },
    ...(p.lat && p.lng
      ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } }
      : {}),
    numberOfBedrooms: p.bedrooms,
    numberOfBathroomsTotal: p.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: p.area_ping,
      unitCode: "MTK",
    },
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "TWD",
      availability: "https://schema.org/InStock",
      businessFunction:
        p.listing_type === "rent"
          ? "https://schema.org/LeaseOut"
          : "https://schema.org/Sell",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
