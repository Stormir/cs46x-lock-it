import React from "react";
import { signOut } from "../api/auth";
import { supabase } from "../client";
import { useSession } from "../api/useSession";

// Icon Imports
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import TipsIcon from "../assets/logo/tips_light_purple.svg";
import GoBackIcon from "../assets/logo/go_back_button.svg";
import SkipIcon from "../assets/logo/skip_button.svg";
import LikeIcon from "../assets/logo/like_buttn.svg";
import SuperLikeIcon from "../assets/logo/super_like_button.svg";
import InterestedInIcon from "../assets/icons/interested_in.svg";
import OccupationIcon from "../assets/icons/Occupation.svg";
import HeightIcon from "../assets/icons/Height.svg";
import EducationIcon from "../assets/icons/education.svg";
import NationalityIcon from "../assets/icons/nationality.svg";
import DrinksIcon from "../assets/icons/drinks.svg";


// ---------------
// CONSTANTS
// ---------------

// Brand coloring
const BRAND = "#382543";
// URL Expiration 
const MEDIA_URL_EXPIRES_IN_SECONDS = 60 * 60;


// Mock home page
// Will populate with real data
interface HomeProps {
  setPageLanding: () => void;
  setPageSettings: () => void;
  setPageProfile: () => void;
  setPageMatches: () => void;
  setPageVerifyTest: () => void;
  openViewProfile: (profileId: string) => void;
}

// Creates Type profile for canidate matches
type MatchProfile = {
  profile_id: string;
  display_name: string | null;
  birthdate: string | null;
  bio: string | null;
  pronouns: string | null;
  is_verified: boolean | null;
  display_city: string | null;
  sexual_interest: string | null;
  zodiac: string | null;
  job_title: string | null;
  education: string | null;
  nationality: string | null;
  race_ethnicity: string | null;
  about_me: string | null;
  drinking_status: string | null;
  smoking_status: string | null;
  height_inches: number | null;
  exercise_status: string | null;
  has_kids: boolean | null;
  pets_preference: string | null;
  prompt_1_question: string | null;
  prompt_1_answer: string | null;
  prompt_2_question: string | null;
  prompt_2_answer: string | null;
  favorite_movie: string | null;
  favorite_show: string | null;
  favorite_artist: string | null;
  favorite_song: string | null;
  channel_type: string | null;
  dating_communication_style: string | null;
  dating_family_plans: string | null;
  dating_love_language: string | null;
  dating_comm_method: string | null;
};

// Shape of Canidate Media Row
type CandidateMediaRow = {
  id: string;
  profile_id: string | null;
  user_id: string | null;
  bucket: string;
  storage_path: string;
  media_type: string | null;
  display_order: number | null;
  is_primary: boolean | null;
  caption: string | null;
  created_at?: string;
  updated_at?: string;
};

// URL for candidate media row for display 
type CandidateMediaItem = CandidateMediaRow & {
  url: string;
};


// Sets up shape for interaction 
type InteractionType = "skip" | "like" | "super_like";

// -------------
// HELPERS
// -------------

// Taks birthday from supabase and turn it into person's age
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

// Turns database inches into a readable height 
function formatHeight(heightInches: number | null): string {
  if (!heightInches) return "Not added yet";

  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;

  return `${feet}ft ${inches}in`;
}

// Formats values for null or blank values
function showValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Not added yet";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

// Creates URL for profile media to display canidate photos
async function addSignedUrlToMedia(
  row: CandidateMediaRow
): Promise<CandidateMediaItem | null> {
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

// Home Component 


const Home: React.FC<HomeProps> = ({
  setPageLanding,
  setPageSettings,
  setPageProfile,
  setPageMatches,
  setPageVerifyTest,
  openViewProfile
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  // Gives home.tsx access to session?.user?.id
  const { session, loading: sessionLoading } = useSession();
  const [ownPrimaryPhotoUrl, setOwnPrimaryPhotoUrl] = React.useState<string | null>(null);

  // sets canidates as the array of other profiles
  const [candidates, setCandidates] = React.useState<MatchProfile[]>([]);
  // shows the index of the profile currently being shown
  const [currentIndex, setCurrentIndex] = React.useState(0);
  // Array to hold current candidates profile pictures 
  const [candidateMedia, setCandidateMedia] = React.useState<CandidateMediaItem[]>([]);

  // shows loading while profiles and photos load
  const [matchesLoading, setMatchesLoading] = React.useState(true);
  const [mediaLoading, setMediaLoading] = React.useState(false);
  // disables buttons while interactions are saved
  const [actionSaving, setActionSaving] = React.useState(false);
  // Stores DB errors 
  const [matchError, setMatchError] = React.useState<string | null>(null);
  // Sets currentCanidate to user index
  const currentCandidate = candidates[currentIndex] ?? null;



  // Loads canidate profiles from supabase
  const loadCandidates = React.useCallback(async () => {
  if (sessionLoading) return;

  if (!session?.user?.id) {
    setCandidates([]);
    setMatchesLoading(false);
    return;
  }

  setMatchesLoading(true);
  setMatchError(null);

  const currentUserId = session.user.id;

  const { data: interactions, error: interactionsError } = await supabase
    .from("user_interactions")
    .select("target_user_id")
    .eq("actor_user_id", currentUserId);

  if (interactionsError) {
    console.error("Could not load interactions:", interactionsError);
    setMatchError(interactionsError.message);
  }

  const excludedIds = new Set<string>([
    currentUserId,
    ...((interactions ?? [])
      .map((row) => row.target_user_id)
      .filter((id): id is string => Boolean(id)))
  ]);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Could not load candidate profiles:", error);
    setMatchError(error.message);
    setCandidates([]);
    setMatchesLoading(false);
    return;
  }

  const filtered = (data ?? []).filter((profile) => {
    const isNotCurrentUser = !excludedIds.has(profile.profile_id);
    const hasDisplayName = Boolean(profile.display_name?.trim());

    return isNotCurrentUser && hasDisplayName;
  });

  setCandidates(filtered as MatchProfile[]);
  setCurrentIndex(0);
  setMatchesLoading(false);
}, [session, sessionLoading]);

React.useEffect(() => {
  loadCandidates();
}, [loadCandidates]);

  // Loads next candidate as usder scrolls 
React.useEffect(() => {
  const loadCandidateMedia = async () => {
    if (!currentCandidate?.profile_id) {
      setCandidateMedia([]);
      return;
    }

    setMediaLoading(true);

    const { data, error } = await supabase
      .from("profile_media")
      .select("*")
      .eq("user_id", currentCandidate.profile_id)
      .order("display_order", { ascending: true })
      .limit(9);

    if (error) {
      console.error("Could not load candidate media:", error);
      setCandidateMedia([]);
      setMediaLoading(false);
      return;
    }

    const mediaWithUrls = await Promise.all(
      (data ?? []).map((row) => addSignedUrlToMedia(row as CandidateMediaRow))
    );

    const usableMedia = mediaWithUrls.filter(
      (item): item is CandidateMediaItem => item !== null
    );

    setCandidateMedia(usableMedia);
    setMediaLoading(false);
  };

  loadCandidateMedia();
}, [currentCandidate]);

// Moved action to top bar.tsx  
/* const handleClickSignOut = async () => {
  await signOut();
  setPageLanding();
};
*/

// Loads active users primary photo
React.useEffect(() => {
  const loadOwnPrimaryPhoto = async () => {
    if (sessionLoading) return;

    if (!session?.user?.id) {
      setOwnPrimaryPhotoUrl(null);
      return;
    }

    const { data, error } = await supabase
      .from("profile_media")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_primary", true)
      .maybeSingle();

    if (error) {
      console.error("Could not load own primary photo:", error);
      setOwnPrimaryPhotoUrl(null);
      return;
    }

    if (!data) {
      setOwnPrimaryPhotoUrl(null);
      return;
    }

    const mediaItem = await addSignedUrlToMedia(data as CandidateMediaRow);

    setOwnPrimaryPhotoUrl(mediaItem?.url ?? null);
  };

  loadOwnPrimaryPhoto();
}, [session, sessionLoading]);

  // Actions Handler
  const handleMatchAction = async (interactionType: InteractionType) => {
  if (!session?.user?.id || !currentCandidate) return;

  setActionSaving(true);
  setMatchError(null);

  const actorUserId = session.user.id;
  const targetUserId = currentCandidate.profile_id;

  const { error: interactionError } = await supabase
  .from("user_interactions")
  .upsert(
    {
      actor_user_id: actorUserId,
      target_user_id: targetUserId,
      interaction_type: interactionType
    },
    {
      onConflict: "actor_user_id,target_user_id"
    }
  );

  if (interactionError) {
    console.error("Could not save interaction:", interactionError);
    setMatchError(interactionError.message);
    setActionSaving(false);
    return;
  }

  if (interactionType === "like" || interactionType === "super_like") {
    const { data: reverseInteraction, error: reverseError } = await supabase
      .from("user_interactions")
      .select("id, interaction_type")
      .eq("actor_user_id", targetUserId)
      .eq("target_user_id", actorUserId)
      .in("interaction_type", ["like", "super_like"])
      .maybeSingle();

    if (reverseError) {
      console.error("Could not check reverse interaction:", reverseError);
    }

    if (reverseInteraction) {
      const [userOneId, userTwoId] = [actorUserId, targetUserId].sort();

      const { error: matchInsertError } = await supabase
        .from("matches")
        .upsert(
          {
            user_one_id: userOneId,
            user_two_id: userTwoId,
            status: "matched"
          },
          {
            onConflict: "user_one_id,user_two_id"
          }
        );

      if (matchInsertError) {
        console.error("Could not create match:", matchInsertError);
      } else {
        alert("It's a match!");
      }
    }
  }

  setCurrentIndex((prev) => prev + 1);
  setActionSaving(false);
};

  // Sets loading state for loading profiles
  if (sessionLoading || matchesLoading) {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
      <p className="text-[#382543]">Loading matches...</p>
    </div>
  );
}
  // Error message if unable to load matches
  if (matchError) {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-lg font-semibold text-[#382543]">
        Could not load matches.
      </p>

      <p className="text-sm text-red-600">{matchError}</p>
    </div>
  );
}

  // Sets no canidate state when the user runs out of matches 
  if (!currentCandidate) {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <header className="sticky top-0 z-40" style={{ backgroundColor: BRAND }}>
        <div className="mx-auto flex max-w-sm items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Open menu"
          >
            <div className="space-y-1">
              <div className="h-0.5 w-6 bg-white" />
              <div className="h-0.5 w-6 bg-white" />
              <div className="h-0.5 w-6 bg-white" />
            </div>
          </button>

          <button
            type="button"
            onClick={setPageProfile}
            className="h-12 w-12 overflow-hidden rounded-full bg-white/20 ring-2 ring-white/30 hover:ring-white/60"
            aria-label="Open profile"
            title="Open profile"
          >
            {ownPrimaryPhotoUrl ? (
              <img
                src={ownPrimaryPhotoUrl}
                alt="Open your profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-white/10" />
            )}
          </button>

          <div className="flex-1 text-right">
            <div className="text-2xl font-bold tracking-tight text-white">
              Lock It
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="mx-auto max-w-sm px-4 pb-3">
            <div className="rounded-2xl bg-white/10 p-2 ring-1 ring-white/15">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setPageVerifyTest();
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              >
                Verify Test
              </button>

              <button
                type="button"
                onClick={handleClickSignOut}
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto flex max-w-sm flex-1 flex-col items-center justify-center px-6 text-center">
        <section className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-[#382543]">
            No more profiles to show right now.
          </p>

          <p className="mt-2 text-sm text-neutral-600">
            You’ve reached the end of your current match list. You can still view your profile or check back later.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={setPageProfile}
              className="rounded-full bg-[#382543] px-5 py-2 text-sm font-medium text-white hover:bg-[#2b1c34]"
            >
              View My Profile
            </button>

            <button
              type="button"
              onClick={loadCandidates}
              className="rounded-full border border-[#382543] bg-white px-5 py-2 text-sm font-medium text-[#382543] hover:bg-neutral-100"
            >
              Refresh Matches
            </button>

             <button
              type="button"
              onClick={setPageMatches}
              className="rounded-full border border-[#382543] bg-white px-5 py-2 text-sm font-medium text-[#382543] hover:bg-neutral-100"
            >
              View Matches
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

  // Adds fall backs if no info has been added to profile 
  const age = calculateAge(currentCandidate?.birthdate ?? null);
  const ageText = age ? String(age) : "Age not added";
  const displayName = showValue(currentCandidate?.display_name);
  const displayCity = showValue(currentCandidate?.display_city);

  const aboutText =
    currentCandidate?.about_me ||
    currentCandidate?.bio ||
    "No about me added yet.";

  const height = formatHeight(currentCandidate?.height_inches ?? null);

  async function handleClickSignOut() {
    await signOut();
    setPageLanding();
  }

  return (
    <div className="min-h-screen bg-neutral-100 pb-20 flex flex-col">
      {/* Top bar */}
      {/* Top bar */}
      <TopBar
        onHomeClick={() => {}}
        onSettingsClick={setPageSettings}
        onSignOutClick={handleClickSignOut}
      />

      {/* Main page */}
      <main className="mx-auto max-w-[320px] px-3 py-4 pb-28">
        <section className="border border-neutral-500 bg-white p-2">
         {/* Candidate Identity */}
          <section className="mb-3 border border-neutral-300 bg-white p-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (currentCandidate?.profile_id) {
                      openViewProfile(currentCandidate.profile_id);
                    }
                  }}
                  className="text-left text-base font-bold leading-tight text-[#382543] hover:underline"
                >
                  {displayName}
                  {currentCandidate?.pronouns && (
                    <span className="ml-1 text-xs font-normal">
                      ({currentCandidate.pronouns})
                    </span>
                  )}
                </button>

                <p className="mt-1 text-xs text-[#382543]">
                  {ageText} | {displayCity}
                </p>
              </div>

              <button
                type="button"
                className="rounded-full p-1 hover:bg-neutral-100"
                aria-label="Tips"
                title="Tips"
              >
                <img
                  src={TipsIcon}
                  className="h-6 w-6 object-contain"
                  alt="Tips"
                />
              </button>
            </div>
          </section>

          {/* Photo area */}
          <section className="mb-3 border border-neutral-300 bg-white p-2">
            {mediaLoading ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-square bg-neutral-200" />
                <div className="aspect-square bg-neutral-200" />
              </div>
            ) : candidateMedia.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {candidateMedia.slice(0, 2).map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className="aspect-square overflow-hidden border border-neutral-200 bg-neutral-100"
                  >
                    {item.media_type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.caption || `Profile photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-neutral-500">
                        Media type not supported yet
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="flex aspect-square w-36 items-center justify-center border border-dashed border-neutral-300 bg-neutral-100 px-2 text-center text-[11px] text-neutral-500">
                  No photos added yet
                </div>
              </div>
            )}
          </section>

          {/* Details */}
          <section className="mb-3 border border-neutral-300 bg-white">
            <div className="border-b border-neutral-200 px-2 py-1 text-[11px] text-neutral-400">
              Details
            </div>
            {/* Filler icons for now, will update with official icons */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 p-3 text-[11px]">
              <DetailItem
                  icon={InterestedInIcon}
                  text={showValue(currentCandidate?.sexual_interest)}
                />

              <DetailItem
                icon={OccupationIcon}
                text={showValue(currentCandidate?.job_title)}
              />

              <DetailItem
                icon={HeightIcon}
                text={height}
              />

              <DetailItem
                icon={EducationIcon}
                text={showValue(currentCandidate?.education)}
              />

              <DetailItem
                icon={NationalityIcon}
                text={showValue(currentCandidate?.race_ethnicity)}
              />

              <DetailItem
                icon={DrinksIcon}
                text={showValue(currentCandidate?.drinking_status)}
              />
            </div>
          </section>

          {/* About me */}
          <section className="mb-3 border border-neutral-300 bg-white">
            <div className="border-b border-neutral-200 px-2 py-1 text-[11px] text-neutral-400">
              About me
            </div>

            <div className="min-h-20 p-3 text-xs leading-relaxed text-[#382543]">
              {aboutText}
            </div>
          </section>

          {/* Action buttons*/}
          <section className="mt-4 flex items-center justify-between gap-2 pb-1">
            <CircleButton
              label="Go Back"
              title="Go Back"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={actionSaving || currentIndex === 0}
            >
              <img
                src={GoBackIcon}
                className="h-13 w-13 object-contain drop-shadow-md"
                alt=""
              />
            </CircleButton>

            <CircleButton
              label="Skip"
              title="Skip"
              onClick={() => handleMatchAction("skip")}
              disabled={actionSaving}
            >
              <img
                src={SkipIcon}
                className="h-13 w-13 object-contain drop-shadow-md"
                alt=""
              />
            </CircleButton>

            <CircleButton
              label="Like"
              title="Like"
              onClick={() => handleMatchAction("like")}
              disabled={actionSaving}
            >
              <img
                src={LikeIcon}
                className="h-13 w-13 object-contain drop-shadow-md"
                alt=""
              />
            </CircleButton>

            <CircleButton
              label="Super Like"
              title="Super Like"
              onClick={() => handleMatchAction("super_like")}
              disabled={actionSaving}
            >
              <img
                src={SuperLikeIcon}
                className="h-14 w-14 object-contain drop-shadow-md"
                alt=""
              />
            </CircleButton>
          </section>
        </section>
      </main>

      {/* Bottom nav */}
      <BottomNav
        onHomeClick={() => {}} 
        onProfileClick={setPageProfile}
      />
    </div>
  );
};

function DetailItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-neutral-800">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
        <img
          src={icon}
          alt=""
          aria-hidden="true"
          className="h-4 w-4 object-contain"
        />
      </span>

      <span className="leading-tight">{text}</span>
    </div>
  );
}

function CircleButton({
  children,
  label,
  title,
  onClick,
  disabled = false
}: {
  children: React.ReactNode;
  label: string;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-16 w-16 items-center justify-center rounded-full bg-transparent transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export default Home;

