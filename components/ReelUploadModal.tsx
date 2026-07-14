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
const MAX_REEL_BYTES = 350 * 1024 * 1024 // 350MB — đủ cho clip 90s chất lượng cao

export default function ReelUploadModal({ propertyId, propertySource, phone, listingType, onClose, onUploaded }: Props) {
  const { lang } = useLang()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [duration, setDuration] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f) return
    setError("")

    if (f.size > MAX_REEL_BYTES) {
      setError(lang === "zh" ? "影片大小不可超過 350MB" : "Video không được vượt quá 350MB")
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

  // Chụp 1 khung hình ở giây thứ 1 làm ảnh thumbnail
  async function captureThumbnail(videoEl: HTMLVideoElement): Promise<Blob | null> {
    return new Promise(resolve => {
      const canvas = document.createElement("canvas")
      canvas.width = videoEl.videoWidth
      canvas.height = videoEl.videoHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) { resolve(null); return }
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.85)
    })
  }

  function grabFrameForThumbnail(): Promise<Blob | null> {
    return new Promise(resolve => {
      if (!preview) { resolve(null); return }
      const v = document.createElement("video")
      v.src = preview
      v.muted = true
      v.playsInline = true
      v.onloadeddata = () => { v.currentTime = Math.min(1, (duration || 1) / 2) }
      v.onseeked = async () => resolve(await captureThumbnail(v))
      v.onerror = () => resolve(null)
    })
  }

  async function handleSubmit() {
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase()
      const contentType = ext === "mov" ? "video/quicktime"
        : ext === "webm" ? "video/webm"
        : ext === "mkv"  ? "video/x-matroska"
        : "video/mp4"
      const subFolder = listingType === "rent" ? "rent" : "sell"
      const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const path = `reels/${subFolder}/${stamp}.${ext}`

      const { error: upErr } = await supabase.storage
        .from("user_video").upload(path, file, { upsert: true, contentType })
      if (upErr) throw new Error(upErr.message)
      const { data: urlData } = supabase.storage.from("user_video").getPublicUrl(path)
      const videoUrl = urlData.publicUrl

      let thumbUrl: string | null = null
      const thumbBlob = await grabFrameForThumbnail()
      if (thumbBlob) {
        const thumbPath = `reels/${subFolder}/${stamp}-thumb.jpg`
        const { error: thumbErr } = await supabase.storage
          .from("user_video").upload(thumbPath, thumbBlob, { upsert: true, contentType: "image/jpeg" })
        if (!thumbErr) thumbUrl = supabase.storage.from("user_video").getPublicUrl(thumbPath).data.publicUrl
      }

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
                  {lang === "zh" ? `最長 ${MAX_REEL_SECONDS} 秒 · 支援 4K` : `Tối đa ${MAX_REEL_SECONDS} giây · Hỗ trợ 4K`}
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
                  {uploading ? <><Loader2 size={15} className="animate-spin" /> {lang === "zh" ? "上傳中..." : "Đang tải..."}</> : (lang === "zh" ? "送出" : "Gửi video")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
