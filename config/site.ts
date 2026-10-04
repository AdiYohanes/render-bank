export const siteConfig = {
  name: "RenderBank",
  description: "A curated library of tested prompts for better AI visuals.",
};

const configured =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3000";

export function siteUrl() {
  return configured;
}
