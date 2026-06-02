"use client"
import dynamic from "next/dynamic"

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
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
  if (!lat || !lng) return null
  return (
    <div className="w-full h-[200px] rounded-xl overflow-hidden">
      <LeafletMap lat={lat} lng={lng} title={title} />
    </div>
  )
}