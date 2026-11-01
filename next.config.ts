import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  // Mặc định nằm góc dưới trái, đè lên avatar ở cuối sidebar.
  devIndicators: { position: "bottom-right" },
  // Backend không có CORS: trình duyệt chỉ gọi /api/* cùng origin, Next.js proxy sang backend.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
