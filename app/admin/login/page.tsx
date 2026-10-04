import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { login } from "@/lib/admin/actions";
import { activeAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; expired?: string; next?: string }> }) {
  if (await activeAdmin()) redirect("/admin/dashboard");
  const params = await searchParams;
  return <main id="main" className="admin-login"><form action={login} className="admin-panel admin-login-card">
    <p className="eyebrow">RenderBank CMS</p><h1>Admin login</h1>
    {params.expired && <p className="notice">Your admin session ended. Sign in again.</p>}
    {params.error && <p className="form-error" role="alert">{params.error}</p>}
    <input name="next" type="hidden" value={params.next ?? ""} />
    <label>Email<input required autoComplete="username" name="email" type="email" /></label>
    <label>Password<input required autoComplete="current-password" name="password" type="password" /></label>
    <button className="button-primary" type="submit">Sign in</button>
  </form></main>;
}
