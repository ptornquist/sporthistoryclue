import type { Metadata } from "next";
import { ScoutProfileActions } from "@/components/game/ScoutProfileActions";
import { ScoutPublicCard } from "@/components/game/ScoutPublicCard";
import { cleanScoutHandle, loadPublicScout, loadScoutActions } from "@/lib/scout-profile";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const handle = cleanScoutHandle(username);
  return { title: handle ? `@${handle} · Scout` : "Scout" };
}

export default async function PublicScoutPage({ params }: PageProps) {
  const { username } = await params;
  const cleanUsername = cleanScoutHandle(username);

  if (!isSupabaseConfigured) {
    return <ScoutPublicCard username={cleanUsername} missing />;
  }

  const supabase = await createServerSupabaseClient();
  const loaded = await loadPublicScout(supabase, username);
  if (!loaded) {
    return <ScoutPublicCard username={cleanUsername} missing />;
  }

  const actions = await loadScoutActions(
    supabase,
    loaded.profile.id,
    loaded.profile.username,
  );

  return (
    <ScoutPublicCard
      username={loaded.profile.username || cleanUsername}
      careerScore={loaded.profile.career_score || 0}
      fixturesCleared={loaded.profile.fixtures_cleared || 0}
      badges={loaded.badges}
      actions={
        actions.showActions ? (
          <ScoutProfileActions
            profileId={loaded.profile.id}
            username={loaded.profile.username || cleanUsername}
            viewerId={actions.viewerId}
            viewerScore={actions.viewerScore}
            initiallyFollowing={actions.following}
          />
        ) : null
      }
    />
  );
}
