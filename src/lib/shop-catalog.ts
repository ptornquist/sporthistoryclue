import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";

export interface PurchaseBadgeResult {
  success?: boolean;
  new_score?: number;
  error?: string;
}

export function formatShopBalance(score: number | null): string {
  if (score == null) return "— PTS";
  return `${score.toLocaleString("en-US")} PTS`;
}

interface ShopClient {
  auth: {
    getUser: () => PromiseLike<{ data: { user: { id: string } | null } }>;
  };
  from: (table: "profiles") => {
    select: (columns: "career_score") => {
      eq: (
        column: "id",
        value: string,
      ) => {
        maybeSingle: () => PromiseLike<{
          data: { career_score?: number | null } | null;
          error: { message?: string } | null;
        }>;
      };
    };
  };
}

function gameClient(): ShopClient {
  return supabaseClient as unknown as ShopClient;
}

/** Signed-in career score for the shop balance. Guests receive null. */
export async function loadShopBalance(supabase?: ShopClient): Promise<number | null> {
  const client = supabase ?? (isSupabaseConfigured ? gameClient() : null);
  if (!client) return null;

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;

    const { data, error } = await client
      .from("profiles")
      .select("career_score")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to load shop balance:", error);
      return null;
    }
    return data?.career_score ?? 0;
  } catch (error) {
    console.error("Failed to load shop balance:", error);
    return null;
  }
}

interface OwnedBadgeClient {
  auth: ShopClient["auth"];
  from: (table: "user_badges") => {
    select: (columns: "badge_id") => {
      eq: (
        column: "user_id",
        value: string,
      ) => PromiseLike<{
        data: { badge_id: string }[] | null;
        error: { message?: string } | null;
      }>;
    };
  };
}

interface PurchaseClient {
  rpc: (
    fn: "purchase_badge",
    args: { p_badge_id: string; p_cost: number },
  ) => PromiseLike<{ data: PurchaseBadgeResult | null; error: { message?: string } | null }>;
}

function ownedClient(): OwnedBadgeClient {
  return supabaseClient as unknown as OwnedBadgeClient;
}

function purchaseGameClient(): PurchaseClient {
  return supabaseClient as unknown as PurchaseClient;
}

/** Badge ids this scout has already unlocked. */
export async function loadOwnedBadgeIds(supabase?: OwnedBadgeClient): Promise<Set<string>> {
  const client = supabase ?? (isSupabaseConfigured ? ownedClient() : null);
  if (!client) return new Set();

  try {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return new Set();

    const { data: ownedData, error } = await client
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to load owned badges:", error);
      return new Set();
    }
    return new Set(ownedData?.map((badge) => badge.badge_id) || []);
  } catch (error) {
    console.error("Failed to load owned badges:", error);
    return new Set();
  }
}

/** Spends career points for one badge. The database checks the price. */
export async function purchaseBadge(
  badgeId: string,
  cost: number,
  supabase?: PurchaseClient,
): Promise<{ data: PurchaseBadgeResult | null; error: { message?: string } | null }> {
  const client = supabase ?? (isSupabaseConfigured ? purchaseGameClient() : null);
  if (!client) {
    return { data: { success: false, error: "Could not purchase" }, error: null };
  }

  try {
    const { data, error } = await client.rpc("purchase_badge", {
      p_badge_id: badgeId,
      p_cost: cost,
    });
    return { data, error };
  } catch (error) {
    console.error("Failed to purchase badge:", error);
    return {
      data: null,
      error: { message: error instanceof Error ? error.message : "Could not purchase" },
    };
  }
}
