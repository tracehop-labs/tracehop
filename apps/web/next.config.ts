import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/x",
        destination: "https://x.com/tracehopauto",
        permanent: true,
      },
      {
        source: "/telegram",
        destination: "https://t.me/tracehop_bot",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
