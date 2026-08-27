import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: ["images.unsplash.com", "your-other-domain.com"], // yahan "images.unsplash.com" add karen
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sctjifwzxzmsyecijnic.supabase.co",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
