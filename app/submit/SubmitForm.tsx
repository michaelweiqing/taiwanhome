"use client"
import { useState, useEffect, Fragment } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import { useLang } from "@/context/LangContext"
import type { LucideIcon } from "lucide-react"
import {
  Home, Loader2, Camera, FolderOpen, Video, X, AlertTriangle, User, Eye,
  Save, Rocket, Ban, CheckCircle2, MapPin, Phone, MessageCircle, Building2, Tag, FileText,
  TrainFront, TrainTrack, Bus, Stethoscope, ShoppingCart, Trees, School, GraduationCap, Store, UtensilsCrossed, Factory,
  ShoppingBasket, Landmark,
} from "lucide-react"

const DISTRICTS_ZH = ["北區","南區","西區","東區","北屯區","南屯區","西屯區","太平區","大里區","霧峰區","烏日區","大肚區","龍井區","梧棲區","清水區","沙鹿區","神岡區","大雅區","潭子區","豐原區","石岡區","東勢區","新社區","和平區","后里區"]

const CITIES = [
  { zh:"台北市", vi:"Đài Bắc" },
  { zh:"新北市", vi:"Tân Bắc" },
  { zh:"桃園市", vi:"Đào Viên" },
  { zh:"台中市", vi:"Đài Trung" },
  { zh:"彰化縣", vi:"Chương Hóa" },
  { zh:"台南市", vi:"Đài Nam" },
  { zh:"高雄市", vi:"Cao Hùng" },
  { zh:"新竹市", vi:"Tân Trúc" },
]

const DISTRICTS: Record<string, { zh: string; vi: string }[]> = {
  "台北市": [
    {zh:"中正區",vi:"Trung Chính"},{zh:"大安區",vi:"Đại An"},{zh:"信義區",vi:"Tín Nghĩa"},
    {zh:"松山區",vi:"Tùng Sơn"},{zh:"內湖區",vi:"Nội Hồ"},{zh:"士林區",vi:"Sĩ Lâm"},
    {zh:"北投區",vi:"Bắc Đầu"},{zh:"文山區",vi:"Văn Sơn"},{zh:"南港區",vi:"Nam Cảng"},
    {zh:"中山區",vi:"Trung Sơn"},{zh:"萬華區",vi:"Vạn Hoa"},{zh:"大同區",vi:"Đại Đồng"},
  ],
  "新北市": [
    {zh:"板橋區",vi:"Bản Kiều"},{zh:"三重區",vi:"Tam Trọng"},{zh:"中和區",vi:"Trung Hòa"},
    {zh:"永和區",vi:"Vĩnh Hòa"},{zh:"新莊區",vi:"Tân Trang"},{zh:"新店區",vi:"Tân Điếm"},
    {zh:"土城區",vi:"Thổ Thành"},{zh:"蘆洲區",vi:"Lô Châu"},{zh:"淡水區",vi:"Đạm Thủy"},
  ],
  "桃園市": [
    {zh:"桃園區",vi:"Đào Viên"},{zh:"中壢區",vi:"Trung Lịch"},{zh:"平鎮區",vi:"Bình Trấn"},
    {zh:"八德區",vi:"Bát Đức"},{zh:"楊梅區",vi:"Dương Mai"},{zh:"龜山區",vi:"Quy Sơn"},
  ],
  "台中市": [
    {zh:"中區",vi:"Khu Trung"},{zh:"東區",vi:"Khu Đông"},{zh:"西區",vi:"Khu Tây"},
    {zh:"南區",vi:"Khu Nam"},{zh:"北區",vi:"Khu Bắc"},{zh:"西屯區",vi:"Tây Đồn"},
    {zh:"南屯區",vi:"Nam Đồn"},{zh:"北屯區",vi:"Bắc Đồn"},{zh:"豐原區",vi:"Phong Nguyên"},
    {zh:"大里區",vi:"Đại Lý"},{zh:"太平區",vi:"Thái Bình"},{zh:"清水區",vi:"Thanh Thủy"},
    {zh:"沙鹿區",vi:"Sa Lộc"},{zh:"大甲區",vi:"Đại Giáp"},{zh:"東勢區",vi:"Đông Thế"},
    {zh:"梧棲區",vi:"Ngô Thê"},{zh:"烏日區",vi:"Ô Nhật"},{zh:"神岡區",vi:"Thần Cương"},
    {zh:"大肚區",vi:"Đại Độ"},{zh:"大雅區",vi:"Đại Nhã"},{zh:"后里區",vi:"Hậu Lý"},
    {zh:"霧峰區",vi:"Vụ Phong"},{zh:"潭子區",vi:"Đàm Tử"},{zh:"龍井區",vi:"Long Tỉnh"},
    {zh:"外埔區",vi:"Ngoại Phố"},{zh:"和平區",vi:"Hòa Bình"},{zh:"石岡區",vi:"Thạch Cương"},
    {zh:"大安區",vi:"Đại An"},{zh:"新社區",vi:"Tân Xã"},
  ],
  "彰化縣": [
    {zh:"彰化市",vi:"Chương Hóa"},{zh:"員林市",vi:"Viên Lâm"},{zh:"鹿港鎮",vi:"Lộc Cảng"},
    {zh:"和美鎮",vi:"Hòa Mỹ"},{zh:"北斗鎮",vi:"Bắc Đẩu"},{zh:"溪湖鎮",vi:"Khê Hồ"},
    {zh:"田中鎮",vi:"Điền Trung"},{zh:"二林鎮",vi:"Nhị Lâm"},{zh:"線西鄉",vi:"Tuyến Tây"},
    {zh:"伸港鄉",vi:"Thân Cảng"},{zh:"福興鄉",vi:"Phúc Hưng"},{zh:"秀水鄉",vi:"Tú Thủy"},
    {zh:"花壇鄉",vi:"Hoa Đàn"},{zh:"芬園鄉",vi:"Phân Viên"},{zh:"大村鄉",vi:"Đại Thôn"},
    {zh:"埔鹽鄉",vi:"Bộ Diêm"},{zh:"埔心鄉",vi:"Bộ Tâm"},{zh:"永靖鄉",vi:"Vĩnh Tĩnh"},
    {zh:"社頭鄉",vi:"Xã Đầu"},{zh:"二水鄉",vi:"Nhị Thủy"},{zh:"田尾鄉",vi:"Điền Vĩ"},
    {zh:"埤頭鄉",vi:"Bi Đầu"},{zh:"芳苑鄉",vi:"Phương Uyển"},{zh:"大城鄉",vi:"Đại Thành"},
    {zh:"竹塘鄉",vi:"Trúc Đường"},{zh:"溪州鄉",vi:"Khê Châu"},
  ],
  "台南市": [
    {zh:"東區",vi:"Khu Đông"},{zh:"南區",vi:"Khu Nam"},{zh:"北區",vi:"Khu Bắc"},
    {zh:"安平區",vi:"An Bình"},{zh:"安南區",vi:"An Nam"},{zh:"永康區",vi:"Vĩnh Khang"},
  ],
  "高雄市": [
    {zh:"三民區",vi:"Tam Dân"},{zh:"苓雅區",vi:"Linh Nhã"},{zh:"前鎮區",vi:"Tiền Trấn"},
    {zh:"鼓山區",vi:"Cổ Sơn"},{zh:"左營區",vi:"Tả Doanh"},{zh:"鳳山區",vi:"Phụng Sơn"},
  ],
  "新竹市": [{zh:"東區",vi:"Khu Đông"},{zh:"北區",vi:"Khu Bắc"},{zh:"香山區",vi:"Hương Sơn"}],
}

// Toạ độ trung tâm 26 đơn vị hành chính 彰化縣 — mặc định khi đăng tin
const CHANGHUA_COORDS: Record<string, { lat: number; lng: number }> = {
  "彰化市": { lat: 24.0810, lng: 120.5388 }, "員林市": { lat: 23.9590, lng: 120.5736 },
  "鹿港鎮": { lat: 24.0573, lng: 120.4344 }, "和美鎮": { lat: 24.1107, lng: 120.5000 },
  "北斗鎮": { lat: 23.8709, lng: 120.5206 }, "溪湖鎮": { lat: 23.9622, lng: 120.4798 },
  "田中鎮": { lat: 23.8614, lng: 120.5859 }, "二林鎮": { lat: 23.8993, lng: 120.3744 },
  "線西鄉": { lat: 24.1300, lng: 120.4640 }, "伸港鄉": { lat: 24.1490, lng: 120.4830 },
  "福興鄉": { lat: 24.0510, lng: 120.4380 }, "秀水鄉": { lat: 24.0350, lng: 120.5050 },
  "花壇鄉": { lat: 24.0280, lng: 120.5380 }, "芬園鄉": { lat: 24.0140, lng: 120.6300 },
  "大村鄉": { lat: 23.9930, lng: 120.5430 }, "埔鹽鄉": { lat: 24.0080, lng: 120.4640 },
  "埔心鄉": { lat: 23.9530, lng: 120.5430 }, "永靖鄉": { lat: 23.9250, lng: 120.5470 },
  "社頭鄉": { lat: 23.8970, lng: 120.5830 }, "二水鄉": { lat: 23.8070, lng: 120.6190 },
  "田尾鄉": { lat: 23.8880, lng: 120.5240 }, "埤頭鄉": { lat: 23.8930, lng: 120.4640 },
  "芳苑鄉": { lat: 23.9240, lng: 120.3210 }, "大城鄉": { lat: 23.8530, lng: 120.3210 },
  "竹塘鄉": { lat: 23.8590, lng: 120.4270 }, "溪州鄉": { lat: 23.8510, lng: 120.4960 },
}

// Trung tâm thành phố — fallback khi không tra được toạ độ quận/huyện
const CITY_CENTER: Record<string, { lat: number; lng: number }> = {
  "台北市": { lat: 25.0330, lng: 121.5654 }, "新北市": { lat: 25.0169, lng: 121.4628 },
  "桃園市": { lat: 24.9936, lng: 121.3010 }, "新竹市": { lat: 24.8138, lng: 120.9675 },
  "台中市": { lat: 24.1477, lng: 120.6736 }, "彰化縣": { lat: 24.0810, lng: 120.5388 },
  "台南市": { lat: 22.9999, lng: 120.2270 }, "高雄市": { lat: 22.6273, lng: 120.3014 },
}

// Tiện ích xung quanh (chỉ áp dụng khi Bán) — đồng bộ key với bảng nearby JSONB
const NEARBY_FIELDS: { key: string; Icon: LucideIcon; zh: string; vi: string }[] = [
  { key:"mrt",         Icon:TrainFront,    zh:"捷運站",   vi:"Ga MRT" },
  { key:"train",       Icon:TrainTrack,    zh:"火車站",   vi:"Ga xe lửa" },
  { key:"bus",         Icon:Bus,           zh:"公車站",   vi:"Trạm xe buýt" },
  { key:"hospital",    Icon:Stethoscope,   zh:"醫院",     vi:"Bệnh viện" },
  { key:"market",      Icon:ShoppingCart,  zh:"超市",     vi:"Siêu thị" },
  { key:"traditional_market", Icon:ShoppingBasket, zh:"傳統市場", vi:"Chợ" },
  { key:"ward_office", Icon:Landmark,      zh:"公所",     vi:"Ủy ban nhân dân" },
  { key:"park",        Icon:Trees,         zh:"公園",     vi:"Công viên" },
  { key:"school",      Icon:School,        zh:"國小",     vi:"Trường tiểu học" },
  { key:"junior",      Icon:School,        zh:"國中",     vi:"Trường THCS" },
  { key:"senior",      Icon:GraduationCap, zh:"高中",     vi:"Trường THPT" },
  { key:"university",  Icon:GraduationCap, zh:"大學",     vi:"Đại học" },
  { key:"mall",        Icon:Store,         zh:"百貨公司", vi:"Trung tâm TM" },
  { key:"nightmarket", Icon:UtensilsCrossed,zh:"夜市",    vi:"Chợ đêm" },
  { key:"convenience", Icon:Store,         zh:"便利商店", vi:"Cửa hàng tiện lợi" },
  { key:"industrial",  Icon:Factory,       zh:"工業區",   vi:"Khu công nghiệp" },
]

export default function SubmitForm({ editId }: { editId?: string } = {}) {
  const { lang } = useLang()
  const router   = useRouter()
  const supabase = createClient()

  const [user, setUser]       = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [images, setImages]   = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>("")
  const [videoError, setVideoError] = useState<string>("")
  const [preview, setPreview] = useState(false)
  const [city, setCity] = useState("台中市")
  const [initialLoading, setInitialLoading] = useState(!!editId)
  const [notOwner, setNotOwner] = useState(false)

  const [form, setForm] = useState({
    listing_type:  "buy",
    property_type: "apartment",
    title_vi:      "",
    title_zh:      "",
    address:       "",
    district:      "",
    price:         "",
    area_ping:     "",
    bedrooms:      "",
    bathrooms:     "",
    floor:         "",
    total_floors:  "",
    age:           "",
    deposit:       "",
    contract:      "",
    electricity:   "",
    water:         "",
    parking_fee:   "",
    parking:       false,
    // Chỉ dùng khi Bán
    area_main_ping:    "",
    area_balcony_ping: "",
    area_common_ping:  "",
    area_basement_ping:"",
    area_land_ping:    "",
    community_name:    "",
    total_units:       "",
    units_per_floor:   "",
    elevator_count:    "",
    nearby: {} as Record<string,string>,
    pet:           false,
    household_reg: false,
    subsidy:       false,
    business_license: false,
    has_parking:   false,
    parking_note:  "",
    has_furniture: false,
    furniture_note:"",
    description_vi: "",
    description_zh: "",
    video_url:     "",
    agent_name:    "",
    agent_phone:   "",
    agent_line:    "",
    agent_company: "",
    agent_branch:  "",
    agent_license: "",
    agent_broker:  "",
  })

  const [translating, setTranslating] = useState(false)

  async function autoTranslate(field: string, value: string, from: "vi"|"zh") {
    if (!value.trim()) return
    const to = from === "vi" ? "zh" : "vi"
    setTranslating(true)
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, from, to })
      })
      const { result } = await res.json()
      if (result) {
        const targetField = field === "title_vi" ? "title_zh"
          : field === "title_zh" ? "title_vi"
          : field === "description_vi" ? "description_zh"
          : "description_vi"
        setForm(f => ({ ...f, [targetField]: result }))
      }
    } catch {}
    finally { setTranslating(false) }
  }

  // Kiểm tra đăng nhập qua localStorage — nếu có editId thì tải dữ liệu tin cũ để sửa
  useEffect(() => {
    const stored = localStorage.getItem("taiwanhome_user")
    if (!stored) { router.push("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)

    if (editId) {
      supabase.from("user_listings").select("*").eq("id", editId).maybeSingle().then(({ data }) => {
        if (!data || data.submitted_by !== u.phone) {
          setNotOwner(true)
          setInitialLoading(false)
          return
        }
        setCity(data.city || "台中市")
        setExistingImages(data.images || [])
        setForm(f => ({
          ...f,
          listing_type:  data.listing_type || "buy",
          property_type: data.property_type || "apartment",
          title_vi:      data.title_vi || "",
          title_zh:      data.title_zh || "",
          address:       data.address || "",
          district:      data.district || "",
          price:         data.price != null ? String(data.price) : "",
          area_ping:     data.area_ping != null ? String(data.area_ping) : "",
          bedrooms:      data.bedrooms != null ? String(data.bedrooms) : "",
          bathrooms:     data.bathrooms != null ? String(data.bathrooms) : "",
          floor:         data.floor || "",
          total_floors:  data.total_floors != null ? String(data.total_floors) : "",
          age:           data.age != null ? String(data.age) : "",
          deposit:       data.deposit || "",
          contract:      data.contract || "",
          electricity:   data.electricity || "",
          water:         data.water || "",
          parking_fee:   data.parking_fee || "",
          parking:       !!data.parking,
          area_main_ping:     data.area_main_ping != null ? String(data.area_main_ping) : "",
          area_balcony_ping:  data.area_balcony_ping != null ? String(data.area_balcony_ping) : "",
          area_common_ping:   data.area_common_ping != null ? String(data.area_common_ping) : "",
          area_basement_ping: data.area_basement_ping != null ? String(data.area_basement_ping) : "",
          area_land_ping:     data.area_land_ping != null ? String(data.area_land_ping) : "",
          community_name:     data.community_name || "",
          total_units:        data.total_units != null ? String(data.total_units) : "",
          units_per_floor:    data.units_per_floor != null ? String(data.units_per_floor) : "",
          elevator_count:     data.elevator_count != null ? String(data.elevator_count) : "",
          nearby:        data.nearby || {},
          pet:           !!data.pet,
          household_reg: !!data.household_reg,
          subsidy:       !!data.subsidy,
          business_license: !!data.business_license,
          has_parking:   !!data.has_parking,
          parking_note:  data.parking_note || "",
          has_furniture: !!data.has_furniture,
          furniture_note:data.furniture_note || "",
          description_vi: data.description_vi || "",
          description_zh: data.description_zh || "",
          video_url:     data.video_url || "",
          agent_name:    data.agent_name || u.name || "",
          agent_phone:   data.agent_phone || u.phone || "",
          agent_line:    data.agent_line || "",
          agent_company: data.agent_company || "",
          agent_branch:  data.agent_branch || "",
          agent_license: data.agent_license || "",
          agent_broker:  data.agent_broker || "",
        }))
        setInitialLoading(false)
      })
    } else {
      setForm(f => ({
        ...f,
        agent_name:  u.name  || "",
        agent_phone: u.phone || "",
        agent_line:  "",
      }))
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 20)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const MAX_VIDEO_BYTES = 500 * 1024 * 1024 // 500MB
  const MAX_VIDEO_SECONDS = 10 * 60 // 10 phút

  function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setVideoError("")

    if (file.size > MAX_VIDEO_BYTES) {
      setVideoError(lang === "zh" ? "影片大小不可超過 500MB" : "Video không được vượt quá 500MB")
      return
    }

    const url = URL.createObjectURL(file)
    const vid = document.createElement("video")
    vid.preload = "metadata"
    vid.onloadedmetadata = () => {
      if (vid.duration > MAX_VIDEO_SECONDS) {
        setVideoError(lang === "zh" ? "影片時長不可超過 10 分鐘" : "Video không được dài hơn 10 phút")
        URL.revokeObjectURL(url)
        return
      }
      setVideoFile(file)
      setVideoPreview(url)
      setForm(f => ({...f, video_url: ""})) // video mới sẽ thay thế video cũ (nếu có)
    }
    vid.onerror = () => {
      setVideoError(lang === "zh" ? "Không đọc được file video" : "Không đọc được file video")
      URL.revokeObjectURL(url)
    }
    vid.src = url
  }

  function removeVideo() {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview("")
    setVideoError("")
    setForm(f => ({...f, video_url: ""}))
  }

  async function handleSubmit() {
    if (!form.title_vi || !form.price || !form.address) {
      alert(lang === "zh" ? "請填寫必填欄位" : "Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }
    if (videoError) {
      alert(videoError)
      return
    }
    setLoading(true)

    try {
      // 1. Upload ảnh lên Supabase Storage
      const imageUrls: string[] = []
      for (const file of images) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
        const contentType = ext === "jpg" || ext === "jpeg" ? "image/jpeg"
          : ext === "png" ? "image/png"
          : ext === "heic" ? "image/heic"
          : ext === "webp" ? "image/webp"
          : "image/jpeg"
        const subFolder = form.listing_type === "rent" ? "rent" : "sell"
        const path = `${subFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("user_post")
          .upload(path, file, { upsert: true, contentType })
        if (!uploadErr && uploadData) {
          const { data: urlData } = supabase.storage
            .from("user_post")
            .getPublicUrl(path)
          imageUrls.push(urlData.publicUrl)
        } else if (uploadErr) {
          console.error("Upload error:", uploadErr.message)
        }
      }

      // 1b. Upload video (nếu có chọn video mới)
      let finalVideoUrl = form.video_url || null
      if (videoFile) {
        const vExt = (videoFile.name.split(".").pop() || "mp4").toLowerCase()
        const vContentType = vExt === "mov" ? "video/quicktime"
          : vExt === "webm" ? "video/webm"
          : vExt === "mkv" ? "video/x-matroska"
          : vExt === "3gp" ? "video/3gpp"
          : "video/mp4"
        const vSubFolder = form.listing_type === "rent" ? "rent" : "sell"
        const vPath = `${vSubFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${vExt}`
        const { data: vUploadData, error: vUploadErr } = await supabase.storage
          .from("user_video")
          .upload(vPath, videoFile, { upsert: true, contentType: vContentType })
        if (!vUploadErr && vUploadData) {
          const { data: vUrlData } = supabase.storage
            .from("user_video")
            .getPublicUrl(vPath)
          finalVideoUrl = vUrlData.publicUrl
        } else if (vUploadErr) {
          console.error("Video upload error:", vUploadErr.message)
          alert(lang === "zh" ? "影片上傳失敗，請再試一次" : "Tải video lên thất bại, vui lòng thử lại")
          setLoading(false)
          return
        }
      }

      // 1c. Dịch tiêu đề / mô tả sang ngôn ngữ còn thiếu (đảm bảo lưu đủ cả 2 ngôn ngữ)
      async function translateText(text: string, from: "vi"|"zh", to: "vi"|"zh"): Promise<string|null> {
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, from, to })
          })
          const { result } = await res.json()
          return result || null
        } catch { return null }
      }

      let finalTitleVi = form.title_vi.trim()
      let finalTitleZh = form.title_zh.trim()
      if (finalTitleVi && !finalTitleZh) {
        finalTitleZh = (await translateText(finalTitleVi, "vi", "zh")) || finalTitleVi
      } else if (finalTitleZh && !finalTitleVi) {
        finalTitleVi = (await translateText(finalTitleZh, "zh", "vi")) || finalTitleZh
      }

      let finalDescVi = form.description_vi.trim()
      let finalDescZh = form.description_zh.trim()
      if (finalDescVi && !finalDescZh) {
        finalDescZh = (await translateText(finalDescVi, "vi", "zh")) || finalDescVi
      } else if (finalDescZh && !finalDescVi) {
        finalDescVi = (await translateText(finalDescZh, "zh", "vi")) || finalDescZh
      }

      // 2. Chuẩn bị dữ liệu chung — dùng cho cả tạo mới & sửa tin
      const finalImages = editId ? [...existingImages, ...imageUrls] : imageUrls
      const coord = CHANGHUA_COORDS[form.district] ?? CITY_CENTER[city] ?? { lat: 24.1477, lng: 120.6736 }
      const commonPayload = {
        listing_type:  form.listing_type,
        property_type: form.property_type,
        title_vi:      finalTitleVi,
        title_zh:      finalTitleZh || finalTitleVi,
        address:       form.address,
        address_vi:    form.address,
        district:      form.district,
        district_vi:   form.district,
        city:          city,
        city_vi:       CITIES.find(c=>c.zh===city)?.vi || city,
        price:         parseFloat(form.price) || 0,
        area_ping:     parseFloat(form.area_ping) || 0,
        bedrooms:      parseInt(form.bedrooms) || 0,
        bathrooms:     parseInt(form.bathrooms) || 0,
        floor:         form.floor || "",
        total_floors:  parseInt(form.total_floors) || 0,
        age:           form.age !== "" ? (parseInt(form.age) || 0) : null,
        images:        finalImages,
        agent_name:    form.agent_name,
        agent_name_vi: form.agent_name,
        agent_phone:   form.agent_phone,
        agent_line:    form.agent_line || null,
        agent_company: form.agent_company || null,
        agent_branch:  form.agent_branch  || null,
        agent_license: form.agent_license || null,
        agent_broker:  form.agent_broker  || null,
        description_vi: finalDescVi ? finalDescVi : null,
        description_zh: finalDescZh ? finalDescZh : (finalDescVi ? finalDescVi : null),
        video_url:     finalVideoUrl,
        lat:           coord.lat,
        lng:           coord.lng,
        deposit:       form.deposit || null,
        contract:      form.contract || null,
        electricity:   form.electricity || null,
        water:         form.water || null,
        parking_fee:   form.parking_fee || null,
        parking:       form.parking,
        area_main_ping:    form.area_main_ping    ? parseFloat(form.area_main_ping)    : null,
        area_balcony_ping: form.area_balcony_ping ? parseFloat(form.area_balcony_ping) : null,
        area_common_ping:  form.area_common_ping  ? parseFloat(form.area_common_ping)  : null,
        area_basement_ping:form.area_basement_ping? parseFloat(form.area_basement_ping): null,
        area_land_ping:    form.area_land_ping    ? parseFloat(form.area_land_ping)    : null,
        community_name:    form.community_name    || null,
        total_units:       form.total_units       ? parseInt(form.total_units)       : null,
        units_per_floor:   form.units_per_floor   ? parseInt(form.units_per_floor)   : null,
        elevator_count:    form.elevator_count    ? parseInt(form.elevator_count)    : null,
        nearby:        Object.keys(form.nearby).some(k => form.nearby[k]?.trim())
          ? Object.fromEntries(Object.entries(form.nearby).filter(([,v]) => v?.trim()))
          : null,
        pet:           form.pet,
        household_reg: form.household_reg,
        subsidy:       form.subsidy,
        business_license: form.business_license,
        has_parking:   form.has_parking,
        parking_note:  form.parking_note  || null,
        has_furniture: form.has_furniture,
        furniture_note:form.furniture_note || null,
        price_per_ping: parseFloat(form.area_ping) > 0
          ? parseFloat((parseFloat(form.price) / parseFloat(form.area_ping)).toFixed(2))
          : null,
      }

      if (editId) {
        // 2b. SỬA tin — dùng RPC để chỉ chủ tin mới sửa được (bỏ qua RLS)
        const { data: ok, error } = await supabase.rpc("update_own_user_listing", {
          p_id: editId, p_phone: user?.phone || "", p_data: commonPayload
        })
        if (error) throw error
        if (!ok) throw new Error(lang==="zh" ? "無權限修改此刊登" : "Bạn không có quyền sửa tin này")

        setDone(true)
        setTimeout(() => router.push(`/listings/${editId}`), 1500)
      } else {
        // 2a. TẠO MỚI tin
        const newId = String(Math.floor(1000000 + Math.random() * 9000000))
        const { error } = await supabase.from("user_listings").insert({
          id: newId,
          ...commonPayload,
          agent_avatar:  null,
          facing:        "",
          features:      [],
          features_vi:   [],
          is_new:        true,
          is_featured:   false,
          views:         0,
          posted_at:     new Date().toISOString(),
          submitted_by:  user?.phone || "",
        })
        if (error) throw error

        // 3. Thông báo LINE cho Michael
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `🏠 Tin đăng mới!\n📋 ${form.title_vi}\n💰 ${form.price} vạn\n📍 ${form.address}\n👤 ${form.agent_name} | ${form.agent_phone}`
          })
        }).catch(() => {})

        setDone(true)
        setTimeout(() => router.push("/listings"), 2000)
      }

    } catch (err: any) {
      alert("Lỗi: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="text-center py-20 text-gray-400">Đang kiểm tra đăng nhập...</div>

  if (notOwner) return (
    <div className="text-center py-20">
      <Ban size={48} strokeWidth={1.5} className="mx-auto mb-4 text-gray-300" />
      <p className="text-xl font-bold text-gray-800">
        {lang === "zh" ? "無權限編輯此刊登" : "Bạn không có quyền sửa tin này"}
      </p>
    </div>
  )

  if (initialLoading) return <div className="text-center py-20 text-gray-400">Đang tải dữ liệu tin đăng...</div>

  if (done) return (
    <div className="text-center py-20">
      <CheckCircle2 size={48} strokeWidth={1.5} className="mx-auto mb-4 text-green-500" />
      <p className="text-xl font-bold text-gray-800">
        {editId ? (lang === "zh" ? "更新成功！" : "Cập nhật thành công!") : (lang === "zh" ? "刊登成功！" : "Đăng tin thành công!")}
      </p>
      <p className="text-gray-500 mt-2">
        {lang === "zh" ? "正在跳轉..." : "Đang chuyển trang..."}
      </p>
    </div>
  )

  // Màn hình xem trước
  if (preview) {
    const ptLabelVi: Record<string,string> = {
      apartment:"Chung cư thang máy", apartment_walkup:"Chung cư thang bộ",
      house:"Nhà cả căn", villa:"Phòng đơn", studio:"Studio",
      shop:"Mặt bằng", land:"Đất", factory:"Công xưởng"
    }
    const ptLabelZh: Record<string,string> = {
      apartment:"電梯大樓", apartment_walkup:"公寓(無電梯)",
      house:"透天厝", villa:"套房/雅房", studio:"套房",
      shop:"店面", land:"土地", factory:"廠房"
    }
    const ptLabel = lang==="zh" ? ptLabelZh : ptLabelVi
    const displayTitle = lang==="zh" ? (form.title_zh || form.title_vi) : (form.title_vi || form.title_zh)
    const displayDesc  = lang==="zh" ? (form.description_zh || form.description_vi) : (form.description_vi || form.description_zh)
    const cityVi = CITIES.find(c=>c.zh===city)?.vi || city

    // Thông số grid
    const specs = [
      ...(form.bedrooms    ? [{zh:"房間數", vi:"Phòng ngủ",    val:form.bedrooms}] : []),
      ...(form.bathrooms   ? [{zh:"衛浴數", vi:"Số WC",        val:form.bathrooms}] : []),
      ...(form.area_ping   ? [{zh:"坪數",   vi:"Ping",         val:form.area_ping}] : []),
      ...(form.floor       ? [{zh:"樓層",   vi:"Tầng",         val:`${form.floor}/${form.total_floors||"?"}F`}] : []),
      ...(form.age         ? [{zh:"屋齡",   vi:"Tuổi nhà",     val:`${form.age}${lang==="zh"?"年":"năm"}`}] : []),
      ...(form.listing_type==="buy" ? [
        ...(form.community_name     ? [{zh:"社區名稱",  vi:"Tên khu/toà",    val:form.community_name}] : []),
        ...(form.total_units        ? [{zh:"總戶數",    vi:"Tổng số căn",    val:form.total_units}] : []),
        ...(form.units_per_floor    ? [{zh:"同層戶數",  vi:"Căn/tầng",       val:form.units_per_floor}] : []),
        ...(form.elevator_count     ? [{zh:"電梯數",    vi:"Số thang máy",   val:form.elevator_count}] : []),
        ...(form.area_main_ping     ? [{zh:"主建物坪數",vi:"DT chính",       val:`${form.area_main_ping}坪`}] : []),
        ...(form.area_balcony_ping  ? [{zh:"陽台坪數",  vi:"DT ban công",    val:`${form.area_balcony_ping}坪`}] : []),
        ...(form.area_common_ping   ? [{zh:"公共坪數",  vi:"DT công cộng",   val:`${form.area_common_ping}坪`}] : []),
        ...(form.area_basement_ping ? [{zh:"地下室坪數",vi:"DT hầm/ngầm",    val:`${form.area_basement_ping}坪`}] : []),
        ...(form.area_land_ping     ? [{zh:"土地坪數",  vi:"DT đất",         val:`${form.area_land_ping}坪`}] : []),
        {zh:"停車位", vi:"Chỗ đậu xe", val: form.parking ? (form.parking_note ? form.parking_note : (lang==="zh"?"有":"Có")) : (lang==="zh"?"無":"Không")},
      ] : []),
    ]

    // Tiện ích xung quanh (áp dụng cho cả Bán và Cho thuê)
    const amenities = NEARBY_FIELDS.filter(nf => form.nearby[nf.key]?.trim())
      .map(nf => ({ Icon: nf.Icon, text: `${lang==="zh"?nf.zh:nf.vi}: ${form.nearby[nf.key]}` }))

    // Chi tiết cho thuê
    const rentalInfo = [
      ...(form.deposit     ? [{zh:"押金",   vi:"Tiền cọc",     val:`${form.deposit} ${lang==="zh"?"個月":"tháng"}`}] : []),
      ...(form.contract    ? [{zh:"合約",   vi:"Thời hạn hợp đồng", val:`${form.contract}`}] : []),
      ...(form.electricity ? [{zh:"電費",   vi:"Tiền điện",    val:form.electricity}] : []),
      ...(form.water       ? [{zh:"水費",   vi:"Tiền nước",    val:form.water}] : []),
      ...(form.parking_fee ? [{zh:"管理費", vi:"Phí quản lý",  val:form.parking_fee}] : []),
    ]

    // Điều kiện
    const conditions = [
      ...(form.pet          ? [lang==="zh"?"允許養寵物":"Nuôi thú cưng"] : []),
      ...(form.household_reg? [lang==="zh"?"可設戶籍":"Nhập hộ khẩu"] : []),
      ...(form.subsidy      ? [lang==="zh"?"可申請政府補貼":"Xin trợ cấp CP"] : []),
      ...(form.business_license ? [lang==="zh"?"可營業登記":"Đăng ký giấy phép kinh doanh"] : []),
      ...(form.has_parking  ? [lang==="zh"?`停車位${form.parking_note?" · "+form.parking_note:""}`:
                                           `Đậu xe${form.parking_note?" · "+form.parking_note:""}`] : []),
      ...(form.has_furniture? [lang==="zh"?`附傢俱${form.furniture_note?" · "+form.furniture_note:""}`:
                                           `Đồ đạc${form.furniture_note?" · "+form.furniture_note:""}`] : []),
    ]

    return (
      <div className="space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setPreview(false)}
            className="text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition">
            {lang==="zh" ? "← 返回修改" : "← Sửa lại"}
          </button>
          <h2 className="text-lg font-black text-gray-900">
            {lang==="zh" ? "預覽刊登內容" : "Xem trước tin đăng"}
          </h2>
        </div>

        {/* Ảnh */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
            {previews.slice(0,7).map((src, i) => (
              <img key={i} src={src} className={`w-full object-cover ${i===0 ? "col-span-3 h-52" : "h-24"}`} />
            ))}
            {previews.length > 7 && (
              <div className="h-24 bg-gray-800 flex items-center justify-center rounded-xl text-white text-sm font-bold">
                +{previews.length - 7} ảnh
              </div>
            )}
          </div>
        )}

        {/* Loại + tiêu đề + giá */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${form.listing_type==="rent"?"bg-blue-600":"bg-emerald-600"}`}>
              {form.listing_type==="rent" ? (lang==="zh"?"出租":"Cho thuê") : (lang==="zh"?"出售":"Bán")}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {ptLabel[form.property_type] || form.property_type}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{displayTitle}</h3>
          <p className="text-red-600 text-2xl font-black">
            {form.listing_type==="rent"
              ? (lang==="zh" ? `NT$${parseFloat(form.price).toLocaleString()}/月` : `NT$${parseFloat(form.price).toLocaleString()}/tháng`)
              : (lang==="zh" ? `${parseFloat(form.price).toLocaleString()}萬` : `${parseFloat(form.price).toLocaleString()} vạn Đài tệ`)}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={13} strokeWidth={2.2} /> {form.address}{form.district?`, ${form.district}`:""}{city?`, ${lang==="zh"?city:cityVi}`:""}</p>
        </div>

        {/* Thông số */}
        {specs.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-700 mb-3">{lang==="zh"?"物件資訊":"Thông số căn nhà"}</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {specs.map(s => (
                <div key={s.zh} className="bg-gray-50 rounded-xl py-2 px-1">
                  <p className="text-sm font-bold text-gray-800">{s.val}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{lang==="zh"?s.zh:s.vi}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chi tiết cho thuê */}
        {rentalInfo.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-700 mb-3">{lang==="zh"?"租賃詳情":"Chi tiết cho thuê"}</p>
            <div className="grid grid-cols-2 gap-2">
              {rentalInfo.map(r => (
                <div key={r.zh} className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-[10px] text-gray-400">{lang==="zh"?r.zh:r.vi}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{r.val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tiện ích xung quanh (Bán) */}
        {amenities.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-700 mb-2">{lang==="zh"?"周邊設施":"Tiện ích xung quanh"}</p>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a,i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
                  <a.Icon size={12} strokeWidth={2.2} /> {a.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Điều kiện */}
        {conditions.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-700 mb-2">{lang==="zh"?"其他條件":"Điều kiện khác"}</p>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c,i) => (
                <span key={i} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} strokeWidth={2.2} /> {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mô tả */}
        {displayDesc && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-gray-700 mb-2">{lang==="zh"?"物件描述":"Mô tả căn nhà"}</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{displayDesc}</p>
          </div>
        )}

        {/* Thông tin liên hệ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-700 mb-2">{lang==="zh"?"聯絡資訊":"Thông tin liên hệ"}</p>
          <div className="space-y-1.5 text-sm text-gray-600">
            <p className="flex items-center gap-1.5"><User size={13} strokeWidth={2.2} /> {form.agent_name}</p>
            <p className="flex items-center gap-1.5"><Phone size={13} strokeWidth={2.2} /> {form.agent_phone}</p>
            {form.agent_line    && <p className="flex items-center gap-1.5"><MessageCircle size={13} strokeWidth={2.2} /> {form.agent_line}</p>}
            {form.agent_company && <p className="flex items-center gap-1.5"><Building2 size={13} strokeWidth={2.2} /> {lang==="zh"?"公司品牌":"Công ty"}: {form.agent_company}</p>}
            {form.agent_branch  && <p className="flex items-center gap-1.5"><Tag size={13} strokeWidth={2.2} /> {lang==="zh"?"公司名稱":"Chi nhánh"}: {form.agent_branch}</p>}
            {form.agent_license && <p className="flex items-center gap-1.5"><FileText size={13} strokeWidth={2.2} /> {lang==="zh"?"營業員證號":"Giấy phép"}: {form.agent_license}</p>}
            {form.agent_broker  && <p className="flex items-center gap-1.5"><FileText size={13} strokeWidth={2.2} /> {lang==="zh"?"經紀人證號":"Chứng chỉ"}: {form.agent_broker}</p>}
          </div>
        </div>

        {/* Nút */}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition text-base flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 size={18} strokeWidth={2.5} className="animate-spin" /> {lang==="zh"?"上傳中...":"Đang xử lý..."}</>
            : editId
              ? <><Save size={18} strokeWidth={2.2} /> {lang==="zh"?"儲存變更":"Lưu thay đổi"}</>
              : <><Rocket size={18} strokeWidth={2.2} /> {lang==="zh"?"立即刊登":"Xác nhận đăng tin"}</>}
        </button>
        <button onClick={() => setPreview(false)}
          className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm">
          {lang==="zh"?"← 返回修改":"← Quay lại sửa"}
        </button>
        <button onClick={() => { localStorage.removeItem("taiwanhome_user"); router.push("/login") }}
          className="w-full text-xs text-gray-400 border border-gray-200 rounded-xl py-2.5 hover:text-red-500 hover:bg-gray-50 transition">
          {lang==="zh"?"登出":"Đăng xuất"}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Home size={22} strokeWidth={2.2} className="text-red-500" /> {editId ? (lang === "zh" ? "編輯刊登" : "Sửa tin đăng") : (lang === "zh" ? "刊登物件" : "Đăng tin bất động sản")}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {editId ? (lang === "zh" ? "更新物件資料" : "Cập nhật thông tin căn nhà của bạn") : (lang === "zh" ? "請填寫物件資料" : "Điền thông tin căn nhà của bạn")}
        </p>
      </div>

      {/* Loại giao dịch */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          {lang === "zh" ? "交易類型" : "Loại giao dịch"} *
        </label>
        <div className="flex gap-3">
          {[{v:"buy",zh:"出售",vi:"Bán"},{v:"rent",zh:"出租",vi:"Cho thuê"}].map(o => (
            <button key={o.v}
              onClick={() => setForm(f => ({...f, listing_type: o.v}))}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition
                ${form.listing_type === o.v
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-gray-50 text-gray-600 border-gray-200"}`}>
              {lang === "zh" ? o.zh : o.vi}
            </button>
          ))}
        </div>
      </div>

      {/* Loại bất động sản */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          {lang === "zh" ? "物件類型" : "Loại bất động sản"} *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            {v:"apartment_walkup", zh:"公寓(無電梯)", vi:"Chung cư thang bộ"},
            {v:"apartment",        zh:"電梯大樓",      vi:"Chung cư thang máy"},
            {v:"house",            zh:"透天厝",        vi:"Nhà cả căn"},
            {v:"villa",            zh:"套房/雅房",     vi:"Phòng đơn"},
            {v:"shop",             zh:"店面",          vi:"Mặt bằng"},
            {v:"land",             zh:"土地",          vi:"Đất"},
            {v:"factory",          zh:"廠房",          vi:"Công xưởng"},
          ].map(o => (
            <button key={o.v}
              onClick={() => setForm(f => ({...f, property_type: o.v}))}
              className={`py-2 rounded-xl text-sm font-medium border transition
                ${form.property_type === o.v
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-gray-50 text-gray-600 border-gray-200"}`}>
              {lang === "zh" ? o.zh : o.vi}
            </button>
          ))}
        </div>
      </div>

      {/* Tiêu đề & địa chỉ */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            {lang === "zh" ? "標題" : "Tiêu đề tin đăng"} *
          </label>
          <input
            name={lang === "zh" ? "title_zh" : "title_vi"}
            value={lang === "zh" ? form.title_zh : form.title_vi}
            onChange={handleChange}
            onBlur={e => autoTranslate(lang === "zh" ? "title_zh" : "title_vi", e.target.value, lang === "zh" ? "zh" : "vi")}
            placeholder={lang === "zh" ? "例：近捷運3房透天厝..." : "VD: Nhà phố 3 tầng gần Metro..."}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
          {translating && <p className="text-xs text-blue-500 mt-1 flex items-center gap-1"><Loader2 size={12} strokeWidth={2.5} className="animate-spin" /> {lang === "zh" ? "翻譯中..." : "Đang dịch..."}</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            {lang === "zh" ? "城市" : "Thành phố"} *
          </label>
          <select value={city} onChange={e => { setCity(e.target.value); setForm(f => ({...f, district: ""})) }}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400">
            <option value="">{lang==="zh" ? "選擇城市" : "Chọn thành phố"}</option>
            {CITIES.map(c => <option key={c.zh} value={c.zh}>{lang==="zh" ? c.zh : `${c.vi} (${c.zh})`}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            {lang === "zh" ? "行政區" : "Quận/Huyện"}
          </label>
          <select name="district" value={form.district} onChange={handleChange}
            disabled={!city}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 disabled:opacity-40">
            <option value="">{lang==="zh" ? "選擇區域" : "Chọn quận/huyện"}</option>
            {(DISTRICTS[city] || []).map(d => (
              <option key={d.zh} value={d.zh}>{lang==="zh" ? d.zh : `${d.vi} (${d.zh})`}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            {lang === "zh" ? "地址" : "Địa chỉ cụ thể"} *
          </label>
          <input name="address" value={form.address} onChange={handleChange}
            placeholder="VD: 185 Đường Quang Phục, Khu Trung"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
        </div>
      </div>

      {/* Thông số căn nhà */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          {lang === "zh" ? "物件資訊" : "Thông số căn nhà"}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(form.listing_type === "buy" ? [
            {name:"price",       label:lang==="zh"?"售價(萬)":"Giá bán (vạn Đài tệ)",         ph:lang==="zh"?"":"VD: 880", type:"number"},
            {name:"community_name",     label:lang==="zh"?"社區名稱":"Tên khu/toà nhà",         ph:"", type:"text"},
            {name:"area_ping",   label:lang==="zh"?"建物總坪":"Tổng diện tích (ping)",             ph:"", type:"number"},
            {name:"area_main_ping",     label:lang==="zh"?"主建物坪數":"Diện tích chính (ping)",       ph:"", type:"number"},
            {name:"area_balcony_ping",  label:lang==="zh"?"陽台坪數":"Diện tích ban công (ping)",      ph:"", type:"number"},
            {name:"area_basement_ping", label:lang==="zh"?"地下室坪數":"Diện tích hầm/ngầm (ping)",    ph:"", type:"number"},
            {name:"area_common_ping",   label:lang==="zh"?"公共坪數":"Diện tích công cộng (ping)",     ph:"", type:"number"},
            {name:"area_land_ping",     label:lang==="zh"?"土地坪數":"Diện tích đất (ping)",           ph:"", type:"number"},
            {name:"bedrooms",    label:lang==="zh"?"房間數":"Số phòng ngủ",                    ph:"", type:"number"},
            {name:"bathrooms",   label:lang==="zh"?"衛浴數":"Số WC",                           ph:"", type:"number"},
            {name:"floor",       label:lang==="zh"?"樓層":"Tầng",                              ph:"", type:"number"},
            {name:"total_floors",label:lang==="zh"?"總樓層":"Tổng số tầng",                   ph:"", type:"number"},
            {name:"age",         label:lang==="zh"?"屋齡(年)":"Tuổi nhà (năm)",               ph:"", type:"number"},
            {name:"total_units",        label:lang==="zh"?"總戶數":"Tổng số căn",               ph:"", type:"number"},
            {name:"units_per_floor",    label:lang==="zh"?"同層戶數":"Số căn mỗi tầng",         ph:"", type:"number"},
            {name:"elevator_count",     label:lang==="zh"?"電梯數":"Số thang máy",              ph:"", type:"number"},
          ] : [
            {name:"price",       label:lang==="zh"?"租金(元台幣/月)":"Giá thuê (Đài tệ/tháng)", ph:"", type:"number"},
            {name:"area_ping",   label:lang==="zh"?"建物總坪":"Tổng diện tích (ping)",             ph:"", type:"number"},
            {name:"bedrooms",    label:lang==="zh"?"房間數":"Số phòng ngủ",                    ph:"", type:"number"},
            {name:"bathrooms",   label:lang==="zh"?"衛浴數":"Số WC",                           ph:"", type:"number"},
            {name:"floor",       label:lang==="zh"?"樓層":"Tầng",                              ph:"", type:"number"},
            {name:"total_floors",label:lang==="zh"?"總樓層":"Tổng số tầng",                   ph:"", type:"number"},
            {name:"age",         label:lang==="zh"?"屋齡(年)":"Tuổi nhà (năm)",               ph:"", type:"number"},
            {name:"deposit",     label:lang==="zh"?"押金(月)":"Tiền cọc (tháng)",             ph:"", type:"number"},
            {name:"contract",    label:lang==="zh"?"合約期限":"Thời hạn hợp đồng",             ph:lang==="zh"?"":"VD: 1 năm",    type:"text"},
            {name:"electricity", label:lang==="zh"?"電費":"Tiền điện",                        ph:"", type:"text"},
            {name:"water",       label:lang==="zh"?"水費":"Tiền nước",                        ph:"", type:"text"},
            {name:"parking_fee", label:lang==="zh"?"管理費":"Phí quản lý",                    ph:"", type:"text"},
          ]).map(f => (
            <div key={f.name}>
              <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
              <input name={f.name} value={(form as any)[f.name]} onChange={handleChange}
                type={f.type} placeholder={f.ph}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
            </div>
          ))}
        </div>

        {form.listing_type === "buy" && (
          <div className="mt-3">
            <label className="text-xs text-gray-500 mb-1 block">{lang==="zh" ? "停車位" : "Chỗ đậu xe"}</label>
            <div className="flex gap-3">
              {[{v:true,zh:"有",vi:"Có"},{v:false,zh:"無",vi:"Không"}].map(o => (
                <button key={String(o.v)} type="button"
                  onClick={() => setForm(f => ({...f, parking: o.v, parking_note: o.v ? f.parking_note : ""}))}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                    form.parking === o.v ? "bg-red-600 border-red-600 text-white" : "border-gray-200 text-gray-500 hover:border-red-300"
                  }`}>
                  {lang==="zh" ? o.zh : o.vi}
                </button>
              ))}
            </div>
            {form.parking && (
              <input value={form.parking_note} onChange={e => setForm(f => ({...f, parking_note: e.target.value}))}
                placeholder={lang==="zh" ? "例：地下室B1，含產權車位" : "VD: Hầm B1, chỗ đậu có sổ riêng"}
                className="w-full mt-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
            )}
          </div>
        )}

        {/* Tiện ích xung quanh — áp dụng cho cả Bán và Cho thuê. Bấm chọn để bật, rồi điền chi tiết */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500">{lang==="zh" ? "周邊設施" : "Tiện ích xung quanh"}</p>
          <p className="text-[11px] text-gray-400">{lang==="zh" ? "點選啟用，再填寫詳細地點" : "Bấm chọn để bật, sau đó điền địa điểm cụ thể"}</p>
          <div className="grid grid-cols-2 gap-2">
            {NEARBY_FIELDS.map(nf => {
              const selected = nf.key in form.nearby
              return (
                <Fragment key={nf.key}>
                  <button type="button"
                    onClick={() => setForm(f => {
                      const next = { ...f.nearby }
                      if (nf.key in next) delete next[nf.key]
                      else next[nf.key] = ""
                      return { ...f, nearby: next }
                    })}
                    className={`flex items-center gap-2 py-2 px-3 rounded-xl text-sm font-medium border transition ${
                      selected ? "bg-red-600 border-red-600 text-white" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300"
                    }`}>
                    <nf.Icon size={15} strokeWidth={2} />
                    {lang==="zh"?nf.zh:nf.vi}
                  </button>
                  {selected && (
                    <div className="col-span-2 -mt-1">
                      <input value={form.nearby[nf.key] || ""}
                        onChange={e => setForm(f => ({...f, nearby: {...f.nearby, [nf.key]: e.target.value}}))}
                        placeholder={lang==="zh" ? "請輸入詳細地點名稱" : "Nhập tên địa điểm cụ thể"}
                        autoFocus
                        className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
        </div>

        {/* Checkbox + text options — chỉ áp dụng khi Cho thuê */}
        {form.listing_type === "rent" && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500">{lang==="zh" ? "其他條件" : "Điều kiện khác"}</p>
          {[
            {name:"pet",          zh:"允許養寵物",     vi:"Nuôi thú cưng"},
            {name:"household_reg",zh:"可設戶籍",       vi:"Nhập hộ khẩu"},
            {name:"subsidy",      zh:"可申請政府補貼", vi:"Xin trợ cấp chính phủ"},
            {name:"business_license", zh:"可營業登記", vi:"Đăng ký giấy phép kinh doanh"},
          ].map(o => (
            <label key={o.name} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition shrink-0 ${
                (form as any)[o.name] ? "bg-red-600 border-red-600" : "border-gray-300 group-hover:border-red-400"
              }`} onClick={() => setForm(f => ({...f, [o.name]: !(f as any)[o.name]}))}>
                {(form as any)[o.name] && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className="text-sm text-gray-700">{lang==="zh" ? o.zh : o.vi}</span>
            </label>
          ))}

          {/* Đậu xe — có ghi chú */}
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition shrink-0 cursor-pointer ${
              form.has_parking ? "bg-red-600 border-red-600" : "border-gray-300 hover:border-red-400"
            }`} onClick={() => setForm(f => ({...f, has_parking: !f.has_parking, parking_note: f.has_parking ? "" : f.parking_note}))}>
              {form.has_parking && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <span className="text-sm text-gray-700 shrink-0">{lang==="zh" ? "停車位" : "Đậu xe"}</span>
            {form.has_parking && (
              <input value={form.parking_note} onChange={e => setForm(f => ({...f, parking_note: e.target.value}))}
                placeholder={lang==="zh" ? "例：地下停車場，2000/月" : "VD: Hầm, 2000/tháng"}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-red-400" />
            )}
          </div>

          {/* Đồ đạc đi kèm */}
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition shrink-0 cursor-pointer ${
              form.has_furniture ? "bg-red-600 border-red-600" : "border-gray-300 hover:border-red-400"
            }`} onClick={() => setForm(f => ({...f, has_furniture: !f.has_furniture, furniture_note: f.has_furniture ? "" : f.furniture_note}))}>
              {form.has_furniture && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <span className="text-sm text-gray-700 shrink-0">{lang==="zh" ? "附傢俱家電" : "Đồ đạc đi kèm"}</span>
            {form.has_furniture && (
              <input value={form.furniture_note} onChange={e => setForm(f => ({...f, furniture_note: e.target.value}))}
                placeholder={lang==="zh" ? "例：冷氣、洗衣機、床" : "VD: Điều hoà, máy giặt, giường"}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-red-400" />
            )}
          </div>
        </div>
        )}
      </div>

      {/* Mô tả */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1 block">
          {lang === "zh" ? "物件描述" : "Mô tả căn nhà"}
        </label>
        <textarea
          name={lang === "zh" ? "description_zh" : "description_vi"}
          value={lang === "zh" ? form.description_zh : form.description_vi}
          onChange={handleChange}
          onBlur={e => autoTranslate(
            lang === "zh" ? "description_zh" : "description_vi",
            e.target.value,
            lang === "zh" ? "zh" : "vi"
          )}
          rows={5}
          placeholder={lang === "zh" ? "詳細描述物件特色..." : "Mô tả chi tiết về căn nhà..."}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none" />
        {translating && <p className="text-xs text-blue-500 mt-1 flex items-center gap-1"><Loader2 size={12} strokeWidth={2.5} className="animate-spin" /> {lang === "zh" ? "翻譯中..." : "Đang dịch..."}</p>}
      </div>

      {/* Upload ảnh */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
          <Camera size={16} strokeWidth={2.2} /> {lang === "zh" ? "上傳照片（最多20張）" : "Upload ảnh (tối đa 20 ảnh)"}
        </label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 transition">
          <FolderOpen size={26} strokeWidth={1.8} className="mb-1 text-gray-400" />
          <span className="text-sm text-gray-500">
            {lang === "zh" ? "點擊選擇照片" : "Chọn ảnh từ máy tính"}
          </span>
          <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
        </label>
        {existingImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {existingImages.map((src, i) => (
              <div key={src} className="relative">
                <img src={src} className="w-full h-20 object-cover rounded-lg" />
                <button type="button" onClick={() => setExistingImages(imgs => imgs.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900/80 text-white rounded-full flex items-center justify-center">
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}
        {previews.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {previews.map((src, i) => (
              <img key={i} src={src} className="w-full h-20 object-cover rounded-lg" />
            ))}
          </div>
        )}
      </div>

      {/* Video nhà */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
          <Video size={16} strokeWidth={2.2} /> {lang === "zh" ? "上傳影片" : "Video nhà"}
          <span className="text-gray-400 font-normal"> ({lang === "zh" ? "選填，單個影片≤500MB，時長≤10分鐘" : "không bắt buộc, ≤500MB, ≤10 phút"})</span>
        </label>

        {!videoPreview && !form.video_url && (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 transition">
            <Video size={26} strokeWidth={1.8} className="mb-1 text-gray-400" />
            <span className="text-sm text-gray-500">
              {lang === "zh" ? "點擊選擇影片" : "Chọn video từ máy tính"}
            </span>
            <input type="file" accept="video/*" onChange={handleVideo} className="hidden" />
          </label>
        )}

        {videoError && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertTriangle size={13} strokeWidth={2.2} /> {videoError}</p>
        )}

        {(videoPreview || form.video_url) && (
          <div className="relative mt-1">
            <video src={videoPreview || form.video_url} controls className="w-full max-h-64 rounded-xl bg-black" />
            <button type="button" onClick={removeVideo}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900/80 text-white rounded-full flex items-center justify-center">
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* Thông tin liên hệ */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
          <User size={16} strokeWidth={2.2} /> {lang === "zh" ? "聯絡資訊" : "Thông tin liên hệ"}
        </label>
        <div className="space-y-2">
          {[
            {name:"agent_name",    ph: lang==="zh"?"姓名 *":"Họ tên *"},
            {name:"agent_phone",   ph: lang==="zh"?"電話 *":"Số điện thoại *"},
            {name:"agent_line",    ph: lang==="zh"?"LINE ID（選填）":"LINE ID (không bắt buộc)"},
            {name:"agent_company", ph: lang==="zh"?"公司品牌（選填）":"Công ty (không bắt buộc)"},
            {name:"agent_branch",  ph: lang==="zh"?"公司名稱（選填）":"Chi nhánh (không bắt buộc)"},
            {name:"agent_license", ph: lang==="zh"?"營業員證號（選填）":"Giấy phép hành nghề (không bắt buộc)"},
            {name:"agent_broker",  ph: lang==="zh"?"經紀人證號（選填）":"Số chứng chỉ môi giới (không bắt buộc)"},
          ].map(f => (
            <input key={f.name} name={f.name} value={(form as any)[f.name]}
              onChange={handleChange} placeholder={f.ph}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
          ))}
        </div>
      </div>

      {/* Submit — Xem trước */}
      <button onClick={() => {
        if (!form.title_vi || !form.price || !form.address) {
          alert(lang==="zh" ? "請填寫必填欄位：標題、地址、價格" : "Vui lòng điền: Tiêu đề, Địa chỉ và Giá")
          return
        }
        setPreview(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition text-base flex items-center justify-center gap-2">
        <Eye size={18} strokeWidth={2.2} /> {lang==="zh" ? "預覽刊登內容" : "Xem trước tin đăng"}
      </button>
      <button onClick={() => { localStorage.removeItem("taiwanhome_user"); router.push("/login") }}
        className="w-full text-xs text-gray-400 border border-gray-200 rounded-xl py-2.5 hover:text-red-500 hover:bg-gray-50 transition">
        {lang==="zh" ? "登出" : "Đăng xuất"}
      </button>
    </div>
  )
}