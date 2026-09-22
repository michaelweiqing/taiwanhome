/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "wesvqztwssvbrvugvrcu.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "taiwanhome.b-cdn.net" },
    ],
    // Kích thước phù hợp với card lưới (mobile 1-2 cột) và ảnh chi tiết full-width
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    formats: ["image/webp"],
    // Next.js 16 chỉ cho phép các mức quality có trong danh sách này (mặc định chỉ [75]).
    // Thêm 85/90 để ImageGallery/PropertyCard dùng ảnh nét hơn cho ảnh chính.
    qualities: [75, 85, 90],
  },
};

module.exports = nextConfig;