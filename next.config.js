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
  },
};

module.exports = nextConfig;