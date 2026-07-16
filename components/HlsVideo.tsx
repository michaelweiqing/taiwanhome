"use client"
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import Hls from "hls.js"

// Video wrapper hỗ trợ cả 2 nguồn:
// - Bunny Stream (.m3u8) → dùng hls.js (Chrome/Android) hoặc HLS native (Safari/iOS)
// - File .mp4 cũ (video Reels còn sót lại trên Supabase Storage trước khi backfill)
//   → phát trực tiếp như <video> bình thường, không cần hls.js
//
// LƯU Ý: chỉ dựa vào JSX prop `muted` là KHÔNG đủ — khi hls.js gắn media source vào
// thẻ <video>, một số trình duyệt (đặc biệt Chrome Android) reset trạng thái muted,
// khiến video tự phát tiếng. Phải ép `video.muted` bằng JS ngay trước & trong lúc gắn nguồn.

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & { src: string }

const HlsVideo = forwardRef<HTMLVideoElement, Props>(function HlsVideo(
  { src, muted, ...rest },
  forwardedRef
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useImperativeHandle(forwardedRef, () => videoRef.current as HTMLVideoElement)

  // Đồng bộ muted bất cứ khi nào prop đổi (kể cả sau khi người dùng bấm tắt/mở tiếng)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !!muted
    video.defaultMuted = !!muted
  }, [muted])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    // Ép muted trước khi gắn nguồn — quan trọng nhất để tránh phát tiếng ngoài ý muốn
    video.muted = !!muted
    video.defaultMuted = !!muted

    const isHls = src.includes(".m3u8")
    if (!isHls) {
      video.src = src
      return
    }

    // Safari/iOS đọc HLS native, không cần hls.js
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src
      return
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 15 })
      // Ép lại muted ngay khi media source vừa gắn xong, trước khi trình duyệt
      // có cơ hội tự ý bật tiếng.
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        video.muted = !!muted
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      return () => hls.destroy()
    }

    // Fallback cuối cùng: thử phát trực tiếp
    video.src = src
  }, [src, muted])

  return <video ref={videoRef} muted={muted} {...rest} />
})

export default HlsVideo
