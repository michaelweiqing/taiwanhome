// Helper gọi Bunny Stream API — chỉ dùng phía server (API routes), KHÔNG import vào
// component client vì cần BUNNY_STREAM_API_KEY (secret).

const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!
const API_KEY = process.env.BUNNY_STREAM_API_KEY!
const CDN_HOST = process.env.BUNNY_STREAM_CDN_HOSTNAME!

const BASE_URL = `https://video.bunnycdn.com/library/${LIBRARY_ID}`

export interface BunnyUploadResult {
  videoId: string
  videoUrl: string       // HLS playlist (.m3u8) — dùng cho <video>/hls.js
  thumbnailUrl: string   // Bunny tự sinh thumbnail sau khi encode xong
  iframeUrl: string      // Nhúng player có sẵn của Bunny (nếu cần)
}

export async function uploadVideoToBunny(
  file: Blob,
  title: string
): Promise<BunnyUploadResult> {
  if (!LIBRARY_ID || !API_KEY || !CDN_HOST) {
    throw new Error("Thiếu biến môi trường BUNNY_STREAM_*")
  }

  // Bước 1: tạo video entry, nhận videoId (guid)
  const createRes = await fetch(`${BASE_URL}/videos`, {
    method: "POST",
    headers: { AccessKey: API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  })
  if (!createRes.ok) {
    throw new Error(`Bunny create video thất bại: ${createRes.status} ${await createRes.text()}`)
  }
  const { guid: videoId } = await createRes.json()

  // Bước 2: upload binary
  const buffer = Buffer.from(await file.arrayBuffer())
  const uploadRes = await fetch(`${BASE_URL}/videos/${videoId}`, {
    method: "PUT",
    headers: { AccessKey: API_KEY, "Content-Type": "application/octet-stream" },
    body: buffer,
  })
  if (!uploadRes.ok) {
    throw new Error(`Bunny upload thất bại: ${uploadRes.status} ${await uploadRes.text()}`)
  }

  return {
    videoId,
    videoUrl: `https://${CDN_HOST}/${videoId}/playlist.m3u8`,
    thumbnailUrl: `https://${CDN_HOST}/${videoId}/thumbnail.jpg`,
    iframeUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`,
  }
}

export async function deleteVideoFromBunny(videoId: string): Promise<void> {
  await fetch(`${BASE_URL}/videos/${videoId}`, {
    method: "DELETE",
    headers: { AccessKey: API_KEY },
  })
}
