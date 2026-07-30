import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

if (isProduction && !process.env.BACKEND_URL) {
  throw new Error("BACKEND_URL must be set when building for production");
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
