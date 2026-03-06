import { supabase } from "../client"; 

// ----------------------
// Constants
// ----------------------

// Supabase storage bucket
const FACES_BUCKET = "faces";

// ----------------------
// Types
// ----------------------

// Possible Verification States
export type PhotoIdStatus =
  | "NEEDS_VERIFICATION"
  | "PENDING"
  | "VERIFIED"
  | "FAILED";

// The  values from the backend we might want to display or log 
export type VerifyResult = {
  passed: boolean | null;
  similarity: number | null;
  threshold: number | null;
  // raw payload 
  compreface?: unknown;
};

// ----------------------
// Path Helpers 
// -----------------------

// Builds the storage path for the image used during enroll
// Includs the userId so each users files are grouped together
function buildEnrollPath(userId: string): string {
  return `enroll/${userId}/${Date.now()}.jpg`;
}

// Builds the storage path for the image used during verify
// Stored in the same bucket as enroll images, but under a different path prefix
function buildVerifyPath(userId: string): string {
  return `verify/${userId}/${Date.now()}.jpg`;
}

// --------------------
// Storage helpers
// -------------------


// FOR TESTING 
// Stops "File already exists" errors
// Why: 
// - Uses upsert so local dev testing doesn't fail whith "file already exists" errors
// Returns:
// - Image path we need later for edge functions 
async function uploadOrReplaceToFacesBucket(
  file: File,
  path: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(FACES_BUCKET)
    .upload(path, file, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(error.message);
  }

  return path;
}

// --------------------
//  DB helpers
// --------------------

// Shapes active training record we expect form db_face_training
type ActiveTraining = {
  compreface_image_id: string;
  subject_id: string;
  bucket: string;
  storage_path: string;
};

// Looks for users active face training record
// Why: 
// - Doesn't re-enroll users if record exists and moves onto verification
// Returns:
// - the training record if found/valid
// - null if no active training exists 
// - null if the row exists but compreface_image_id is missing
async function getActiveTraining(userId: string): Promise<ActiveTraining | null> {
  const { data, error } = await supabase
    .from("db_face_training")
    .select("compreface_image_id, subject_id, bucket, storage_path")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("getActiveTraining error:", error);
    throw new Error(error.message);
  }

  if (!data) return null;

  // If compreface_image_id is missing treat like not trained
  // because no usable reference image in compreface
  if (!data.compreface_image_id) return null;

  return data as ActiveTraining;
}


// Inserts or updates users training record in db_face_training
// Why:
// - Upsert allows one current training record
async function upsertTrainingRecord(args: {
  user_id: string;
  compreface_image_id: string;
  bucket: string;
  storage_path: string;
}): Promise<void> {
  const { user_id, compreface_image_id, bucket, storage_path } = args;

  const payload = {
    user_id,
    //subject_id should match the UUID used as subject
    subject_id: user_id, 
    compreface_image_id,
    bucket,
    storage_path,
    active: true,
  };

  // If row exists we overwrite it, if it doesn't we create it
  const { error } = await supabase
    .from("db_face_training")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.error("upsertTrainingRecord error:", error);
    throw new Error(error.message);
  }
}


// Makes sure a row exists in verification_status for user
// Why: 
// - Allows UI to read and update status row
async function ensureVerificationStatusRow(userId: string): Promise<void> {
  //Try to find existing row
  const { data, error } = await supabase
    .from("verification_status")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("ensureVerificationStatusRow select error:", error);
    throw new Error(error.message);
  }

  //If it exists, we're done
  if (data) return;

  //Otherwise insert default row so user starts in NEEDS_VERIFICATION
  const { error: insertError } = await supabase.from("verification_status").insert({
    user_id: userId,
    photo_id_status: "NEEDS_VERIFICATION",
  });

  if (insertError) {
    console.error("ensureVerificationStatusRow insert error:", insertError);
    throw new Error(insertError.message);
  }
}



// Updates users verification_status row w/ latest result
// Used for UI facing state changes (needs_verification, pending, verified, failed)
async function updatePhotoIdStatus(args: {
  userId: string;
  status: PhotoIdStatus;
  passed?: boolean | null;
  similarity?: number | null;
  verifiedAt?: string | null;
}): Promise<void> {
  const { userId, status, similarity, verifiedAt } = args;

  const payload: Record<string, unknown> = {
    photo_id_status: status,
    last_face_score: similarity ?? null,
    last_face_check_at: new Date().toISOString(),
  };

  // only set verified timestamp when VERIFIED
  if (status === "VERIFIED") {
    payload.photo_id_verified_at = verifiedAt ?? new Date().toISOString();
  }

  const { error } = await supabase
    .from("verification_status")
    .update(payload)
    .eq("user_id", userId);

  if (error) {
    console.error("updatePhotoIdStatus error:", error);
    throw new Error(error.message);
  }
}

// --------------------
// Edge function helpers
// --------------------

// Shapes result from enroll edge function
type EnrollEdgeResult = {
  image_id: string;
  compreface?: unknown;
};
// Calls the enroll edge function to register the users reference image
// Inputs:
// - subject
// - bucket
// - storage_path
// - user_id
// Returns:
// - image_id
async function callEnrollEdge(args: {
  userId: string;
  enrollPath: string;
}): Promise<EnrollEdgeResult> {
  const { userId, enrollPath } = args;

  const form = new FormData();
  form.set("subject", userId);
  form.set("bucket", FACES_BUCKET);
  form.set("storage_path", enrollPath);
  form.set("user_id", userId); // optional but nice

  const { data, error } = await supabase.functions.invoke("face_enrol_pract", {
    body: form,
  });

  if (error) {
    console.error("callEnrollEdge error:", error);
    throw new Error(error.message);
  }

  // Checks multiple paths for image_id response 
  const imageId =
    data?.compreface?.image_id ??
    data?.stored?.image_id ??
    null;

  if (!imageId || typeof imageId !== "string") {
    console.error("callEnrollEdge missing image_id:", data);
    throw new Error("Enroll succeeded but no image_id was returned.");
  }
  // raw data
  return {
    image_id: imageId,
    compreface: data?.compreface ?? data ?? null,
  };
}


// Calls the recognition edge function
// Inputs:
// - imageId (Compreface image id)
// - verifyPath (storage path of the live photo)
// Returns: 
// - Pass or Fail + similarity info 
async function callVerifyEdge(args: {
  userId: string;
  verifyPath: string;
  imageId: string;
}): Promise<VerifyResult> {
  const { userId, verifyPath, imageId } = args;

  const form = new FormData();
  form.set("image_id", imageId);
  form.set("bucket", FACES_BUCKET);
  form.set("storage_path", verifyPath);
  form.set("user_id", userId); 

  const { data, error } = await supabase.functions.invoke("recognition_pract", {
    body: form,
  });

  if (error) {
    console.error("callVerifyEdge error:", error);
    throw new Error(error.message);
  }

  // returns edge function response (UI friendly shape)
  return {
    passed: typeof data?.passed === "boolean" ? data.passed : null,
    similarity: typeof data?.similarity === "number" ? data.similarity : null,
    threshold: typeof data?.threshold === "number" ? data.threshold : null,
    compreface: data?.compreface ?? data ?? null,
  };
}

// ---------------------
// Pipeline Function (UI calls this one)
// --------------------
// Coordinates full verificaiton flow 
export async function runPhotoVerificationFlow(args: {
  userId: string;
  photoIdFile: File;
  selfieFile: File;
}): Promise<{
  status: PhotoIdStatus;
  result: VerifyResult;
  statusText: string;
}> {
  const { userId, photoIdFile, selfieFile } = args;

  // 1) Ensures user has a verification_status row 
  await ensureVerificationStatusRow(userId);

  // 2) Build storage paths for uploaded imag
  // enrollPath = reference image
  // verifyPath = live photo 
  const enrollPath = buildEnrollPath(userId);

  const verifyPath = buildVerifyPath(userId);

  // 3) Upload both files to supabase storage
  // upsert avoids "file exists" during testing
  await uploadOrReplaceToFacesBucket(photoIdFile, enrollPath);
  await uploadOrReplaceToFacesBucket(selfieFile, verifyPath);

  // 4) Checks if user already has an enrolled image_id
  let training = await getActiveTraining(userId);
  let imageId: string;

  // 5) If no training record enrolls user then stores image_id in db_face_training
  if (!training) {
    const enrollRes = await callEnrollEdge({ userId, enrollPath });
    imageId = enrollRes.image_id;

    await upsertTrainingRecord({
      user_id: userId,
      compreface_image_id: imageId, 
      bucket: FACES_BUCKET,
      storage_path: enrollPath,
    });

    // refresh local training 
    training = await getActiveTraining(userId);
  } else {
    imageId = training.compreface_image_id;
  }

  // 6) Set pending (for updating UI)
  await updatePhotoIdStatus({
    userId,
    status: "PENDING",
    similarity: null,
  });

  // 7) Verifies using recognition_pract edge function
  const verifyRes = await callVerifyEdge({
    userId,
    verifyPath,
    imageId,
  });

  // 8) Translates verify result into final app status
  // updates verification_status accordingly
  if (verifyRes.passed === true) {
    await updatePhotoIdStatus({
      userId,
      status: "VERIFIED",
      similarity: verifyRes.similarity ?? null,
      verifiedAt: new Date().toISOString(),
    });

    // For future: set profiles.is_verified = true if app uses it
    // Use only if the column is used in UI logic
    // await supabase.from("profiles").update({ is_verified: true }).eq("profile_id", userId);

    return {
      status: "VERIFIED",
      result: verifyRes,
      statusText: "Verified",
    };
  }

  if (verifyRes.passed === false) {
    await updatePhotoIdStatus({
      userId,
      status: "FAILED",
      similarity: verifyRes.similarity ?? null,
    });

    return {
      status: "FAILED",
      result: verifyRes,
      statusText: "Failed — try again",
    };
  }

  // If pass comes back funky (null) we treat as failed 
  // This gives UI a fallback state
  await updatePhotoIdStatus({
    userId,
    status: "FAILED",
    similarity: verifyRes.similarity ?? null,
  });

  return {
    status: "FAILED",
    result: verifyRes,
    statusText: "Could not verify — try again",
  };
}
