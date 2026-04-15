// goal:
// Download image from storage ->
// send to compreface ->
// store response in backend_face ->
// return similarity score

// supabase/functions/recognition_pract/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

// Always return an object so spreading works: { ...metadata, image_id }
function safeObject(raw: string | null): Record<string, JsonValue> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);

    // If it's a plain object, use it
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, JsonValue>;
    }

    // If it's not an object (string/number/array), wrap it
    return { value: parsed as JsonValue };
  } catch {
    // If JSON parse fails, store raw string
    return { raw };
  }
}

// Define CORS headers so browsers are allowed to call this function
// Allow requests from ANY domain (useful during development)
// Allow these request headers to be sent by frontend apps
// Only allow POST requests + OPTIONS preflight checks
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper function to return JSON responses consistently
function json(
  //Status code. Ex 400
  status: number,
  body: unknown,
  //additional headers
  extraHeaders: Record<string, string> = {},
) {
  // Create a response object with JSON string body
  return new Response(JSON.stringify(body), {
    status,
    // Merge default CORS headers, extra headers, json content
    headers: {
      ...corsHeaders,
      ...extraHeaders,
      "Content-Type": "application/json",
    },
  });
}

// Helper: pull a number from a few common CompreFace response shapes
function getPathValue(
  obj: unknown,
  path: string[],
): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (
      current &&
      typeof current === "object" && key in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function pickNumber(obj: unknown, paths: string[]): number | null {
  for (const p of paths) {
    const value = getPathValue(obj, p.split("."));
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
}

function pickBoolean(obj: unknown, paths: string[]): boolean | null {
  for (const p of paths) {
    const value = getPathValue(obj, p.split("."));
    if (typeof value === "boolean") {
      return value;
    }
  }
  return null;
}

// helper to pull the first result from the array:
function getFirstResult(obj: unknown): Record<string, unknown> | null {
  if (!obj || typeof obj !== "object") return null;

  const result = (obj as Record<string, unknown>)["result"];

  if (Array.isArray(result) && result.length > 0) {
    const first = result[0];
    if (first && typeof first === "object") {
      return first as Record<string, unknown>;
    }
  }

  return null;
}

/**
 * recognition_pract (VERIFY)
 * Purpose:
 * 1) Download image from Supabase Storage (bucket + storage_path)
 * 2) Send image to CompreFace verify endpoint using image_id
 * 3) Store response + similarity/passed in backend_face
 * 4) Return similarity (and full response) to caller
 */
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json(405, { error: "Use POST" });
  }

  // Secrets ref .env.local
  const COMPREFACE_BASE_URL = Deno.env.get("COMPREFACE_BASE_URL");
  const COMPREFACE_API_KEY_KAYE = Deno.env.get("COMPREFACE_API_KEY_KAYE");
  const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("PROJECT_SERVICE_ROLE_KEY");

  if (!COMPREFACE_BASE_URL || !COMPREFACE_API_KEY_KAYE) {
    return json(500, {
      error: "Missing COMPREFACE_BASE_URL or COMPREFACE_API_KEY_KAYE",
    });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, {
      error: "Missing PROJECT_SUPABASE_URL or PROJECT_SERVICE_ROLE_KEY",
    });
  }

  // Parse multipart/form-data
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, { error: "Expected multipart/form-data" });
  }

  // Required inputs for verify
  const image_id = form.get("image_id")?.toString().trim();
  const user_id = form.get("user_id")?.toString().trim() ?? null;

  // Storage location of the photo we want to verify
  const bucket = form.get("bucket")?.toString().trim();
  const storage_path = form.get("storage_path")?.toString().trim();

  if (!image_id) return json(400, { error: "Missing 'image_id' in form-data" });
  if (!bucket) return json(400, { error: "Missing 'bucket' in form-data" });
  if (!storage_path) {
    return json(400, { error: "Missing 'storage_path' in form-data" });
  }

  // Optional metadata for logging
  const metadataRaw = form.get("metadata")?.toString() ?? null;
  const metadata = safeObject(metadataRaw);

  // Create Supabase client (service role: can read storage and insert rows)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1) Download image from Storage
  const { data: fileData, error: dlError } = await supabase.storage
    .from(bucket)
    .download(storage_path);

  if (dlError || !fileData) {
    return json(400, {
      error: "Failed to download image from storage",
      details: dlError?.message ?? "No file data returned",
      bucket,
      storage_path,
    });
  }

  // Convert Blob -> File for CompreFace multipart
  const bytes = new Uint8Array(await fileData.arrayBuffer());
  const verifyFile = new File([bytes], "verify.jpg", { type: "image/jpeg" });

  // 2) Send to CompreFace verify
  const verifyUrl = `${COMPREFACE_BASE_URL.replace(/\/$/, "")}` +
    `/api/v1/recognition/faces/${encodeURIComponent(image_id)}/verify`;

  const cfForm = new FormData();
  cfForm.set("file", verifyFile, verifyFile.name);

  const cfResp = await fetch(verifyUrl, {
    method: "POST",
    headers: { "x-api-key": COMPREFACE_API_KEY_KAYE },
    body: cfForm,
  });

  const cfText = await cfResp.text();

  let cfJson: JsonObject;
  try {
    const parsed = JSON.parse(cfText) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      cfJson = parsed as JsonObject;
    } else {
      cfJson = { value: parsed as JsonValue };
    }
  } catch {
    cfJson = { raw: cfText };
  }

  // 3) Extract a similarity/threshold/passed if present (safe, best-effort)
  const firstResult = getFirstResult(cfJson);

  const similarity = pickNumber(cfJson, [
    "similarity",
    "result.similarity",
    "data.similarity",
    "probability",
    "result.probability",
  ]) ??
    (typeof firstResult?.similarity === "number"
      ? firstResult.similarity
      : null);

  const threshold = pickNumber(cfJson, [
    "threshold",
    "result.threshold",
    "data.threshold",
  ]) ?? 0.5;

  const passed = pickBoolean(cfJson, [
    "verified",
    "result.verified",
    "match",
    "result.match",
  ]) ??
    (typeof firstResult?.match === "boolean" ? firstResult.match : null) ??
    (similarity !== null && threshold !== null
      ? similarity >= threshold
      : null);

  // 4) Store result in backend_face
  const { error: insertError } = await supabase.from("backend_face").insert({
    user_id,
    attempt_type: "verify",
    bucket,
    storage_path,
    threshold,
    similarity,
    passed,
    compreface_response: cfJson,
    // if you want to store extra stuff, keep it in the jsonb metadata:
    // (only include this if your backend_face table has a "metadata" column)
    // metadata: { ...metadata, image_id },
  });

  // 5) Return result
  return json(200, {
    ok: cfResp.ok,
    status: cfResp.status,
    similarity,
    threshold,
    passed,
    compreface: cfJson,
    // debug statement
    debug_version1: "stormi-deploy-test-1",
    db_warning: insertError?.message ?? null,
    logged: !insertError,
    metadata_used: { ...metadata, image_id },
  });
});
