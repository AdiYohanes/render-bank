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
  if (key.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (payload.role !== "anon") throw new Error();
    } catch {
      throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must not contain a trusted JWT");
    }
  }

  return { url, key };
}
