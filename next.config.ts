import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unpkg.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.png$/,
      type: "asset/resource",
    });

    return config;
  },
};

export default nextConfig;
