const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
let trusted = key && (key !== key.trim() || key.startsWith("sb_secret_"));
if (key?.split(".").length === 3) {
  try {
    trusted ||= JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8")).role !== "anon";
  } catch {
    trusted = true;
  }
}
if (trusted) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must not contain a trusted credential");

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
