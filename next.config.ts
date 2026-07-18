import type { NextConfig } from "next";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || "https://msfmapi.sanandaj.ir/api/v1";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/v1/:path*",
        destination: `${INTERNAL_API_URL}/:path*`,
      },
      {
        source: "/api-proxy/:path*",
        destination: `${INTERNAL_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;