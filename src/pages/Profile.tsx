import React from "react";
import { supabase } from "../client";
import { useSession } from "../api/useSession";

import LogoPinkHome from "../assets/logo/logo_pink_home.svg";
import GoBackButton from "../assets/icons/go_back_button.svg";

// SVG Profile Icons
import InterestedInIcon from "../assets/icons/interested_in.svg";
import OccupationIcon from "../assets/icons/Occupation.svg";
import ZodiacIcon from "../assets/icons/zodiac.svg";
import EducationIcon from "../assets/icons/education.svg";
import NationalityIcon from "../assets/icons/nationality.svg";
import HometownIcon from "../assets/icons/hometown.svg";

import DrinksIcon from "../assets/icons/drinks.svg";
import SmokingIcon from "../assets/icons/smoking.svg";
import ExerciseIcon from "../assets/icons/exercise.svg";
import ChildrenIcon from "../assets/icons/children.svg";
import HeightIcon from "../assets/icons/Height.svg";
import DogsOkayIcon from "../assets/icons/Dogs_Okay.svg";

import CommunicationIcon from "../assets/icons/Communication.svg";
import FamilyIcon from "../assets/icons/Family.svg";

//CONSTANTS

// Business colors 
const BRAND = "#382543";
const BODY_TEXT = "#382543";

// Media Expiration 
const MEDIA_URL_EXPIRES_IN_SECONDS = 60 * 60;

// Max allowed images/video uploads
const MAX_PROFILE_MEDIA = 9;


// Create shape for current profile table
type ProfileRow = {
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

// Media Types
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
  created_at?: string;
  updated_at?: string;
};

// Media URL Type
type ProfileMediaItem = ProfileMediaRow & {
  url: string;
};

// Profile Props Type
type ProfileProps = {
  setPageHome: () => void;
  setPageEditProfile: () => void;
};

// Helper Functions

// Calculates Age from users birthday
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

// Calculates height from inches
function formatHeight(heightInches: number | null): string {
  if (!heightInches) return "Not added yet";

  const feet = Math.floor(heightInches / 12);
  const inches = heightInches % 12;

  return `${feet}ft ${inches}in`;
}

// Shows if value has been added yet or not
function showValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Not added yet";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

// Turns a profile_media database row into a frontend-ready media item with a usable URL
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

// Main Profile Page Component
const Profile: React.FC<ProfileProps> = ({ 
    setPageHome,
    setPageEditProfile
  }) => {
  // Gets the current logged-in user's session
  const { session, loading: sessionLoading } = useSession();

  // Stores the user's profile row from Supabase
  const [profile, setProfile] = React.useState<ProfileRow | null>(null);

  // Tracks whether the profile query is still loading
  const [profileLoading, setProfileLoading] = React.useState(true);

  // Stores the user's profile media rows after converting them to usable image/video URLs
  const [media, setMedia] = React.useState<ProfileMediaItem[]>([]);

  // Tracks whether the profile media query is still loading
  const [mediaLoading, setMediaLoading] = React.useState(true);

  // enables scrolling withing HTML
  const mediaScrollRef = React.useRef<HTMLDivElement | null>(null);

  // Stores an error message if Supabase cannot load the profile
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Loads the logged-in user's profile from Supabase
  React.useEffect(() => {
    const loadProfile = async () => {
      // Wait until the session finishes loading before querying profiles
      if (sessionLoading) return;

      // If there is no logged-in user, stop and show an error
      if (!session?.user?.id) {
        setErrorMessage("No logged-in user found.");
        setProfileLoading(false);
        return;
      }

      // Start loading and clear old errors
      setProfileLoading(true);
      setErrorMessage(null);

      // Pull the current user's profile row from Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_id", session.user.id)
        .maybeSingle();

      // If Supabase gives an error, save the error message
      if (error) {
        console.error("Profile load error:", error);
        setErrorMessage(error.message);
        setProfile(null);
      } else {
        // If successful, store the profile row in state
        setProfile(data as ProfileRow);
      }

      // Stop loading once the query is done
      setProfileLoading(false);
    };

    loadProfile();
  }, [session, sessionLoading]);

  // Loads the logged-in user's profile media from Supabase
  React.useEffect(() => {
    const loadMedia = async () => {
      // Wait until the session finishes loading before querying media
      if (sessionLoading) return;

      // If there is no logged-in user, stop loading media
      if (!session?.user?.id) {
        setMedia([]);
        setMediaLoading(false);
        return;
      }

      // Start loading media
      setMediaLoading(true);

      // Pull this user's media rows from profile_media
      const { data, error } = await supabase
        .from("profile_media")
        .select("*")
        .eq("user_id", session.user.id)
        .order("display_order", { ascending: true })
        // limits number of images 
        .limit(MAX_PROFILE_MEDIA);

      if (error) {
        console.error("Profile media load error:", error);
        setMedia([]);
        setMediaLoading(false);
        return;
      }

      // If there's no media rows yet, keep media empty
      if (!data || data.length === 0) {
        setMedia([]);
        setMediaLoading(false);
        return;
      }

      // Convert each DB row into a frontend-ready item with a signed URL
      const mediaWithUrls = await Promise.all(
        data.map((row) => addSignedUrlToMedia(row as ProfileMediaRow))
      );

      // Remove any rows that failed to get a signed URL
      const usableMedia = mediaWithUrls.filter(
        (item): item is ProfileMediaItem => item !== null
      );

      // Save the final media list in React state
      setMedia(usableMedia);

      // Stop loading media
      setMediaLoading(false);
    };

    loadMedia();
  }, [session, sessionLoading]);

  // Shows loading message while Supabase session or profile data is loading
  if (sessionLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-[#382543]">Loading profile...</p>
      </div>
    );
  }

  // Shows error message if Supabase cannot load profile data
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-[#382543]">
          Could not load profile.
        </p>

        <p className="text-sm text-neutral-700">{errorMessage}</p>

        <button
          type="button"
          onClick={setPageHome}
          className="rounded-full bg-[#382543] px-5 py-2 text-sm font-medium text-white"
        >
          Back home
        </button>
      </div>
    );
  }

  // Shows fallback message if no profile row exists for the user
  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-[#382543]">
          No profile found.
        </p>

        <button
          type="button"
          onClick={setPageHome}
          className="rounded-full bg-[#382543] px-5 py-2 text-sm font-medium text-white"
        >
          Back home
        </button>
      </div>
    );
  }

  // Step 8: Create values we want to display on the page

  // Calculates age from the user's birthdate
  const age = calculateAge(profile.birthdate);

  // Uses about_me first, then bio, then fallback text
  const aboutText = profile.about_me || profile.bio || "No about me added yet.";

  // Clean display values with fallbacks
  const displayName = showValue(profile.display_name);
  const displayCity = showValue(profile.display_city);
  const height = formatHeight(profile.height_inches);

  // Shows age if birthdate exists, otherwise gives fallback text
  const ageText = age ? String(age) : "Age not added";
  // Only show up to 9 media items on the profile
  const displayedMedia = media.slice(0, MAX_PROFILE_MEDIA);

  // Allows scrollable media 
  const scrollMedia = (direction: "left" | "right") => {
  if (!mediaScrollRef.current) return;

  const scrollAmount = mediaScrollRef.current.clientWidth;

  mediaScrollRef.current.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth"
  });
};

  return (
  <div
    className="min-h-screen overflow-y-auto pb-10"
    style={{
      backgroundColor: "#f3f3f3",
      color: BODY_TEXT,
      fontFamily: "Nunito, system-ui, sans-serif"
    }}
  >
    {/* Header */}
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

    {/* Main profile scroll */}
    <main className="mx-auto max-w-[320px] px-3 py-5">

      <section className="border border-neutral-500 bg-white p-2">

        {/* Profile Identity */}
        <section className="mb-3 border border-neutral-300 bg-white p-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-base font-bold leading-tight text-[#382543]">
                {displayName}
                {profile.pronouns && (
                  <span className="ml-1 text-xs font-normal">
                    ({profile.pronouns})
                  </span>
                )}
              </h1>

              <p className="mt-1 text-xs">
                {ageText} | {displayCity}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              {profile.is_verified ? (
                <span className="rounded-full bg-[#F3BBC8] px-2 py-1 text-[10px] font-semibold text-[#382543]">
                  Verified
                </span>
              ) : (
                <span className="rounded-full bg-neutral-200 px-2 py-1 text-[10px] font-semibold text-neutral-600">
                  Not verified
                </span>
              )}

              <button
                type="button"
                onClick={setPageEditProfile}
                className="text-[11px] font-semibold text-[#382543] underline underline-offset-2"
              >
                Edit
              </button>
            </div>
          </div>
        </section>

        {/* Profile Media */}
        <section className="mb-3 border border-neutral-300 bg-white p-2">
          {mediaLoading ? (
            <div className="flex gap-3">
              <div className="aspect-square flex-1 bg-neutral-200" />
              <div className="aspect-square flex-1 bg-neutral-200" />
            </div>
          ) : displayedMedia.length > 0 ? (
            <div className="relative">
              {/* Left button */}
              {displayedMedia.length > 2 && (
                <button
                  type="button"
                  onClick={() => scrollMedia("left")}
                  className="absolute left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-sm font-bold text-[#382543] shadow"
                  aria-label="Scroll photos left"
                >
                  ‹
                </button>
              )}

              {/* Scrollable photo row */}
              <div
                ref={mediaScrollRef}
                className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
              >
                {displayedMedia.map((item, index) => (
                  <div
                    key={item.id}
                    className="aspect-square flex-[0_0_calc(50%-0.375rem)] snap-start overflow-hidden border border-neutral-200 bg-neutral-100"
                  >
                    {item.media_type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.caption || `Profile photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-2 text-center text-[11px] text-neutral-500">
                        Media type not supported yet
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right button */}
              {displayedMedia.length > 2 && (
                <button
                  type="button"
                  onClick={() => scrollMedia("right")}
                  className="absolute right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-sm font-bold text-[#382543] shadow"
                  aria-label="Scroll photos right"
                >
                  ›
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex aspect-square w-36 items-center justify-center border border-dashed border-neutral-300 bg-neutral-100 px-2 text-center text-[11px] text-neutral-500">
                No photo added yet
              </div>
            </div>
          )}
        </section>

        {/* Details / Demographics */}
        <ProfileBox title="Demographics">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <IconDetail
              icon={InterestedInIcon}
              label="Interested in"
              value={showValue(profile.sexual_interest)}
            />

            <IconDetail
              icon={OccupationIcon}
              label="Job"
              value={showValue(profile.job_title)}
            />

            <IconDetail
              icon={ZodiacIcon}
              label="Zodiac"
              value={showValue(profile.zodiac)}
            />

            <IconDetail
              icon={EducationIcon}
              label="Education"
              value={showValue(profile.education)}
            />

            <IconDetail
              icon={NationalityIcon}
              label="Nationality"
              value={showValue(profile.nationality)}
            />

            <IconDetail
              icon={NationalityIcon}
              label="Race/Ethnicity"
              value={showValue(profile.race_ethnicity)}
            />

            <IconDetail
              icon={HeightIcon}
              label="Height"
              value={height}
            />

            <IconDetail
              icon={HometownIcon}
              label="City"
              value={displayCity}
            />
          </div>
        </ProfileBox>

        {/* About Me */}
        <ProfileBox title="About me">
          <p className="min-h-20 text-xs leading-relaxed text-[#382543]">
            {aboutText}
          </p>
        </ProfileBox>

        {/* Lifestyle */}
        <ProfileBox title="Lifestyle">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <IconDetail
              icon={DrinksIcon}
              label="Drinking"
              value={showValue(profile.drinking_status)}
            />

            <IconDetail
              icon={ExerciseIcon}
              label="Exercise"
              value={showValue(profile.exercise_status)}
            />

            <IconDetail
              icon={SmokingIcon}
              label="Smoking"
              value={showValue(profile.smoking_status)}
            />

            <IconDetail
              icon={ChildrenIcon}
              label="Kids"
              value={showValue(profile.has_kids)}
            />

            <IconDetail
              icon={DogsOkayIcon}
              label="Pets Ok?"
              value={showValue(profile.pets_preference)}
            />
          </div>
        </ProfileBox>

        {/* Prompt 1 */}
        <PromptPanel
          title={profile.prompt_1_question || "Example Prompt #1"}
          answer={profile.prompt_1_answer || "Words here"}
        />

        {/* Favorites */}
        <ProfileBox title="Favorites">
          <div className="grid grid-cols-2 gap-3">
            <MiniValueBox
              title="Movie"
              value={showValue(profile.favorite_movie)}
            />

            <MiniValueBox
              title="Show"
              value={showValue(profile.favorite_show)}
            />

            <MiniValueBox
              title="Artist"
              value={showValue(profile.favorite_artist)}
            />

            <MiniValueBox
              title="Song"
              value={showValue(profile.favorite_song)}
            />
          </div>
        </ProfileBox>

        {/* Dating Info */}
        <ProfileBox title="Dating Style">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">

            <IconDetail
              icon={CommunicationIcon}
              label="Communication Style"
              value={showValue(profile.dating_communication_style)}
            />

            <IconDetail
              icon={FamilyIcon}
              label="Family Plans"
              value={showValue(profile.dating_family_plans)}
            />

            <IconDetail
              icon={CommunicationIcon}
              label="Love Language"
              value={showValue(profile.dating_love_language)}
            />

            <IconDetail
              icon={CommunicationIcon}
              label="Preferred Communication Method"
              value={showValue(profile.dating_comm_method)}
            />
          </div>
        </ProfileBox>

        {/* Prompt 2 */}
        <PromptPanel
          title={profile.prompt_2_question || "Example Prompt #2"}
          answer={profile.prompt_2_answer || "Words here"}
        />
      </section>
    </main>
  </div>
);
};

function ProfileBox({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-3 border border-neutral-300 bg-white">
      <div className="border-b border-neutral-200 px-2 py-1 text-[11px] text-neutral-400">
        {title}
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
}

function IconDetail({
  icon,
  label,
  value
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <img
        src={icon}
        alt=""
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0 object-contain"
      />

      <div className="min-w-0 leading-tight">
        <p className="text-[11px] text-[#382543]">{label}</p>
        <p className="mt-0.5 break-words text-[11px] text-[#382543]">
          {value}
        </p>
      </div>
    </div>
  );
}

function PromptPanel({
  title,
  answer
}: {
  title: string;
  answer: string;
}) {
  return (
    <section className="mb-3 border border-neutral-300 bg-white">
      <div className="border-b border-neutral-200 px-2 py-1 text-[11px] text-neutral-400">
        {title}
      </div>

      <div className="min-h-20 p-3 text-xs leading-relaxed text-[#382543]">
        {answer}
      </div>
    </section>
  );
}

function MiniValueBox({
  title,
  value
}: {
  title: string;
  value: string;
}) {
  return (
    <section className="border border-neutral-300 bg-white text-center">
      <div className="border-b border-neutral-200 px-2 py-1 text-[11px] text-neutral-500">
        {title}
      </div>

      <div className="min-h-10 px-2 py-2 text-[11px] text-[#382543]">
        {value}
      </div>
    </section>
  );
}

export default Profile;