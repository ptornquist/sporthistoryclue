import { supabaseClient } from "@/lib/supabase/client";

export interface ShopItem {
  id: string;
  name: string;
  detail: string;
  cost: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "rookie-pin",
    name: "Rookie Pin",
    detail: "A first-season scout badge for clearing the opening fixtures.",
    cost: 500,
  },
  {
    id: "archive-lantern",
    name: "Archive Lantern",
    detail: "Lights the older drawers in the match archive.",
    cost: 1500,
  },
  {
    id: "gold-whistle",
    name: "Gold Whistle",
    detail: "Marks a scout who reads the room before the climax.",
    cost: 3000,
  },
  {
    id: "hall-of-fame-sash",
    name: "Hall of Fame Sash",
    detail: "Worn after a long career on the standings board.",
    cost: 7500,
  },
  {
    id: "chief-crest",
    name: "Chief of Intel Crest",
    detail: "The top shelf of the club shop.",
    cost: 12000,
  },
];

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
export async function loadShopBalance(supabase: ShopClient = gameClient()): Promise<number | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("career_score")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load shop balance:", error);
    return null;
  }
  return data?.career_score ?? 0;
}
