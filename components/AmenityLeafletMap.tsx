"use client"
// Bản đồ Leaflet cho phần "Tiện ích xung quanh": vị trí nhà + vòng tròn 500m + các địa điểm đánh số.
import { useEffect, useRef } from "react"

export interface MapPoi { n: string; s: string; la: number; ln: number; d: number }
interface Props {
  center: { lat: number; lng: number }
  title: string
  items: MapPoi[]
  activeIndex: number | null
  onSelect: (i: number) => void
}

export default function AmenityLeafletMap({ center, title, items, activeIndex, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const libRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  // Khởi tạo bản đồ 1 lần
  useEffect(() => {
    let cancelled = false
    if (!containerRef.current) return
    import("leaflet").then(mod => {
      if (cancelled || !containerRef.current || mapRef.current) return
      const L = mod.default
      import("leaflet/dist/leaflet.css")
      libRef.current = L
      const map = L.map(containerRef.current, { center: [center.lat, center.lng], zoom: 16, scrollWheelZoom: false, zoomControl: true })
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19 }).addTo(map)
      L.circle([center.lat, center.lng], { radius: 500, color: "#f59e0b", weight: 2, fillColor: "#fbbf24", fillOpacity: 0.15 }).addTo(map)
      const home = L.divIcon({
        className: "",
        html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#ef4444;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"><div style="transform:rotate(45deg);color:#fff;font-size:16px;line-height:28px;text-align:center">⌂</div></div>`,
        iconSize: [34, 34], iconAnchor: [17, 34],
      })
      L.marker([center.lat, center.lng], { icon: home, zIndexOffset: 1000 }).addTo(map).bindTooltip(title, { direction: "top", offset: [0, -34] })
      layerRef.current = L.layerGroup().addTo(map)
      mapRef.current = map
      map.fire("amenity-ready")
      setItems()
    })
    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; layerRef.current = null }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng])

  function setItems() {
    const L = libRef.current, map = mapRef.current, layer = layerRef.current
    if (!L || !map || !layer) return
    layer.clearLayers()
    markersRef.current = items.map((p, i) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:24px;height:24px;border-radius:50%;background:#2563eb;color:#fff;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);font:600 12px/20px system-ui;text-align:center">${i + 1}</div>`,
        iconSize: [24, 24], iconAnchor: [12, 12],
      })
      const m = L.marker([p.la, p.ln], { icon }).addTo(layer)
      m.bindTooltip(`${p.n} · ${p.d}m`, { direction: "top", offset: [0, -10] })
      m.on("click", () => onSelectRef.current(i))
      return m
    })
    const pts: [number, number][] = [[center.lat, center.lng], ...items.map(p => [p.la, p.ln] as [number, number])]
    if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30], maxZoom: 17 })
    else map.setView([center.lat, center.lng], 16)
  }

  // Đổi nhóm (tab) → vẽ lại các điểm
  useEffect(() => { setItems() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [items])

  // Chọn 1 điểm trong danh sách → bay tới điểm đó
  useEffect(() => {
    const map = mapRef.current
    if (!map || activeIndex == null || !items[activeIndex]) return
    map.panTo([items[activeIndex].la, items[activeIndex].ln])
    markersRef.current[activeIndex]?.openTooltip()
  }, [activeIndex, items])

  return <div ref={containerRef} className="w-full h-full" />
}
