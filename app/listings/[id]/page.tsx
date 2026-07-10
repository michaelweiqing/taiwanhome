// app/listings/[id]/page.tsx

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPropertyById, getSimilarProperties, formatPrice } from "@/lib/data"
import ListingDetailClient from "./ListingDetailClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const property = await getPropertyById(id)
  if (!property) return {}

  const titleZh = property.title_zh || property.title_vi
  const titleVi = property.title_vi || property.title_zh
  const cityZh = property.city || property.city_vi
  const cityVi = property.city_vi || property.city
  const districtZh = property.district || property.district_vi
  const districtVi = property.district_vi || property.district
  const priceZh = formatPrice(property, "zh")
  const priceVi = formatPrice(property, "vi")

  const title = `${titleZh} | ${titleVi}`
  const description = `${cityZh}${districtZh} · ${priceZh}  |  ${cityVi} ${districtVi} · ${priceVi}`
  const image = property.images?.[0] || "/og-image.png"
  const url = `https://8386.tw/listings/${id}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "8386找房網",
      images: [{ url: image, alt: titleZh }],
      locale: "zh_TW",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

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