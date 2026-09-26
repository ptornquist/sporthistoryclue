import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function clubSession() {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    return { supabase, user: data.user };
  } catch {
    return null;
  }
}

export function clubError(message: string): { status: number; error: string } {
  if (message.includes("not authenticated")) return { status: 401, error: "Sign in required" };
  if (message.includes("club not found")) return { status: 404, error: "Club not found" };
  if (message.includes("club limit")) return { status: 400, error: "You can belong to 12 clubs" };
  if (message.includes("profile missing")) return { status: 400, error: "Create a scout profile first" };
  if (message.includes("invalid")) return { status: 400, error: "Check the club name or code" };
  if (message.includes("code taken")) return { status: 409, error: "That code is already in use" };
  return { status: 500, error: "Could not update the club" };
}
