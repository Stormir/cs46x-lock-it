import React from "react";
import { supabase } from "../client";
import { useSession } from "../api/useSession";

import LogoPinkHome from "../assets/logo/logo_pink_home.svg";
import GoBackButton from "../assets/icons/go_back_button.svg";

// ----------------------
// Constants 
// ----------------------

//Lock it brand colors 
const BRAND = "#382543";
const BODY_TEXT = "#382543";

// Supabase Storage settings for profile uploads 
const PROFILE_MEDIA_BUCKET = "profile-media";
const MAX_PROFILE_MEDIA = 9;
const MEDIA_URL_EXPIRES_IN_SECONDS = 60 * 60;

// Prompt drop down options
const PROMPT_1_OPTIONS = [
  "The moment I knew I was ready for something real was...",
  "My ideal date feels like...",
  "I can make a great impression of...",
  "The little things that make me feel loved are...",
  "A completely unnecessary hill I will die on is...",
  "My toxic trait is...",
  "We’ll get along if you can beat me at...",
  "The most chaotic thing I’ve ever done was...",
  "Something I’m currently working on improving in my life is...",
  "What a healthy relationship looks like to me is..."
];

const PROMPT_2_OPTIONS = [
  "The moment I knew I was ready for something real was...",
  "My ideal date feels like...",
  "I can make a great impression of...",
  "The little things that make me feel loved are...",
  "A completely unnecessary hill I will die on is...",
  "My toxic trait is...",
  "We’ll get along if you can beat me at...",
  "The most chaotic thing I’ve ever done was...",
  "Something I’m currently working on improving in my life is...",
  "What a healthy relationship looks like to me is..."
];


// ----------------------
// Types
// ----------------------

//Props passed from app.tsx
type EditProfileProps = {
  setPageProfile: () => void;
};

// Row shape from profile_media table
// rows store where each uploaded image lives within DB
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

// Adds a temporary signed URL so the private storage image can be displayed in the browser
type ProfileMediaItem = ProfileMediaRow & {
  url: string;
};

// Form state for editable profile fields.
// All values are stored as strings because HTML inputs/selects return strings
type ProfileForm = {
  display_city: string;
  sexual_interest: string;
  job_title: string;
  zodiac: string;
  education: string;
  nationality: string;
  race_ethnicity: string;
  about_me: string;
  drinking_status: string;
  smoking_status: string;
  height_inches: string;
  exercise_status: string;
  has_kids: string;
  pets_preference: string;
  dating_communication_style: string;
  dating_family_plans: string;
  dating_love_language: string;
  dating_comm_method: string;
  favorite_movie: string;
  favorite_show: string;
  favorite_artist: string;
  favorite_song: string;
  prompt_1_question: string;
  prompt_1_answer: string;
  prompt_2_question: string;
  prompt_2_answer: string;
};

// ----------------------
// Helper functions
// ----------------------

// Keeps the primary photo synced with the first photo by display_order.
// Runs after upload/delee so the first visible photo is the primary photo
async function syncPrimaryPhotoToFirst(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("profile_media")
    .select("id")
    .eq("user_id", userId)
    .order("display_order", { ascending: true })
    .limit(MAX_PROFILE_MEDIA);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return;
  }

  const firstPhotoId = data[0].id;

  const { error: clearPrimaryError } = await supabase
    .from("profile_media")
    .update({ is_primary: false })
    .eq("user_id", userId);

  if (clearPrimaryError) {
    throw new Error(clearPrimaryError.message);
  }

  const { error: setPrimaryError } = await supabase
    .from("profile_media")
    .update({ is_primary: true })
    .eq("id", firstPhotoId)
    .eq("user_id", userId);

  if (setPrimaryError) {
    throw new Error(setPrimaryError.message);
  }
}


// Finds the first available display_order slot from 1 through MAX_PROFILE_MEDIA.
// Avoids duplicate display_order values after a user deletes a photo.
function getNextDisplayOrder(media: ProfileMediaItem[]): number {
  const usedOrders = new Set(
    media
      .map((item) => item.display_order)
      .filter((order): order is number => typeof order === "number")
  );

  for (let order = 1; order <= MAX_PROFILE_MEDIA; order++) {
    if (!usedOrders.has(order)) {
      return order;
    }
  }

  return MAX_PROFILE_MEDIA + 1;
}

// Turns a profile media upload row into a URL
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

// ----------------------
// Main component
// ----------------------


const EditProfile: React.FC<EditProfileProps> = ({ setPageProfile }) => {
  // Current logged-in user session
  const { session, loading: sessionLoading } = useSession();

  // Local photo selection and preview state
  // previewUrl is only used before the image is uploaded.
  const [selectedPhoto, setSelectedPhoto] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Editable profile detail form
  // Values are loaded from the profiles table 
  const [profileForm, setProfileForm] = React.useState<ProfileForm>({
    display_city: "",
    sexual_interest: "",
    job_title: "",
    zodiac: "",
    education: "",
    nationality: "",
    race_ethnicity: "",
    about_me: "",
    drinking_status: "",
    smoking_status: "",
    height_inches: "",
    exercise_status: "",
    has_kids: "",
    pets_preference: "",
    dating_communication_style: "",
    dating_family_plans: "",
    dating_love_language: "",
    dating_comm_method: "",
    favorite_movie: "",
    favorite_show: "",
    favorite_artist: "",
    favorite_song: "",
    prompt_1_question: "",
    prompt_1_answer: "",
    prompt_2_question: "",
    prompt_2_answer: ""
  });

  // Tracks profile form loading/saving so buttons can be disabled during async work
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileLoading, setProfileLoading] = React.useState(true);

  // Uploaded profile photo state
  // media stores uploaded photos after signed URLs are created
  const [media, setMedia] = React.useState<ProfileMediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [deletingMediaId, setDeletingMediaId] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  // Helper to set selected photos 
  const handleSelectPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setSelectedPhoto(file);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };
  
  // Helper to handle changes within Profile form
  const handleProfileChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Loads content for regular profile fields 

  const loadProfileForEdit = React.useCallback(async () => {
  if (sessionLoading) return;

  if (!session?.user?.id) {
    setProfileLoading(false);
    return;
  }

  setProfileLoading(true);
  setErrorMessage(null);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("profile_id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("Edit profile load error:", error);
    setErrorMessage(error.message);
    setProfileLoading(false);
    return;
  }

  if (data) {
   setProfileForm({
    display_city: data.display_city ?? "",
    sexual_interest: data.sexual_interest ?? "",
    job_title: data.job_title ?? "",
    zodiac: data.zodiac ?? "",
    education: data.education ?? "",
    nationality: data.nationality ?? "",
    race_ethnicity: data.race_ethnicity ?? "",
    about_me: data.about_me ?? "",
      drinking_status: data.drinking_status ?? "",
      smoking_status: data.smoking_status ?? "",
      height_inches:
        data.height_inches !== null && data.height_inches !== undefined
          ? String(data.height_inches)
          : "",
      exercise_status: data.exercise_status ?? "",
      has_kids:
        data.has_kids === true
          ? "true"
          : data.has_kids === false
            ? "false"
            : "",
      pets_preference: data.pets_preference ?? "",
      dating_communication_style: data.dating_communication_style ?? "",
      dating_family_plans: data.dating_family_plans ?? "",
      dating_love_language: data.dating_love_language ?? "",
      dating_comm_method: data.dating_comm_method ?? "",
      favorite_movie: data.favorite_movie ?? "",
      favorite_show: data.favorite_show ?? "",
      favorite_artist: data.favorite_artist ?? "",
      favorite_song: data.favorite_song ?? "",
      prompt_1_question: data.prompt_1_question ?? "",
      prompt_1_answer: data.prompt_1_answer ?? "",
      prompt_2_question: data.prompt_2_question ?? "",
      prompt_2_answer: data.prompt_2_answer ?? ""
    });
  }

  setProfileLoading(false);
}, [session, sessionLoading]);

  React.useEffect(() => {
    loadProfileForEdit();
  }, [loadProfileForEdit]);

  // Handles saving inserts to DB 
  const handleSaveProfile = async () => {
  if (sessionLoading) return;

  if (!session?.user?.id) {
    alert("No logged-in user found.");
    return;
  }

  setProfileSaving(true);
  setErrorMessage(null);

  const trimmedHeight = profileForm.height_inches.trim();

  const heightValue = trimmedHeight ? Number(trimmedHeight) : null;

  if (heightValue !== null && Number.isNaN(heightValue)) {
    alert("Height must be a number.");
    setProfileSaving(false);
    return;
  }

  const hasKidsValue =
    profileForm.has_kids === "true"
      ? true
      : profileForm.has_kids === "false"
        ? false
        : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_city: profileForm.display_city.trim() || null,
      sexual_interest: profileForm.sexual_interest.trim() || null,
      job_title: profileForm.job_title.trim() || null,
      zodiac: profileForm.zodiac.trim() || null,
      education: profileForm.education.trim() || null,
      nationality: profileForm.nationality.trim() || null,
      race_ethnicity: profileForm.race_ethnicity.trim() || null,
      about_me: profileForm.about_me.trim() || null,
      drinking_status: profileForm.drinking_status.trim() || null,
      smoking_status: profileForm.smoking_status.trim() || null,
      height_inches: heightValue,
      exercise_status: profileForm.exercise_status.trim() || null,
      has_kids: hasKidsValue,
      pets_preference: profileForm.pets_preference.trim() || null,
      dating_communication_style:
        profileForm.dating_communication_style.trim() || null,
      dating_family_plans: profileForm.dating_family_plans.trim() || null,
      dating_love_language: profileForm.dating_love_language.trim() || null,
      dating_comm_method: profileForm.dating_comm_method.trim() || null,
      favorite_movie: profileForm.favorite_movie.trim() || null,
      favorite_show: profileForm.favorite_show.trim() || null,
      favorite_artist: profileForm.favorite_artist.trim() || null,
      favorite_song: profileForm.favorite_song.trim() || null,
      prompt_1_question: profileForm.prompt_1_question.trim() || null,
      prompt_1_answer: profileForm.prompt_1_answer.trim() || null,
      prompt_2_question: profileForm.prompt_2_question.trim() || null,
      prompt_2_answer: profileForm.prompt_2_answer.trim() || null
    })
    .eq("profile_id", session.user.id);

  setProfileSaving(false);

  if (error) {
    console.error("Profile save error:", error);
    setErrorMessage(error.message);
    return;
  }

  alert("Profile updated!");
};

  // Loads media helper
  const loadMedia = React.useCallback(async () => {
    if (sessionLoading) return;

    if (!session?.user?.id) {
        setMedia([]);
        setMediaLoading(false);
        return;
    }

    setMediaLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
        .from("profile_media")
        .select("*")
        .eq("user_id", session.user.id)
        .order("display_order", { ascending: true })
        .limit(MAX_PROFILE_MEDIA);

    if (error) {
        console.error("Edit profile media load error:", error);
        setErrorMessage(error.message);
        setMedia([]);
        setMediaLoading(false);
        return;
    }

    if (!data || data.length === 0) {
        setMedia([]);
        setMediaLoading(false);
        return;
    }

    const mediaWithUrls = await Promise.all(
        data.map((row) => addSignedUrlToMedia(row as ProfileMediaRow))
    );

    const usableMedia = mediaWithUrls.filter(
        (item): item is ProfileMediaItem => item !== null
    );

    setMedia(usableMedia);
    setMediaLoading(false);
    }, [session, sessionLoading]);
    
  React.useEffect(() => {
    loadMedia();
    }, [loadMedia]);

    // Helper to create a clean storage path 
    const buildStoragePath = (userId: string, file: File): string => {
        const fileExt = file.name.split(".").pop() || "jpg";
        const safeFileName = `${crypto.randomUUID()}.${fileExt}`;
        
        return `${userId}/${safeFileName}`;
  };
  
  
    // Helper to handle photo uploads
    const handleUploadPhoto = async () => {
        if (sessionLoading) return;

        if (!session?.user?.id) {
            alert("No logged-in user found.");
            return;
        }

        if (!selectedPhoto) {
            alert("Please choose a photo first.");
            return;
        }

        if (!selectedPhoto.type.startsWith("image/")) {
            alert("Please choose an image file.");
            return;
        }

        if (media.length >= MAX_PROFILE_MEDIA) {
            alert("You can only add up to 9 profile photos.");
            return;
        }

        setUploading(true);
        setErrorMessage(null);

        const userId = session.user.id;
        const storagePath = buildStoragePath(userId, selectedPhoto);

        const { error: uploadError } = await supabase.storage
            .from(PROFILE_MEDIA_BUCKET)
            .upload(storagePath, selectedPhoto, {
            contentType: selectedPhoto.type,
            upsert: false
            });

        if (uploadError) {
            console.error("Profile photo upload error:", uploadError);
            setErrorMessage(uploadError.message);
            setUploading(false);
            return;
        }

        const nextDisplayOrder = getNextDisplayOrder(media);

        const { error: insertError } = await supabase
            .from("profile_media")
            .insert({
            profile_id: userId,
            user_id: userId,
            bucket: PROFILE_MEDIA_BUCKET,
            storage_path: storagePath,
            media_type: "image",
            display_order: nextDisplayOrder,
            is_primary: media.length === 0,
            caption: null
            });

        if (insertError) {
            console.error("Profile media insert error:", insertError);

            await supabase.storage
            .from(PROFILE_MEDIA_BUCKET)
            .remove([storagePath]);

            setErrorMessage(insertError.message);
            setUploading(false);
            return;
        }

        try {
          await syncPrimaryPhotoToFirst(userId);
        } catch (primaryError) {
          console.error("Could not sync primary photo:", primaryError);
          setErrorMessage("Photo uploaded, but primary photo could not be updated.");
        }

        setSelectedPhoto(null);
        setPreviewUrl(null);

        await loadMedia();

        setUploading(false);
        alert("Photo uploaded!");
        };

    // Helper to handle deleting uploaded profile photos
    const handleDeletePhoto = async (item: ProfileMediaItem) => {
    if (sessionLoading) return;

    if (!session?.user?.id) {
        alert("No logged-in user found.");
        return;
    }

    const confirmed = window.confirm("Delete this profile photo?");

    if (!confirmed) return;

    const userId = session.user.id;

    setDeletingMediaId(item.id);
    setErrorMessage(null);

    try {
        // Delete the actual photo file from Supabase Storage
        const { error: storageError } = await supabase.storage
        .from(item.bucket)
        .remove([item.storage_path]);

        if (storageError) {
        console.error("Profile photo storage delete error:", storageError);
        setErrorMessage(storageError.message);
        return;
        }

        // Delete the matching row from the profile_media table
        const { error: deleteError } = await supabase
        .from("profile_media")
        .delete()
        .eq("id", item.id)
        .eq("user_id", userId);

        if (deleteError) {
        console.error("Profile media row delete error:", deleteError);
        setErrorMessage(deleteError.message);
        return;
        }

        try {
          await syncPrimaryPhotoToFirst(userId);
        } catch (primaryError) {
        console.error("Could not sync primary photo:", primaryError);
        setErrorMessage("Photo deleted, but primary photo could not be updated.");
      }

        // Reload the uploaded photo list
        await loadMedia();
        alert("Your photo was successfully deleted!");
        } finally {
            setDeletingMediaId(null);
        }
        };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
            onClick={setPageProfile}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Go back to profile"
          >
            <img src={GoBackButton} alt="" className="h-5 w-5" />
          </button>

          <img src={LogoPinkHome} alt="Lock It" className="h-9" />
        </div>
      </header>

      {/* Main edit profile content */}
      <main className="mx-auto max-w-[320px] px-3 py-5">
        <section className="border border-neutral-500 bg-white p-2">
          {/* Page title */}
          <section className="mb-3 border border-neutral-300 bg-white p-3">
            <h1 className="text-base font-bold text-[#382543]">
              Edit Profile
            </h1>

            <p className="mt-1 text-[11px] text-neutral-500">
              Update your profile photos and details here.
            </p>
          </section>

          {/* Photo upload section */}
          <section className="mb-3 border border-neutral-300 bg-white">
            <div className="border-b border-neutral-200 px-2 py-1 text-[11px] text-neutral-400">
              Add Profile Photo
            </div>

            <div className="p-3">
              <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-neutral-300 bg-neutral-100 px-3 py-6 text-center hover:bg-neutral-200">
                <span className="text-xs font-semibold text-[#382543]">
                  Choose photo
                </span>

                <span className="mt-1 text-[11px] text-neutral-500">
                  JPG, PNG, or other image file
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelectPhoto}
                  className="hidden"
                />
              </label>

              {selectedPhoto && (
                <p className="mt-2 break-words text-[11px] text-neutral-600">
                  Selected: {selectedPhoto.name}
                </p>
              )}

              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={!selectedPhoto || uploading || media.length >= MAX_PROFILE_MEDIA}
                className="mt-3 w-full border border-[#382543] bg-white px-3 py-2 text-xs font-semibold text-[#382543] transition-colors
                 hover:bg-[#382543] hover:text-white active:bg-[#2b1c34] disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-white disabled:text-[#382543] disabled:opacity-40"
              >
                {uploading ? "Uploading..." : "Upload photo"}
              </button>

              <p className="mt-2 text-[10px] text-neutral-500">
                {media.length}/{MAX_PROFILE_MEDIA} profile photos uploaded.
              </p>

              {errorMessage && (
                <p className="mt-2 text-[10px] text-red-600">
                    {errorMessage}
                </p>
            )}
        </div>
        </section>

          {/* Selected photo preview */}
          <section className="mb-3 border border-neutral-300 bg-white">
            <div className="border-b border-neutral-200 px-2 py-1 text-[11px] text-neutral-400">
              Selected Photo Preview
            </div>

            <div className="p-3">
              {previewUrl ? (
                <div className="mx-auto aspect-square w-40 overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img
                    src={previewUrl}
                    alt="Selected profile preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mx-auto flex aspect-square w-40 items-center justify-center border border-dashed border-neutral-300 bg-neutral-100 px-2 text-center text-[11px] text-neutral-500">
                  No photo selected yet
                </div>
              )}
            </div>
          </section>

          {/* Current uploaded photos */}
          <section className="mb-3 border border-neutral-300 bg-white">
            <div className="border-b border-neutral-200 px-2 py-1 text-[11px] text-neutral-400">
                Current Uploaded Photos
            </div>

            <div className="p-3">
                {mediaLoading ? (
                <div className="flex gap-2">
                    <div className="aspect-square w-20 bg-neutral-200" />
                    <div className="aspect-square w-20 bg-neutral-200" />
                </div>
                ) : media.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                    {media.map((item, index) => (
                    <div
                        key={item.id}
                        className="relative aspect-square overflow-hidden border border-neutral-200 bg-neutral-100"
                    >
                        <img
                        src={item.url}
                        alt={item.caption || `Uploaded profile photo ${index + 1}`}
                        className="h-full w-full object-cover"
                        />

                        {item.is_primary && (
                        <span className="absolute left-1 top-1 rounded bg-white/80 px-1 py-0.5 text-[9px] font-semibold text-[#382543]">
                            Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(item)}
                        disabled={deletingMediaId !== null}
                        aria-label={`Delete uploaded profile photo ${index + 1}`}
                        className="absolute bottom-1 right-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-red-600 shadow transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                        {deletingMediaId === item.id ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="flex aspect-square w-24 items-center justify-center border border-dashed border-neutral-300 bg-neutral-100 px-2 text-center text-[10px] text-neutral-500">
                    No uploaded photos yet
                </div>
                )}
            </div>
            </section>


          {/* Demographics */}
          <EditSection title="Demographics">

            <TextField
                label="City"
                name="display_city"
                value={profileForm.display_city}
                onChange={handleProfileChange}
              />
              
            <TextField
              label="Interested In"
              name="sexual_interest"
              value={profileForm.sexual_interest}
              onChange={handleProfileChange}
            />

            <TextField
              label="Job Title"
              name="job_title"
              value={profileForm.job_title}
              onChange={handleProfileChange}
            />

            <TextField
              label="Zodiac"
              name="zodiac"
              value={profileForm.zodiac}
              onChange={handleProfileChange}
            />

            <TextField
              label="Education"
              name="education"
              value={profileForm.education}
              onChange={handleProfileChange}
            />

            <TextField
              label="Nationality"
              name="nationality"
              value={profileForm.nationality}
              onChange={handleProfileChange}
            />

            <TextField
              label="Race/Ethnicity"
              name="race_ethnicity"
              value={profileForm.race_ethnicity}
              onChange={handleProfileChange}
            />

            <TextField
              label="Height"
              name="height_inches"
              type="number"
              value={profileForm.height_inches}
              onChange={handleProfileChange}
            />
          </EditSection>

          {/* About Me */}
          <EditSection title="About Me">
            <TextAreaField
              label="About Me"
              name="about_me"
              value={profileForm.about_me}
              onChange={handleProfileChange}
            />
          </EditSection>

          {/* Lifestyle */}
          <EditSection title="Lifestyle">
            <SelectField
              label="Drinking Status"
              name="drinking_status"
              value={profileForm.drinking_status}
              onChange={handleProfileChange}
              options={["Doesn't Drink", "Drinks on occasion", "Drinks often"]}
            />

            <SelectField
              label="Smoking Status"
              name="smoking_status"
              value={profileForm.smoking_status}
              onChange={handleProfileChange}
              options={["Doesn't Smoke", "Smokes on occasion", "Smokes often"]}
            />

            <SelectField
              label="Exercise"
              name="exercise_status"
              value={profileForm.exercise_status}
              onChange={handleProfileChange}
              options={[
                "Doesn't exercise",
                "Exercises a couple times a week",
                "Exercises almost every day"
              ]}
            />

            <SelectField
              label="Have any Children?"
              name="has_kids"
              value={profileForm.has_kids}
              onChange={handleProfileChange}
              options={[
                { value: "true", label: "Has kids" },
                { value: "false", label: "No kids" }
              ]}
            />

            <SelectField
              label="Pets Ok?"
              name="pets_preference"
              value={profileForm.pets_preference}
              onChange={handleProfileChange}
              options={[
                "Ok with just dogs",
                "Ok with just cats",
                "Ok with all pets",
                "Not ok with pets"
              ]}
            />
          </EditSection>

          {/* Dating Style */}
          <EditSection title="Dating Style">
            <SelectField
              label="Communication Style"
              name="dating_communication_style"
              value={profileForm.dating_communication_style}
              onChange={handleProfileChange}
              options={[
                "Direct and Expressive",
                "Balanced",
                "Reserved",
                "Thoughtful and Reflective",
                "Flirty",
                "Blunt",
                "Straight to the point"
              ]}
            />

            <SelectField
              label="Family Plans"
              name="dating_family_plans"
              value={profileForm.dating_family_plans}
              onChange={handleProfileChange}
              options={[
                "Wants Kids",
                "Has kids",
                "Undecided",
                "No kids"
              ]}
            />

            <SelectField
              label="Love Language"
              name="dating_love_language"
              value={profileForm.dating_love_language}
              onChange={handleProfileChange}
              options={[
                "Words of affirmation",
                "Quality Time",
                "Physical Touch",
                "Acts of service",
                "Receiving gifts"
              ]}
            />

            <SelectField
              label="Communication Method"
              name="dating_comm_method"
              value={profileForm.dating_comm_method}
              onChange={handleProfileChange}
              options={[
                "Text",
                "Video Call",
                "Phone Call"
              ]}
            />
          </EditSection>

          {/* Favorites */}
          <EditSection title="Favorites">
            <TextField
              label="Favorite Movie"
              name="favorite_movie"
              value={profileForm.favorite_movie}
              onChange={handleProfileChange}
            />

            <TextField
              label="Favorite TV Show"
              name="favorite_show"
              value={profileForm.favorite_show}
              onChange={handleProfileChange}
            />

            <TextField
              label="Favorite Artist"
              name="favorite_artist"
              value={profileForm.favorite_artist}
              onChange={handleProfileChange}
            />

            <TextField
              label="Favorite Song"
              name="favorite_song"
              value={profileForm.favorite_song}
              onChange={handleProfileChange}
            />
          </EditSection>

          {/* Prompts */}
          <EditSection title="Prompts">
            <SelectField
              label="Prompt 1"
              name="prompt_1_question"
              value={profileForm.prompt_1_question}
              onChange={handleProfileChange}
              options={PROMPT_1_OPTIONS}
            />

            <TextAreaField
              label="Prompt 1 Answer"
              name="prompt_1_answer"
              value={profileForm.prompt_1_answer}
              onChange={handleProfileChange}
            />

            <SelectField
              label="Prompt 2"
              name="prompt_2_question"
              value={profileForm.prompt_2_question}
              onChange={handleProfileChange}
              options={PROMPT_2_OPTIONS}
            />

            <TextAreaField
              label="Prompt 2 Answer"
              name="prompt_2_answer"
              value={profileForm.prompt_2_answer}
              onChange={handleProfileChange}
            />
          </EditSection>
          
          {/* Save Button*/}
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={profileSaving || profileLoading}
            className="mt-3 w-full border border-[#382543] bg-[#382543] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2b1c34] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {profileSaving ? "Saving..." : "Save Profile"}
          </button>
        </section>
      </main>
    </div>
  );
};

function EditSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-3 overflow-hidden border border-neutral-300 bg-white">
      <div className="border-b border-neutral-200 px-2 py-1 text-[11px] text-neutral-400">
        {title}
      </div>

      <div>{children}</div>
    </section>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  name: keyof ProfileForm;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
}) {
  return (
    <label className="flex min-h-9 items-center gap-2 border-b border-neutral-100 px-3 py-2 last:border-b-0 text-[11px]">
      <span className="shrink-0 font-medium text-[#7A1E43]">{label}</span>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="min-w-0 flex-1 bg-transparent text-right text-[11px] font-medium text-[#382543] outline-none placeholder:text-neutral-300"
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange
}: {
  label: string;
  name: keyof ProfileForm;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
}) {
  return (
    <label className="block text-[11px]">
      <div className="border-b border-neutral-100 px-3 py-2 font-medium text-[#7A1E43]">
        {label}
      </div>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        placeholder="Start typing here..."
        className="min-h-28 w-full resize-none bg-white px-3 py-2 text-[11px] text-[#382543] outline-none placeholder:text-neutral-300"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options
}: {
  label: string;
  name: keyof ProfileForm;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: Array<string | { value: string; label: string }>;
}) {
  return (
    <label className="flex min-h-9 items-center gap-2 border-b border-neutral-100 px-3 py-2 text-[11px] last:border-b-0">
      <span className="shrink-0 font-medium text-[#7A1E43]">{label}</span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="min-w-0 flex-1 appearance-none bg-transparent text-right text-[11px] font-medium text-[#382543] outline-none"
      >
        <option value="">Select one</option>

        {options.map((option) => {
          const optionValue =
            typeof option === "string" ? option : option.value;

          const optionLabel =
            typeof option === "string" ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>

      <span className="text-[#7A1E43]">›</span>
    </label>
  );
}

export default EditProfile;