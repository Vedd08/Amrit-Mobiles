import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — otherwise Next.js warns because it finds
  // another package-lock.json in a parent directory (unrelated to this app).
  turbopack: {
    root: __dirname,
  },
  experimental: {
    viewTransition: true,
    serverActions: {
      // Default is 1MB, which a single real product photo blows past —
      // the admin product form uploads multiple full-resolution images in
      // one submission. 40mb covers a handful of phone-camera photos per
      // product without needing anyone to compress them first.
      bodySizeLimit: "40mb",
    },
  },
  images: {
    remotePatterns: [
      // Seed/placeholder product photos.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      // Product images uploaded from the admin panel (Vercel Blob).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
