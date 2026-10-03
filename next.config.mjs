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
const nextConfig = {};

export default nextConfig;
