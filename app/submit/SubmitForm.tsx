"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import { useLang } from "@/context/LangContext"

const DISTRICTS_ZH = ["北區","南區","西區","東區","北屯區","南屯區","西屯區","太平區","大里區","霧峰區","烏日區","大肚區","龍井區","梧棲區","清水區","沙鹿區","神岡區","大雅區","潭子區","豐原區","石岡區","東勢區","新社區","和平區","后里區"]

export default function SubmitForm() {
  const { lang } = useLang()
  const router   = useRouter()
  const supabase = createClient()

  const [user, setUser]       = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [images, setImages]   = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const [form, setForm] = useState({
    listing_type:  "buy",
    property_type: "apartment",
    title_vi:      "",
    title_zh:      "",
    address:       "",
    district:      "北區",
    price:         "",
    area_ping:     "",
    bedrooms:      "2",
    bathrooms:     "1",
    floor:         "3",
    total_floors:  "7",
    age:           "10",
    description_vi: "",
    agent_name:    "",
    agent_phone:   "",
    agent_line:    "",
  })

  // Kiểm tra đăng nhập
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login")
      else setUser(data.user)
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit() {
    if (!form.title_vi || !form.price || !form.address) {
      alert(lang === "zh" ? "請填寫必填欄位" : "Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }
    setLoading(true)

    try {
      // 1. Upload ảnh lên Supabase Storage
      const imageUrls: string[] = []
      for (const file of images) {
        const ext  = file.name.split(".").pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage
          .from("AG1780095")
          .upload(path, file, { upsert: true })
        if (!error) {
          const { data: urlData } = supabase.storage
            .from("AG1780095")
            .getPublicUrl(path)
          imageUrls.push(urlData.publicUrl)
        }
      }

      // 2. Lưu vào bảng properties
      const { error } = await supabase.from("properties").insert({
        ...form,
        price:       parseFloat(form.price),
        area_ping:   parseFloat(form.area_ping),
        bedrooms:    parseInt(form.bedrooms),
        bathrooms:   parseInt(form.bathrooms),
        floor:       parseInt(form.floor),
        total_floors:parseInt(form.total_floors),
        age:         parseInt(form.age),
        images:      imageUrls,
        title_zh:    form.title_zh || form.title_vi,
        description_zh: form.description_vi,
        address_vi:  form.address,
        district_vi: form.district,
        city:        "台中市",
        city_vi:     "Đài Trung",
        near_mrt:    "",
        near_mrt_vi: "",
        walk_minutes: 0,
        facing:      "南",
        features:    [],
        features_vi: [],
        lat:         24.1477,
        lng:         120.6736,
        is_new:      true,
        is_featured: false,
        parking:     false,
        views:       0,
        posted_at:   new Date().toISOString(),
        submitted_by: user?.email,
        agent_name_vi: form.agent_name,
        agent_avatar:  null,
      })

      if (error) throw error
      setDone(true)
      setTimeout(() => router.push("/listings"), 2000)

    } catch (err: any) {
      alert("Lỗi: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="text-center py-20 text-gray-400">Đang kiểm tra đăng nhập...</div>

  if (done) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">✅</p>
      <p className="text-xl font-bold text-gray-800">
        {lang === "zh" ? "刊登成功！" : "Đăng tin thành công!"}
      </p>
      <p className="text-gray-500 mt-2">
        {lang === "zh" ? "正在跳轉..." : "Đang chuyển trang..."}
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">
          🏠 {lang === "zh" ? "刊登物件" : "Đăng tin bất động sản"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {lang === "zh" ? "請填寫物件資料" : "Điền thông tin căn nhà của bạn"}
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
            {v:"apartment",zh:"公寓大廈",vi:"Chung cư"},
            {v:"house",    zh:"透天厝",  vi:"Nhà phố"},
            {v:"studio",   zh:"套房",    vi:"Studio"},
            {v:"villa",    zh:"豪宅",    vi:"Biệt thự"},
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
            {lang === "zh" ? "標題 (越南文)" : "Tiêu đề tin đăng"} *
          </label>
          <input name="title_vi" value={form.title_vi} onChange={handleChange}
            placeholder="VD: Nhà phố 3 tầng gần Metro..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            {lang === "zh" ? "地址" : "Địa chỉ"} *
          </label>
          <input name="address" value={form.address} onChange={handleChange}
            placeholder="VD: 185 Đường Quang Phục, Khu Trung"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1 block">
            {lang === "zh" ? "行政區" : "Quận/Huyện"}
          </label>
          <select name="district" value={form.district} onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400">
            {DISTRICTS_ZH.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Thông số */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          {lang === "zh" ? "物件資訊" : "Thông số căn nhà"}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            {name:"price",      label:lang==="zh"?"價格(萬)":"Giá (vạn NTD)",   ph:"1680"},
            {name:"area_ping",  label:lang==="zh"?"坪數":"Diện tích (ping)",    ph:"52"},
            {name:"bedrooms",   label:lang==="zh"?"房間數":"Số phòng ngủ",      ph:"2"},
            {name:"bathrooms",  label:lang==="zh"?"衛浴數":"Số WC",             ph:"1"},
            {name:"floor",      label:lang==="zh"?"樓層":"Tầng",               ph:"3"},
            {name:"total_floors",label:lang==="zh"?"總樓層":"Tổng số tầng",    ph:"7"},
            {name:"age",        label:lang==="zh"?"屋齡(年)":"Tuổi nhà (năm)", ph:"10"},
          ].map(f => (
            <div key={f.name}>
              <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
              <input name={f.name} value={(form as any)[f.name]} onChange={handleChange}
                type="number" placeholder={f.ph}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Mô tả */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1 block">
          {lang === "zh" ? "物件描述" : "Mô tả căn nhà"}
        </label>
        <textarea name="description_vi" value={form.description_vi} onChange={handleChange}
          rows={4} placeholder={lang === "zh" ? "詳細描述..." : "Mô tả chi tiết về căn nhà..."}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none" />
      </div>

      {/* Upload ảnh */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          📸 {lang === "zh" ? "上傳照片" : "Upload ảnh"} (tối đa 10 ảnh)
        </label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 transition">
          <span className="text-2xl mb-1">📁</span>
          <span className="text-sm text-gray-500">
            {lang === "zh" ? "點擊選擇照片" : "Chọn ảnh từ máy tính"}
          </span>
          <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
        </label>
        {previews.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {previews.map((src, i) => (
              <img key={i} src={src} className="w-full h-20 object-cover rounded-lg" />
            ))}
          </div>
        )}
      </div>

      {/* Thông tin liên hệ */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          👤 {lang === "zh" ? "聯絡資訊" : "Thông tin liên hệ"}
        </label>
        <div className="space-y-2">
          {[
            {name:"agent_name",  ph: lang==="zh"?"姓名":"Họ tên"},
            {name:"agent_phone", ph: lang==="zh"?"電話":"Số điện thoại"},
            {name:"agent_line",  ph: "LINE ID"},
          ].map(f => (
            <input key={f.name} name={f.name} value={(form as any)[f.name]}
              onChange={handleChange} placeholder={f.ph}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400" />
          ))}
        </div>
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition text-base">
        {loading
          ? (lang === "zh" ? "上傳中..." : "Đang đăng tin...")
          : (lang === "zh" ? "🚀 立即刊登" : "🚀 Đăng tin ngay")}
      </button>
    </div>
  )
}