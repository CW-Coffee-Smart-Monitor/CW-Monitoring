import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['i.pravatar.cc'], // contoh domain
  },
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
