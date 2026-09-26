"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGateModal from "@/components/AuthGateModal";
import { ClubComposer, ClubStandings } from "@/components/clubs/ClubsBoard";
import { isSupabaseConfigured, supabaseClient } from "@/lib/supabase/client";
import { inviteClubLink, normalizeClubCode, safeReturnPath, type ClubActivity, type ClubMember, type ClubSummary } from "@/lib/clubs";

export function ClubsExperience({
  viewerId: initialViewerId,
  initialJoinCode,
}: {
  viewerId: string | null;
  initialJoinCode: string | null;
}) {
  const [viewerId, setViewerId] = useState<string | null>(initialViewerId);
  const [ready, setReady] = useState(initialViewerId == null);
  const [gateOpen, setGateOpen] = useState(initialViewerId == null);
  const [returnTo, setReturnTo] = useState(initialJoinCode ? `/clubs?join=${initialJoinCode}` : "/clubs");
  const [clubs, setClubs] = useState<ClubSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [activity, setActivity] = useState<ClubActivity[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [clubName, setClubName] = useState("");
  const [joinCode, setJoinCode] = useState(initialJoinCode ?? "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const active = clubs.find((club) => club.id === activeId) ?? null;

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const code = normalizeClubCode(params.get("join") ?? "");
      const next = code ? `/clubs?join=${code}` : "/clubs";
      if (!cancelled) {
        if (code) setJoinCode(code);
        setReturnTo(safeReturnPath(next) ?? "/clubs");
      }

      const load = async () => {
        if (!isSupabaseConfigured) {
          if (!cancelled) {
            setReady(true);
            setGateOpen(true);
          }
          return;
        }
        const { data } = await supabaseClient.auth.getUser();
        const user = data.user;
        if (!user) {
          if (!cancelled) {
            setReady(true);
            setGateOpen(true);
          }
          return;
        }
        if (!cancelled) setViewerId(user.id);
        const listed = await fetchClubs();
        if (cancelled) return;
        let nextClubs = listed;
        let focus = listed[0]?.id ?? null;
        if (code) {
          const joined = await postClub({ action: "join", code });
          if (joined.club?.id) {
            nextClubs = await fetchClubs();
            focus = joined.club.id;
          } else if (joined.error) {
            setNotice(joined.error);
          }
        }
        if (cancelled) return;
        setClubs(nextClubs);
        setActiveId(focus);
        setShowComposer(nextClubs.length === 0);
        if (focus) await loadDetail(focus, (detail) => {
          if (cancelled) return;
          setMembers(detail.members);
          setActivity(detail.activity);
        });
        if (!cancelled) setReady(true);
      };

      void load();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const selectClub = async (id: string) => {
    setActiveId(id);
    setShowComposer(false);
    await loadDetail(id, (detail) => {
      setMembers(detail.members);
      setActivity(detail.activity);
      setClubs((current) => current.map((club) => (club.id === id ? detail.club : club)));
    });
  };

  const refresh = async (focusId?: string) => {
    const listed = await fetchClubs();
    setClubs(listed);
    const focus = focusId && listed.some((club) => club.id === focusId) ? focusId : listed[0]?.id ?? null;
    setActiveId(focus);
    setShowComposer(listed.length === 0);
    if (focus) {
      await loadDetail(focus, (detail) => {
        setMembers(detail.members);
        setActivity(detail.activity);
      });
    } else {
      setMembers([]);
      setActivity([]);
    }
  };

  const createClub = async () => {
    setBusy(true);
    setNotice(null);
    const result = await postClub({ action: "create", name: clubName });
    setBusy(false);
    if (!result.club?.id) {
      setNotice(result.error ?? "Could not create the club");
      return;
    }
    setClubName("");
    setNotice(`Club created. Code ${result.club.code}.`);
    await refresh(result.club.id);
  };

  const joinClub = async () => {
    setBusy(true);
    setNotice(null);
    const result = await postClub({ action: "join", code: joinCode });
    setBusy(false);
    if (!result.club?.id) {
      setNotice(result.error ?? "Could not join the club");
      return;
    }
    setJoinCode("");
    setNotice(`Joined ${result.club.name}.`);
    await refresh(result.club.id);
  };

  const copyInvite = async () => {
    if (!active) return;
    const link = inviteClubLink(active.code);
    try {
      await navigator.clipboard.writeText(link);
      setNotice("Invite link copied.");
    } catch {
      setNotice("Could not copy the invite link.");
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col justify-between">
      <div>
        <Navbar />
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">Friend &amp; office leagues</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-zinc-900">Private Scout Clubs</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Compete against coworkers, friends, or your sports trivia crew.
          </p>

          {!ready ? (
            <div className="mt-8 h-48 animate-pulse rounded-3xl border border-zinc-200 bg-white" />
          ) : !viewerId ? (
            <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6">
              <p className="text-sm text-zinc-600">Sign in to create a club or join one with an invite code.</p>
              <button
                type="button"
                onClick={() => setGateOpen(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl text-sm"
              >
                Sign in
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {clubs.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {clubs.length > 1 &&
                    clubs.map((club) => (
                      <button
                        key={club.id}
                        type="button"
                        onClick={() => { void selectClub(club.id); }}
                        className={`rounded-xl px-3 py-2 text-xs font-bold ${
                          club.id === activeId
                            ? "bg-blue-600 text-white"
                            : "border border-zinc-200 bg-white text-zinc-700 hover:border-blue-400"
                        }`}
                      >
                        {club.name}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() => setShowComposer((open) => !open)}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 hover:border-blue-400 hover:text-blue-600"
                  >
                    Create / Join Another
                  </button>
                </div>
              )}

              {(clubs.length === 0 || showComposer) && (
                <ClubComposer
                  clubName={clubName}
                  joinCode={joinCode}
                  busy={busy}
                  onClubName={setClubName}
                  onJoinCode={setJoinCode}
                  onCreate={() => { void createClub(); }}
                  onJoin={() => { void joinClub(); }}
                />
              )}

              {active && (
                <ClubStandings
                  club={active}
                  members={members}
                  activity={activity}
                  viewerId={viewerId}
                  onCopyInvite={() => { void copyInvite(); }}
                />
              )}
            </div>
          )}

          {notice && (
            <p className="mt-4 text-sm font-bold text-zinc-700" role="status">
              {notice}
            </p>
          )}
        </div>
      </div>
      <Footer />
      <AuthGateModal
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        featureName="Private Scout Clubs"
        returnTo={returnTo}
      />
    </main>
  );
}

async function fetchClubs(): Promise<ClubSummary[]> {
  const response = await fetch("/api/clubs");
  if (!response.ok) return [];
  const body = (await response.json()) as { clubs?: ClubSummary[] };
  return body.clubs ?? [];
}

async function loadDetail(
  id: string,
  apply: (detail: { club: ClubSummary; members: ClubMember[]; activity: ClubActivity[] }) => void,
) {
  const response = await fetch(`/api/clubs/${id}`);
  if (!response.ok) return;
  const body = (await response.json()) as { club: ClubSummary; members: ClubMember[]; activity: ClubActivity[] };
  apply(body);
}

async function postClub(payload: Record<string, unknown>): Promise<{ club?: ClubSummary; error?: string }> {
  const response = await fetch("/api/clubs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { club?: ClubSummary; error?: string };
  if (!response.ok) return { error: body.error || "Could not update the club" };
  return body;
}
