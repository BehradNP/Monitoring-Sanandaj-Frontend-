import type { NextConfig } from "next";

const API_ORIGIN = process.env.INTERNAL_API_ORIGIN || "https://msfmapi.sanandaj.ir";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;