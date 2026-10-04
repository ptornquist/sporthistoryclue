import { safeReturnPath } from "@/lib/clubs";

/** PKCE callback for Supabase OAuth. Only same-origin app paths are forwarded. */
export function oauthCallbackUrl(origin: string, returnPath?: string | null): string {
  const callback = new URL("/auth/callback", origin);
  const next = safeReturnPath(returnPath);
  if (next) callback.searchParams.set("next", next);
  return callback.toString();
}
