"use client";

import { useState } from "react";
import { sendDuelChallenge } from "@/lib/duels";
import { cleanScoutHandle } from "@/lib/scout-profile";
import { followScout, unfollowScout } from "@/lib/supabase/network";

export function ScoutProfileActions({
  profileId,
  username,
  viewerId,
  viewerScore,
  initiallyFollowing,
}: {
  profileId: string;
  username: string;
  viewerId: string | null;
  viewerScore: number;
  initiallyFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [busy, setBusy] = useState(false);
  const handle = cleanScoutHandle(username);

  const challenge = async () => {
    if (!viewerId) {
      alert("Sign in to challenge this scout.");
      return;
    }
    setBusy(true);
    const { data, error } = await sendDuelChallenge(handle, viewerScore);
    setBusy(false);
    if (data?.success) {
      alert(`Challenge sent to @${handle}! ⚔️`);
    } else {
      alert(data?.error || error?.message || "Could not send challenge");
    }
  };

  const toggleFollow = async () => {
    if (!viewerId) {
      alert("Sign in to follow this scout.");
      return;
    }
    setBusy(true);
    try {
      if (following) {
        await unfollowScout(viewerId, profileId);
        setFollowing(false);
      } else {
        await followScout(viewerId, profileId);
        setFollowing(true);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not update your network");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={challenge}
        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-black text-xs uppercase rounded-xl border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all disabled:opacity-60"
      >
        ⚔️ Challenge Scout
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={toggleFollow}
        className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase border-2 border-zinc-950"
      >
        {following ? "Following" : "Follow / Network"}
      </button>
    </div>
  );
}
