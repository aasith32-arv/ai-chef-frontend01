import type { NextConfig } from "next";
import path from "path";

function backendOrigin() {
  const configured =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";
  const normalized = configured
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/i, "")
    .replace(/\/api$/i, "");

  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error(
      "BACKEND_API_URL must be an absolute Railway API origin, for example https://api.example.com"
    );
  }
  return normalized;
}

const nextConfig: NextConfig = {
  turbopack: {
    // When dependencies are hoisted to the workspace root, point Turbopack
    // at the workspace root so it can resolve packages like `next`.
    root: path.resolve(__dirname, ".."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/v1/:path*",
        destination: `${backendOrigin()}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
