// goal:
// Teach CompreFace who someone is
// Get photo from storage ->
// send to CompreFace ->
// store Compreface img 

// https://supabase.com/docs/reference/javascript/installing
import { createClient } from "npm:@supabase/supabase-js@2";

// json
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

// Metadata helper
// Ensure we always have an object we can safely spread into DB metadata.
// - If metadata is an object => use it
//  - If metadata is array/primitive => wrap it as { value: ... }
// - If parse fails => { raw: "..." }
type MetadataObject = Record<string, JsonValue>;
function safeParseObject(raw: string | null): MetadataObject {
    if (!raw) return {};
    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed as MetadataObject;
        } return { value: parsed as JsonValue };
    } catch {
        return { raw };
    }
}

// CompreFace typed response
type CompreFaceEnrollResponse = JsonObject & {
    image_id?: string;
    subject?: string;
    message?: string;
};

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: JsonObject) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json(405, { error: "Use POST" });
  }

  // PLS PLS PLS refer to .env.local
  const COMPREFACE_BASE_URL = Deno.env.get("COMPREFACE_BASE_URL");
  const COMPREFACE_API_KEY_KAYE = Deno.env.get("COMPREFACE_API_KEY_KAYE");
  const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("PROJECT_SERVICE_ROLE_KEY");

  if (!COMPREFACE_BASE_URL || !COMPREFACE_API_KEY_KAYE) {
    return json(500, { error: "Missing COMPREFACE_BASE_URL or COMPREFACE_API_KEY_KAYE" });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: "Missing PROJECT_SUPABASE_URL or PROJECT_SERVICE_ROLE_KEY" });
  }

  // Parse multipart form-data from client
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, { error: "Expected multipart/form-data" });
  }

  // REQUIREDDDDDDDDD: who this face belongs to (best: your user UUID)
  const subject = form.get("subject")?.toString().trim();
  if (!subject) return json(400, { error: "Missing 'subject' in form-data" });

  //where the image lives in Storage
  const bucket = form.get("bucket")?.toString().trim();
  const storage_path = form.get("storage_path")?.toString().trim();
  if (!bucket) return json(400, { error: "Missing 'bucket' in form-data" });
  if (!storage_path) return json(400, { error: "Missing 'storage_path' in form-data" });

  //for DB logging
  const user_id = form.get("user_id")?.toString().trim() ?? null;

  const metadataRaw = form.get("metadata")?.toString() ?? null;
  const metadata = safeParseObject(metadataRaw);

  // Connect to SupaBase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1) Download image from Storage
  const { data: blob, error: dlError } = await supabase.storage
    .from(bucket)
    .download(storage_path);

  if (dlError || !blob) {
    return json(400, {
        error: "Failed to download image from storage",
        details: dlError?.message ?? "No file data returned",
        bucket,
        storage_path,
    });
  }

  // Convert Blob to File for CompreFace multipart upload
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const uploadFile = new File([bytes], "enroll.jpg", { type: "image/jpeg" });

  // 2) Send to CompreFace enroll endpoint
  // POST /api/v1/recognition/faces?subject=<subject> with multipart "file"
  const enrollUrl =
    `${COMPREFACE_BASE_URL.replace(/\/$/, "")}` +
    `/api/v1/recognition/faces?subject=${encodeURIComponent(subject)}`;

  const cfForm = new FormData();
  cfForm.set("file", uploadFile, uploadFile.name);

  const cfResp = await fetch(enrollUrl, {
    method: "POST",
    headers: { "x-api-key": COMPREFACE_API_KEY_KAYE },
    body: cfForm,
  });

  const text = await cfResp.text();

  let cfJson: CompreFaceEnrollResponse;
  try {
    cfJson = JSON.parse(text) as CompreFaceEnrollResponse;
  } catch {
    cfJson = { raw: text };
  }

  if (!cfResp.ok) {
    return json(400, {
      error: "CompreFace enroll failed",
      status: cfResp.status,
      compreface: cfJson,
    });
  }

  const image_id = typeof cfJson.image_id === "string" ? cfJson.image_id : null;

  // 3) Store response in DB (based on your table screenshot)
  // Table: backend_face
  // Columns include: user_id, subject_id, bucket, storage_path, compreface_response, attempt_type, image_id
  const { error: insertError } = await supabase
    .from("backend_face")
    .insert({
        attempt_type: "enroll",
        user_id,
        subject_id: subject,
        image_id,
        bucket,
        storage_path,
        compreface_response: cfJson,
      // ncomment for laterrr if using metadata column
      // metadata: { ...metadata, subject, image_id, bucket, storage_path },
    });

  // Return success even if DB insert fails
  if (insertError) {
    return json(200, {
        ok: true,
        compreface: cfJson,
        db_warning: insertError.message,
    });
  }

  return json(200, {
    ok: true,
    compreface: cfJson,
    stored: {
        table: "backend_face",
        subject_id: subject,
        image_id,
        bucket,
        storage_path,
    },
    metadata_used: metadata,
  });
});