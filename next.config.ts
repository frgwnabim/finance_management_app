import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // CSV import sends up to a 2MB file's rows to a Server Action.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
