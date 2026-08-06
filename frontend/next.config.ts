import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Next.js Image to serve external images (e.g., Google CDN avatars)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Standalone output for production Docker builds
  output: "standalone",
};

export default nextConfig;
