import type { NextConfig } from "next";

/** Production Railway API — override with BACKEND_URL env on Vercel if needed. */
const PRODUCTION_BACKEND =
  "https://scalar-aws-assessment-production.up.railway.app";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@cloudscape-design/components",
    "@cloudscape-design/component-toolkit",
  ],
  async rewrites() {
    const backend =
      process.env.BACKEND_URL ??
      (process.env.VERCEL || process.env.NODE_ENV === "production"
        ? PRODUCTION_BACKEND
        : "http://127.0.0.1:8000");

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
