"use client"
import { useEffect } from "react"
import dynamic from "next/dynamic"

// Leaflet chỉ chạy ở client, không chạy ở server
const Map = dynamic(() => import("./LeafletMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
      Đang tải bản đồ...
    </div>
  )
})

interface Props {
  lat: number
  lng: number
  title: string
}

export default function PropertyMap({ lat, lng, title }: Props) {
  return <Map lat={lat} lng={lng} title={title} />
}