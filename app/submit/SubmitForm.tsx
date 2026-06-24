"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-browser"
import { useLang } from "@/context/LangContext"

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
    {zh:"彰化市",vi:"Chương Hóa"},{zh:"員林市",vi:"Viên Lâm"},{zh:"和美鎮",vi:"Hòa Mỹ"},
    {zh:"鹿港鎮",vi:"Lộc Cảng"},
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

export default function SubmitForm() {
  const { lang } = useLang()
  const router   = useRouter()
  const supabase = createClient()

  const [user, setUser]       = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [images, setImages]   = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [preview, setPreview] = useState(false)
  const [city, setCity] = useState("台中市")

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
    description_vi: "",
    agent_name:    "",
    agent_phone:   "",
    agent_line:    "",
  })

  // Kiểm tra đăng nhập qua localStorage
  useEffect(() => {
    const stored = localStorage.getItem("taiwanhome_user")
    if (!stored) { router.push("/login"); return }
    const u = JSON.parse(stored)
    setUser(u)
    setForm(f => ({
      ...f,
      agent_name:  u.name  || "",
      agent_phone: u.phone || "",
      agent_line:  "",
    }))
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
        const path = `user_submit/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
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

      // 2. Lưu thẳng vào bảng properties — hiển thị ngay trên website
      const { error } = await supabase.from("properties").insert({
        listing_type:  form.listing_type,
        property_type: form.property_type,
        title_vi:      form.title_vi,
        title_zh:      form.title_vi,
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
        age:           parseInt(form.age) || 0,
        images:        imageUrls,
        agent_name:    form.agent_name,
        agent_name_vi: form.agent_name,
        agent_phone:   form.agent_phone,
        agent_line:    form.agent_line || "https://page.line.me/881vvzrj",
        agent_avatar:  null,
        facing:        "",
        features:      [],
        features_vi:   [],
        lat:           24.1477,
        lng:           120.6736,
        is_new:        true,
        is_featured:   false,
        parking:       false,
        views:         0,
        posted_at:     new Date().toISOString(),
        submitted_by:  user?.phone || "",
        price_per_ping: parseFloat(form.area_ping) > 0
          ? parseFloat((parseFloat(form.price) / parseFloat(form.area_ping)).toFixed(2))
          : null,
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

  // Màn hình xem trước
  if (preview) {
    const ptLabel: Record<string,string> = {
      apartment:"Chung cư thang máy", apartment_walkup:"Chung cư thang bộ",
      house:"Nhà cả căn", villa:"Biệt thự", studio:"Studio"
    }
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setPreview(false)}
            className="text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition">
            ← Sửa lại
          </button>
          <h2 className="text-lg font-black text-gray-900">Xem trước tin đăng</h2>
        </div>

        {/* Ảnh preview */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <img key={i} src={src} className={`w-full object-cover rounded-xl ${i===0 ? "col-span-3 h-52" : "h-24"}`} />
            ))}
          </div>
        )}

        {/* Thông tin chính */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${form.listing_type==="rent" ? "bg-blue-600" : "bg-emerald-600"}`}>
              {form.listing_type==="rent" ? "Cho thuê" : "Bán"}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{ptLabel[form.property_type] || form.property_type}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{form.title_vi}</h3>
          <p className="text-red-600 text-2xl font-black">{parseFloat(form.price).toLocaleString()} vạn Đài tệ</p>
          {form.area_ping && <p className="text-sm text-gray-500">{form.area_ping} ping · {(parseFloat(form.price)/parseFloat(form.area_ping)).toFixed(2)} vạn/ping</p>}
          <p className="text-sm text-gray-500">📍 {form.address}{form.district ? `, ${form.district}` : ""}{city ? `, ${CITIES.find(c=>c.zh===city)?.vi}` : ""}</p>
        </div>

        {/* Thông số */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <p className="text-sm font-bold text-gray-700 mb-3">Thông số</p>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              {label:"Phòng ngủ", val:form.bedrooms},
              {label:"WC",        val:form.bathrooms},
              {label:"Ping",      val:form.area_ping},
              {label:"Tuổi nhà",  val:form.age ? `${form.age}năm` : "-"},
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl py-2">
                <p className="text-sm font-bold text-gray-800">{item.val || "-"}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Liên hệ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-1">
          <p className="text-sm font-bold text-gray-700 mb-2">Thông tin liên hệ</p>
          <p className="text-sm text-gray-600">👤 {form.agent_name}</p>
          <p className="text-sm text-gray-600">📱 {form.agent_phone}</p>
          {form.agent_line && <p className="text-sm text-gray-600">💬 {form.agent_line}</p>}
        </div>

        {/* Nút đăng */}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition text-base">
          {loading ? "⏳ Đang đăng tin..." : "🚀 Xác nhận đăng tin"}
        </button>
        <button onClick={() => setPreview(false)}
          className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm">
          ← Quay lại sửa
        </button>
        <button onClick={() => { localStorage.removeItem("taiwanhome_user"); router.push("/login") }}
          className="w-full text-xs text-gray-400 border border-gray-200 rounded-xl py-2.5 hover:text-red-500 hover:bg-gray-50 transition">
          Đăng xuất
        </button>
      </div>
    )
  }

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
            {v:"apartment_walkup", zh:"公寓(無電梯)", vi:"Chung cư thang bộ"},
            {v:"apartment",        zh:"電梯大樓",      vi:"Chung cư thang máy"},
            {v:"house",            zh:"透天厝",        vi:"Nhà cả căn"},
            {v:"villa",            zh:"別墅",          vi:"Biệt thự"},
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

      {/* Thông số */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          {lang === "zh" ? "物件資訊" : "Thông số căn nhà"}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            {name:"price",       label:lang==="zh"?"價格(萬台幣)":"Giá (vạn Đài tệ)",  ph:""},
            {name:"area_ping",   label:lang==="zh"?"坪數":"Diện tích (ping)",   ph:""},
            {name:"bedrooms",    label:lang==="zh"?"房間數":"Số phòng ngủ",     ph:""},
            {name:"bathrooms",   label:lang==="zh"?"衛浴數":"Số WC",            ph:""},
            {name:"floor",       label:lang==="zh"?"樓層":"Tầng",              ph:""},
            {name:"total_floors",label:lang==="zh"?"總樓層":"Tổng số tầng",    ph:""},
            {name:"age",         label:lang==="zh"?"屋齡(年)":"Tuổi nhà (năm)",ph:""},
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

      {/* Submit — Xem trước */}
      <button onClick={() => {
        if (!form.title_vi || !form.price || !form.address) {
          alert("Vui lòng điền: Tiêu đề, Địa chỉ và Giá")
          return
        }
        setPreview(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition text-base">
        👁 Xem trước tin đăng
      </button>
      <button onClick={() => { localStorage.removeItem("taiwanhome_user"); router.push("/login") }}
        className="w-full text-xs text-gray-400 border border-gray-200 rounded-xl py-2.5 hover:text-red-500 hover:bg-gray-50 transition">
        Đăng xuất
      </button>
    </div>
  )
}