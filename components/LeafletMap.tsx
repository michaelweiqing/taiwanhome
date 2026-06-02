"use client"
import { useEffect, useRef } from "react"

interface Props {
  lat: number
  lng: number
  title: string
}

export default function LeafletMap({ lat, lng, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Import Leaflet chỉ ở client
    import("leaflet").then(L => {
      import("leaflet/dist/leaflet.css")

      // Fix icon
      const DefaultIcon = L.default.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      })

      const map = L.default.map(containerRef.current!, {
        center: [lat, lng],
        zoom: 16,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map)

      L.default.marker([lat, lng], { icon: DefaultIcon })
        .addTo(map)
        .bindPopup(title)
        .openPopup()

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [lat, lng, title])

  return <div ref={containerRef} className="w-full h-full" />
}