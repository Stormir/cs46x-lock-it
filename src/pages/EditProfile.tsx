import React from "react";
import { supabase } from "../client";
import { useSession } from "../api/useSession";

import LogoPinkHome from "../assets/logo/logo_pink_home.svg";
import GoBackButton from "../assets/icons/go_back_button.svg";

// Constants 

const BRAND = "#382543";
const BODY_TEXT = "#382543";

const PROFILE_MEDIA_BUCKET = "profile-media";
const MAX_PROFILE_MEDIA = 9;
const MEDIA_URL_EXPIRES_IN_SECONDS = 60 * 60;

type EditProfileProps = {
  setPageProfile: () => void;
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
  created_at?: string;
  updated_at?: string;
};

type ProfileMediaItem = ProfileMediaRow & {
  url: string;
};

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

// URL Helper
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

const EditProfile: React.FC<EditProfileProps> = ({ setPageProfile }) => {
  const { session, loading: sessionLoading } = useSession();
  const [selectedPhoto, setSelectedPhoto] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const [media, setMedia] = React.useState<ProfileMediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [deletingMediaId, setDeletingMediaId] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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
              Update your profile photos here.
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
          <section className="border border-neutral-300 bg-white">
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
        </section>
      </main>
    </div>
  );
};

export default EditProfile;