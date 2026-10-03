/** @type {import('next').NextConfig} */
const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);

const nextConfig = {
  images: {
    remotePatterns: storageUrl ? [{ protocol: storageUrl.protocol.replace(":", ""), hostname: storageUrl.hostname, port: storageUrl.port, pathname: "/storage/v1/object/public/prompt-previews/**" }] : [],
  },
};

export default nextConfig;
