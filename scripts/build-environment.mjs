const trustedKeys = new Set([
  "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SERVICE_ROLE_KEY",
  "PAYMENT_SECRET", "PAYMENT_WEBHOOK_SECRET", "EMAIL_PROVIDER_SECRET", "ACCESS_SESSION_SECRET",
  "MIDTRANS_SERVER_KEY",
]);

export function buildEnvironment(source, status) {
  const env = {};
  const secrets = [status.SECRET_KEY, status.SERVICE_ROLE_KEY];
  for (const [key, value] of Object.entries(source)) {
    const canonical = key.toUpperCase();
    if (trustedKeys.has(canonical)) secrets.push(value);
    else if (!canonical.startsWith("NEXT_PUBLIC_SUPABASE_")) env[key] = value;
  }
  env.NEXT_PUBLIC_SUPABASE_URL = status.API_URL;
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = status.PUBLISHABLE_KEY;
  return { env, secrets: secrets.filter(Boolean) };
}
