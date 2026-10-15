import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import { createPublicSupabaseClient, createServerSupabaseClient } from "./server";

export interface Scout {
  id: string;
  username: string;
  /** A client that acts as this scout, for RPCs and RLS-scoped writes. */
  client: SupabaseClient;
}

function handleOf(email: string | undefined | null): string {
  return email?.split("@")[0]?.trim() || "scout";
}

/**
 * Who is calling. A bearer token from the browser session wins; otherwise the
 * cookie session the proxy keeps fresh.
 */
export async function resolveScout(request: Request): Promise<Scout | null> {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (bearer) {
    const byToken = await createPublicSupabaseClient().auth.getUser(bearer);
    if (byToken.data.user) {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${bearer}` } },
      });
      return { id: byToken.data.user.id, username: handleOf(byToken.data.user.email), client };
    }
  }

  const cookieClient = await createServerSupabaseClient();
  const session = await cookieClient.auth.getUser();
  if (!session.data.user) return null;
  return { id: session.data.user.id, username: handleOf(session.data.user.email), client: cookieClient };
}
