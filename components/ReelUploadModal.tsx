"use client"
import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase-browser"
import { useLang } from "@/context/LangContext"
import { X, UploadCloud, Loader2, CheckCircle2 } from "lucide-react"

interface Props {
  propertyId: string
  propertySource: "admin" | "user"
  phone: string
  listingType: "rent" | "buy"
  onClose: () => void
  onUploaded?: () => void
}

const MAX_REEL_SECONDS = 90
// Gói Cloudinary Free giới hạn cứng 100MB/video (kể cả upload chunked) — để dư khoảng
// đệm an toàn. Quay 4K 90s thường vượt mốc này rất nhiều; khuyến nghị người dùng quay 1080p.
const MAX_REEL_BYTES = 95 * 1024 * 1024 // 95MB
// Cloudinary chỉ cho phép nén/transform video on-the-fly (miễn phí) với file ≤40MB.
// File lớn hơn mốc này sẽ phát bản gốc (không resize) để tránh lỗi hiển thị.
const TRANSFORM_SAFE_BYTES = 35 * 1024 * 1024 // 35MB

export default function ReelUploadModal({ propertyId, propertySource, phone, listingType, onClose, onUploaded }: Props) {
  const { lang } = useLang()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [duration, setDuration] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [done, setDone] = useState(false)

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f) return
    setError("")

    if (f.size > MAX_REEL_BYTES) {
      const actualMb = (f.size / (1024 * 1024)).toFixed(1)
      setError(lang === "zh"
        ? `影片實際大小為 ${actualMb}MB，超過 95MB 上限（iOS 有時會將 HEVC 影片自動轉為 H.264，體積會變大許多）`
        : `Video thực tế nặng ${actualMb}MB, vượt giới hạn 95MB (iOS đôi khi tự chuyển HEVC sang H.264 khi tải lên, làm dung lượng tăng đáng kể so với Photos hiển thị)`)
      return
    }

    const url = URL.createObjectURL(f)
    const vid = document.createElement("video")
    vid.preload = "metadata"
    vid.onloadedmetadata = () => {
      if (vid.duration > MAX_REEL_SECONDS) {
        setError(lang === "zh"
          ? `影片時長不可超過 ${MAX_REEL_SECONDS} 秒`
          : `Video không được dài hơn ${MAX_REEL_SECONDS} giây`)
        URL.revokeObjectURL(url)
        return
      }
      setDuration(vid.duration)
      setFile(f)
      setPreview(url)
    }
    vid.onerror = () => {
      setError(lang === "zh" ? "無法讀取影片檔案" : "Không đọc được file video")
      URL.revokeObjectURL(url)
    }
    vid.src = url
  }

  // Upload trực tiếp từ trình duyệt lên Cloudinary (không qua server, tránh giới hạn
  // dung lượng của Vercel serverless function). Chỉ đẩy file gốc lên — việc nén xuống
  // 1080p diễn ra on-the-fly khi phát (qua URL transformation), không chặn lúc upload.
  function uploadToCloudinary(sig: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const form = new FormData()
      form.append("file", file as File)
      form.append("api_key", sig.apiKey)
      form.append("timestamp", String(sig.timestamp))
      form.append("signature", sig.signature)
      form.append("folder", sig.folder)

      const xhr = new XMLHttpRequest()
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`)
      xhr.upload.onprogress = ev => {
        if (ev.lengthComputable) setUploadPct(Math.round((ev.loaded / ev.total) * 100))
      }
      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) resolve(json)
          else reject(new Error(json?.error?.message || "Cloudinary upload thất bại"))
        } catch {
          reject(new Error("Cloudinary upload thất bại"))
        }
      }
      xhr.onerror = () => reject(new Error(
        lang === "zh"
          ? "上傳中斷 — 檔案可能過大或網路不穩，請嘗試較短或較低畫質的影片"
          : "Kết nối bị ngắt khi tải lên — có thể do file còn quá nặng hoặc mạng yếu, thử quay ngắn/nhẹ hơn"
      ))
      xhr.send(form)
    })
  }

  async function handleSubmit() {
    if (!file) return
    setUploading(true)
    setUploadPct(0)
    setError("")
    try {
      const subFolder = listingType === "rent" ? "rent" : "sell"

      const sigRes = await fetch("/api/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subFolder }),
      })
      const sig = await sigRes.json()
      if (!sigRes.ok) throw new Error(sig.error || "Không lấy được chữ ký Cloudinary")

      const result = await uploadToCloudinary(sig)
      const publicId: string = result.public_id
      const withinTransformLimit = file.size <= TRANSFORM_SAFE_BYTES
      // Cloudinary chỉ nén/trích thumbnail on-the-fly miễn phí cho file ≤40MB — dùng bản
      // resize khi an toàn, còn lại phát thẳng bản gốc và bỏ qua thumbnail (video vẫn ≤95MB nên tải ổn).
      const videoUrl = withinTransformLimit
        ? `https://res.cloudinary.com/${sig.cloudName}/video/upload/c_limit,w_1080,h_1920,q_auto,vc_h264/${publicId}.mp4`
        : (result.secure_url as string)
      const thumbUrl = withinTransformLimit
        ? `https://res.cloudinary.com/${sig.cloudName}/video/upload/so_1,w_400,h_711,c_fill,q_auto/${publicId}.jpg`
        : null

      const { error: rpcErr } = await supabase.rpc("insert_property_reel", {
        p_property_id: propertyId,
        p_property_source: propertySource,
        p_video_url: videoUrl,
        p_thumbnail_url: thumbUrl,
        p_duration_seconds: duration,
        p_phone: phone,
      })
      if (rpcErr) throw new Error(rpcErr.message)

      setDone(true)
      onUploaded?.()
    } catch (e: any) {
      setError(e?.message || (lang === "zh" ? "上傳失敗，請再試一次" : "Tải lên thất bại, vui lòng thử lại"))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-base">
            {lang === "zh" ? "上傳房屋短影音" : "Đăng video ngắn về nhà"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} strokeWidth={2.2} />
          </button>
        </div>

        {done ? (
          <div className="text-center py-8">
            <CheckCircle2 size={40} strokeWidth={1.8} className="mx-auto mb-3 text-green-500" />
            <p className="text-sm text-gray-700 font-semibold mb-1">
              {lang === "zh" ? "上傳成功！" : "Đã tải lên thành công!"}
            </p>
            <p className="text-xs text-gray-400 mb-5">
              {lang === "zh" ? "影片將於審核通過後顯示在首頁" : "Video sẽ hiển thị ở trang chủ sau khi được duyệt"}
            </p>
            <button onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition">
              {lang === "zh" ? "關閉" : "Đóng"}
            </button>
          </div>
        ) : (
          <>
            <input ref={fileRef} type="file" accept="video/*" hidden onChange={handlePick} />

            {!preview ? (
              <button onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl py-10 hover:border-red-300 hover:bg-red-50/40 transition">
                <UploadCloud size={28} strokeWidth={1.6} className="text-gray-300" />
                <span className="text-sm text-gray-500">
                  {lang === "zh" ? "選擇影片檔案" : "Chọn file video"}
                </span>
                <span className="text-[11px] text-gray-400">
                  {lang === "zh" ? `最長 ${MAX_REEL_SECONDS} 秒 · 建議以 1080p 拍攝，檔案 ≤95MB` : `Tối đa ${MAX_REEL_SECONDS} giây · Nên quay ở 1080p, dung lượng ≤95MB`}
                </span>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[360px] mx-auto">
                <video src={preview} className="w-full h-full object-contain" controls muted playsInline />
              </div>
            )}

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            {preview && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setFile(null); setPreview(""); setDuration(null) }}
                  className="flex-1 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition">
                  {lang === "zh" ? "重新選擇" : "Chọn lại"}
                </button>
                <button onClick={handleSubmit} disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl py-2.5 transition">
                  {uploading
                    ? <><Loader2 size={15} className="animate-spin" /> {lang === "zh" ? `上傳中 ${uploadPct}%` : `Đang tải ${uploadPct}%`}</>
                    : (lang === "zh" ? "送出" : "Gửi video")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
