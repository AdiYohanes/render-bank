/** @type {import('next').NextConfig} */
const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);

const nextConfig = {
  images: {
    // ponytail: local previews skip optimization; use public HTTPS delivery for optimized production artwork.
    unoptimized: storageUrl?.hostname === "127.0.0.1" || storageUrl?.hostname === "localhost",
    remotePatterns: storageUrl ? [{ protocol: storageUrl.protocol.replace(":", ""), hostname: storageUrl.hostname, port: storageUrl.port, pathname: "/storage/v1/object/public/prompt-previews/**" }] : [],
  },
};

export default nextConfig;
