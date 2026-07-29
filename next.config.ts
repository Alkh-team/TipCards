import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow any HTTPS image host (avatars from OAuth, user-supplied URLs)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "localhost" },
    ],
  },
};

export default nextConfig;
