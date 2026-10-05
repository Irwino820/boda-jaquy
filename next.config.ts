import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 82, 92],
  },
  async headers() {
    return [
      {
        // La pista pesa ~4 MB: un día de caché evita revalidarla en cada visita.
        source: "/music/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
