"use client"
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import Hls from "hls.js"

// Video wrapper hỗ trợ cả 2 nguồn:
// - Bunny Stream (.m3u8) → dùng hls.js (Chrome/Android) hoặc HLS native (Safari/iOS)
// - File .mp4 cũ (video Reels còn sót lại trên Supabase Storage trước khi backfill)
//   → phát trực tiếp như <video> bình thường, không cần hls.js

type Props = React.VideoHTMLAttributes<HTMLVideoElement> & { src: string }

const HlsVideo = forwardRef<HTMLVideoElement, Props>(function HlsVideo(
  { src, ...rest },
  forwardedRef
) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useImperativeHandle(forwardedRef, () => videoRef.current as HTMLVideoElement)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

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
      hls.loadSource(src)
      hls.attachMedia(video)
      return () => hls.destroy()
    }

    // Fallback cuối cùng: thử phát trực tiếp
    video.src = src
  }, [src])

  return <video ref={videoRef} {...rest} />
})

export default HlsVideo
