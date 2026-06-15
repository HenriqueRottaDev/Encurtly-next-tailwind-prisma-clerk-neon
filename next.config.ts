import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@clerk/nextjs', '@clerk/backend'],
};

export default nextConfig;