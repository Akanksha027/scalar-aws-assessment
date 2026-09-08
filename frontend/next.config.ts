import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@cloudscape-design/components",
    "@cloudscape-design/component-toolkit",
  ],
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend}/api/v1/:path*`,
      },
      {
        source: "/health",
        destination: `${backend}/health`,
      },
    ];
  },
};

export default nextConfig;
