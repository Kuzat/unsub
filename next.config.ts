import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Configure any additional Next.js settings here
  images: {
    remotePatterns: [new URL("https://logos.cdn.unsub.cash/**")],
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb"
    }
  }
};

export default nextConfig;
