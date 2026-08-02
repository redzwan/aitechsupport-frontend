import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "api.aichatsupport.my" },
      // Pre-rebrand domain: kept so images generated/stored before the
      // rename (old presigned/proxied URLs) still render.
      { protocol: "https", hostname: "api.aitechsupport.my" },
    ],
  },
};

export default nextConfig;
