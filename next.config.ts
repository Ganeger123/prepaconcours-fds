import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel handles output mode automatically */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
