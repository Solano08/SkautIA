import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  transpilePackages: ["mapbox-gl"],
  experimental: {
    // Tree-shaking de imports por símbolo: reduce el JS inicial del dashboard.
    optimizePackageImports: ["recharts", "lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/data/:file*.geojson",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/data/:file*.geo.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/mapbox-gl-csp-worker.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "mapbox-gl": false,
      };
    }

    return config;
  },
};

export default nextConfig;
