import React from "react";
import { supabase } from "../client";
import { useSession } from "../api/useSession";

import LogoPinkHome from "../assets/logo/logo_pink_home.svg";
import GoBackButton from "../assets/icons/go_back_button.svg";

const BRAND = "#382543";
const MEDIA_URL_EXPIRES_IN_SECONDS = 60 * 60;

type MatchesProps = {
  setPageHome: () => void;
  openViewProfile: (profileId: string) => void;
};

type MatchRow = {
  id?: string;
  user_one_id: string;
  user_two_id: string;
  status: string | null;
  created_at?: string | null;
};

type ProfileRow = {
  profile_id: string;
  display_name: string | null;
  birthdate: string | null;
  pronouns: string | null;
  display_city: string | null;
  is_verified: boolean | null;
};

type ProfileMediaRow = {
  id: string;
  profile_id: string | null;
  user_id: string | null;
  bucket: string;
  storage_path: string;
  media_type: string | null;
  display_order: number | null;
  is_primary: boolean | null;
  caption: string | null;
};

type ProfileMediaItem = ProfileMediaRow & {
  url: string;
};

type InteractionRow = {
  actor_user_id: string;
  target_user_id: string;
  interaction_type: string;
};

type DisplayMatch = {
  match: MatchRow;
  otherUserId: string;
  profile: ProfileRow | null;
  photoUrl: string | null;
  hasSuperLike: boolean;
};

function calculateAge(birthdate: string | null): number | null {
  if (!birthdate) return null;

  const birth = new Date(birthdate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!hasBirthdayPassed) age--;

  return age;
}

function showValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Not added yet";
  }

  return String(value);
}

function getMatchTime(match: MatchRow): number {
  if (!match.created_at) return 0;

  return new Date(match.created_at).getTime();
}

async function addSignedUrlToMedia(
  row: ProfileMediaRow
): Promise<ProfileMediaItem | null> {
  if (!row.bucket || !row.storage_path) return null;

  const { data, error } = await supabase.storage
    .from(row.bucket)
    .createSignedUrl(row.storage_path, MEDIA_URL_EXPIRES_IN_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("Could not create signed media URL:", {
      error,
      bucket: row.bucket,
      storage_path: row.storage_path
    });

    return null;
  }

  return {
    ...row,
    url: data.signedUrl
  };
}

const Matches: React.FC<MatchesProps> = ({
  setPageHome,
  openViewProfile
}) => {
  const { session, loading: sessionLoading } = useSession();

  const [matches, setMatches] = React.useState<DisplayMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadMatches = async () => {
      if (sessionLoading) return;

      if (!session?.user?.id) {
        setMatches([]);
        setMatchesLoading(false);
        return;
      }

      setMatchesLoading(true);
      setErrorMessage(null);

      const currentUserId = session.user.id;

      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .or(`user_one_id.eq.${currentUserId},user_two_id.eq.${currentUserId}`);

      if (matchesError) {
        console.error("Could not load matches:", matchesError);
        setErrorMessage(matchesError.message);
        setMatches([]);
        setMatchesLoading(false);
        return;
      }

      const activeMatches = ((matchesData ?? []) as MatchRow[]).filter(
        (match) =>
          match.status === "matched" ||
          match.status === "active" ||
          !match.status
      );

      const otherUserIds = activeMatches
        .map((match) =>
          match.user_one_id === currentUserId
            ? match.user_two_id
            : match.user_one_id
        )
        .filter((id): id is string => Boolean(id));

      if (otherUserIds.length === 0) {
        setMatches([]);
        setMatchesLoading(false);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(
          "profile_id, display_name, birthdate, pronouns, display_city, is_verified"
        )
        .in("profile_id", otherUserIds);

      if (profilesError) {
        console.error("Could not load match profiles:", profilesError);
        setErrorMessage(profilesError.message);
        setMatches([]);
        setMatchesLoading(false);
        return;
      }

      const profileById = new Map<string, ProfileRow>();

      ((profilesData ?? []) as ProfileRow[]).forEach((profile) => {
        profileById.set(profile.profile_id, profile);
      });

      const { data: mediaData, error: mediaError } = await supabase
        .from("profile_media")
        .select("*")
        .in("user_id", otherUserIds)
        .order("display_order", { ascending: true });

      if (mediaError) {
        console.error("Could not load match photos:", mediaError);
      }

      const mediaRowsByUserId = new Map<string, ProfileMediaRow[]>();

      ((mediaData ?? []) as ProfileMediaRow[]).forEach((row) => {
        if (!row.user_id) return;

        const existingRows = mediaRowsByUserId.get(row.user_id) ?? [];
        existingRows.push(row);
        mediaRowsByUserId.set(row.user_id, existingRows);
      });

      const selectedMediaRows = otherUserIds
        .map((userId) => {
          const rows = mediaRowsByUserId.get(userId) ?? [];

          return rows.find((row) => row.is_primary) ?? rows[0] ?? null;
        })
        .filter((row): row is ProfileMediaRow => row !== null);

      const signedMedia = await Promise.all(
        selectedMediaRows.map((row) => addSignedUrlToMedia(row))
      );

      const photoByUserId = new Map<string, string>();

      signedMedia.forEach((item) => {
        if (item?.user_id && item.url) {
          photoByUserId.set(item.user_id, item.url);
        }
      });

      const { data: givenInteractions, error: givenInteractionsError } =
        await supabase
          .from("user_interactions")
          .select("actor_user_id, target_user_id, interaction_type")
          .eq("actor_user_id", currentUserId)
          .in("target_user_id", otherUserIds)
          .in("interaction_type", ["like", "super_like"]);

      if (givenInteractionsError) {
        console.error(
          "Could not load given match interactions:",
          givenInteractionsError
        );
      }

      const { data: receivedInteractions, error: receivedInteractionsError } =
        await supabase
          .from("user_interactions")
          .select("actor_user_id, target_user_id, interaction_type")
          .eq("target_user_id", currentUserId)
          .in("actor_user_id", otherUserIds)
          .in("interaction_type", ["like", "super_like"]);

      if (receivedInteractionsError) {
        console.error(
          "Could not load received match interactions:",
          receivedInteractionsError
        );
      }

      const allInteractions = [
        ...((givenInteractions ?? []) as InteractionRow[]),
        ...((receivedInteractions ?? []) as InteractionRow[])
      ];

      const displayMatches = activeMatches.map((match) => {
        const otherUserId =
          match.user_one_id === currentUserId
            ? match.user_two_id
            : match.user_one_id;

        const pairInteractions = allInteractions.filter((interaction) => {
          const involvesCurrentUser =
            interaction.actor_user_id === currentUserId ||
            interaction.target_user_id === currentUserId;

          const involvesOtherUser =
            interaction.actor_user_id === otherUserId ||
            interaction.target_user_id === otherUserId;

          return involvesCurrentUser && involvesOtherUser;
        });

        const hasSuperLike = pairInteractions.some(
          (interaction) => interaction.interaction_type === "super_like"
        );

        return {
          match,
          otherUserId,
          profile: profileById.get(otherUserId) ?? null,
          photoUrl: photoByUserId.get(otherUserId) ?? null,
          hasSuperLike
        };
      });

      displayMatches.sort((a, b) => {
        if (a.hasSuperLike !== b.hasSuperLike) {
          return a.hasSuperLike ? -1 : 1;
        }

        return getMatchTime(b.match) - getMatchTime(a.match);
      });

      setMatches(displayMatches);
      setMatchesLoading(false);
    };

    loadMatches();
  }, [session, sessionLoading]);

  if (sessionLoading || matchesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <p className="text-[#382543]">Loading matches...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-100 px-6 text-center">
        <p className="text-lg font-semibold text-[#382543]">
          Could not load matches.
        </p>

        <p className="text-sm text-red-600">{errorMessage}</p>

        <button
          type="button"
          onClick={setPageHome}
          className="border border-[#382543] bg-white px-4 py-2 text-xs font-semibold text-[#382543]"
        >
          Back Home
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen overflow-y-auto bg-neutral-100 pb-10"
      style={{
        color: BRAND,
        fontFamily: "Nunito, system-ui, sans-serif"
      }}
    >
      <header className="sticky top-0 z-40" style={{ backgroundColor: BRAND }}>
        <div className="mx-auto flex max-w-[320px] items-center justify-between px-3 py-2">
          <button
            type="button"
            onClick={setPageHome}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Go back home"
          >
            <img src={GoBackButton} alt="" className="h-5 w-5" />
          </button>

          <img src={LogoPinkHome} alt="Lock It" className="h-9" />
        </div>
      </header>

      <main className="mx-auto max-w-[320px] px-3 py-5">
        <section className="border border-neutral-500 bg-white p-2">
          <section className="mb-3 border border-neutral-300 bg-white p-3">
            <h1 className="text-base font-bold text-[#382543]">
              Your Matches
            </h1>

            <p className="mt-1 text-[11px] text-neutral-500">
              Super likes appear first, then your other mutual matches.
            </p>
          </section>

          {matches.length === 0 ? (
            <section className="border border-neutral-300 bg-white p-4 text-center">
              <p className="text-sm font-semibold text-[#382543]">
                No matches yet.
              </p>

              <p className="mt-2 text-xs text-neutral-600">
                Mutual likes will show up here once both users like each other.
              </p>

              <button
                type="button"
                onClick={setPageHome}
                className="mt-4 border border-[#382543] bg-white px-4 py-2 text-xs font-semibold text-[#382543] hover:bg-[#382543] hover:text-white"
              >
                Find Matches
              </button>
            </section>
          ) : (
            <section className="space-y-3">
              {matches.map((match) => {
                const profile = match.profile;
                const age = calculateAge(profile?.birthdate ?? null);
                const displayName = showValue(profile?.display_name);
                const displayCity = showValue(profile?.display_city);
                const ageText = age ? String(age) : "Age not added";

                return (
                  <button
                    key={`${match.match.user_one_id}-${match.match.user_two_id}`}
                    type="button"
                    onClick={() => openViewProfile(match.otherUserId)}
                    className="flex w-full gap-3 border border-neutral-300 bg-white p-3 text-left hover:bg-neutral-50"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100">
                      {match.photoUrl ? (
                        <img
                          src={match.photoUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-neutral-500">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="truncate text-sm font-bold text-[#382543]">
                            {displayName}
                            {profile?.pronouns && (
                              <span className="ml-1 text-[11px] font-normal">
                                ({profile.pronouns})
                              </span>
                            )}
                          </p>

                          <p className="mt-1 text-xs text-[#382543]">
                            {ageText} | {displayCity}
                          </p>
                        </div>

                        {profile?.is_verified && (
                          <span className="shrink-0 rounded-full bg-[#F3BBC8] px-2 py-1 text-[9px] font-semibold text-[#382543]">
                            Verified
                          </span>
                        )}
                      </div>

                      {match.hasSuperLike && (
                        <span className="mt-2 inline-flex border border-[#382543] bg-[#fff7fa] px-2 py-1 text-[10px] font-semibold text-[#382543]">
                          Super Like
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </section>
          )}
        </section>
      </main>
    </div>
  );
};

export default Matches;