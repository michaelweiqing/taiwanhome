// ============================================================
// lib/data.ts  (phiên bản Supabase — thay data cứng)
// ============================================================

import { supabase } from "@/lib/supabase"

export interface Property {
  id: string
  title_zh: string
  title_vi: string
  district: string
  district_vi: string
  address: string
  address_vi: string
  city: string
  city_vi: string
  listing_type: "rent" | "buy"
  property_type: "apartment" | "house" | "studio" | "villa"
  price: number
  price_per_ping: number | null
  area_ping: number
  bedrooms: number
  bathrooms: number
  floor: number
  total_floors: number
  age: number
  facing: string
  features: string[]
  features_vi: string[]
  near_mrt: string
  near_mrt_vi: string
  walk_minutes: number
  images: string[]
  agent_name: string
  agent_phone: string
  agent_line: string
  is_new: boolean
  is_featured: boolean
  views: number
  posted_at: string
  lat: number
  lng: number
  description_zh: string
  description_vi: string
}

export async function getAllProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("posted_at", { ascending: false })
  if (error) { console.error("Supabase:", error.message); return [] }
  return data as Property[]
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_featured", true)
    .limit(4)
  if (error) { console.error("Supabase:", error.message); return [] }
  return data as Property[]
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single()
  if (error) { console.error("Supabase:", error.message); return null }
  // Tăng view count ngầm
  supabase.from("properties").update({ views: (data.views || 0) + 1 }).eq("id", id)
  return data as Property
}

export async function getSimilarProperties(
  currentId: string,
  listingType: "rent" | "buy",
  limit = 3
): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("listing_type", listingType)
    .neq("id", currentId)
    .limit(limit)
  if (error) { console.error("Supabase:", error.message); return [] }
  return data as Property[]
}

export interface FilterOptions {
  listingType?: "rent" | "buy"
  city?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  bedrooms?: number
  sortBy?: "newest" | "price_asc" | "price_desc"
}

export async function searchProperties(filters: FilterOptions): Promise<Property[]> {
  let query = supabase.from("properties").select("*")
  if (filters.listingType) query = query.eq("listing_type", filters.listingType)
  if (filters.city)        query = query.eq("city", filters.city)
  if (filters.minPrice)    query = query.gte("price", filters.minPrice)
  if (filters.maxPrice)    query = query.lte("price", filters.maxPrice)
  if (filters.minArea)     query = query.gte("area_ping", filters.minArea)
  if (filters.bedrooms)    query = query.eq("bedrooms", filters.bedrooms)
  if (filters.sortBy === "price_asc")  query = query.order("price", { ascending: true })
  else if (filters.sortBy === "price_desc") query = query.order("price", { ascending: false })
  else query = query.order("posted_at", { ascending: false })
  const { data, error } = await query
  if (error) { console.error("Supabase:", error.message); return [] }
  return data as Property[]
}

export function formatPrice(p: Property, lang: "zh" | "vi"): string {
  if (p.listing_type === "rent") {
    return lang === "zh"
      ? `NT$${p.price.toLocaleString()}/月`
      : `NT$${p.price.toLocaleString()}/tháng`
  }
  return lang === "zh"
    ? `${p.price.toLocaleString()}萬`
    : `${p.price.toLocaleString()} vạn NTD`
}

export function pingToM2(ping: number): number {
  return Math.round(ping * 3.306)
}
