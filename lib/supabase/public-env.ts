export function publicSupabaseEnv(
  env: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !/^https?:\/\//.test(url) || !URL.canParse(url)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP(S) URL");
  }
  if (!key || key.startsWith("replace-with-") || key.startsWith("sb_secret_")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required");
  }

  return { url, key };
}
