import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enables React strict mode
  swcMinify: true, // Uses SWC for faster builds
  eslint: {
    ignoreDuringBuilds: true, // Prevents ESLint errors from breaking the build
  },
};

export default nextConfig;
