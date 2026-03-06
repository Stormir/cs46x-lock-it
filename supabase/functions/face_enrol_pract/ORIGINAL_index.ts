/* CS46X\supaBase\face_enrol_pract\index.ts
Test if working
supabase stop --all
supabase stop
supabase functions serve --no-verify-jwt
TEST FOR face_enrol_pract\index.ts
{GET} curl.exe -i http://127.0.0.1:54321/functions/v1/face_enrol_pract
{POST} curl.exe -i -X POST `
  -F "file=@C:\Users\Kaye\OneDrive\Desktop\resized_1.jpg" `
  -F "subject=kaye_test_1" `
  http://127.0.0.1:54321/functions/v1/face_enrol_pract

*/
// Teach CompreFace who someone is
// 1. Get photo from storage
// 2. send to CompreFace
// 3. store Compreface image

// https://supabase.com/docs/reference/javascript/installing
import { createClient } from "npm:@supabase/supabase-js@2";

// json
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

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
    }
    return { value: parsed as JsonValue };
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

/* ---------------- FUNCTION ---------------- */

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Use POST" });
  }

  const COMPREFACE_BASE_URL = Deno.env.get("COMPREFACE_BASE_URL");
  const COMPREFACE_API_KEY_KAYE = Deno.env.get("COMPREFACE_API_KEY_KAYE");
  const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("PROJECT_SERVICE_ROLE_KEY");

  if (!COMPREFACE_BASE_URL || !COMPREFACE_API_KEY_KAYE) {
    return json(500, { error: "Missing COMPREFACE_BASE_URL or COMPREFACE_API_KEY_KAYE" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  // Parse multipart form-data from client
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json(400, { error: "Expected multipart/form-data" });
  }

  // rq image
  const file = form.get("file");
  if (!(file instanceof File)) {
    return json(400, { error: "Missing 'file' (image) in form-data" });
  }

  // rq subject (who this face belongs to) — best: user UUID
  const subject = form.get("subject")?.toString().trim();
  if (!subject) {
    return json(400, { error: "Missing 'subject' in form-data" });
  }

  const user_id = form.get("user_id")?.toString() ?? null;

  const metadataRaw = form.get("metadata")?.toString() ?? null;
  const metadata = safeParseObject(metadataRaw);

  // Build CompreFace enroll request:
  // POST /api/v1/recognition/faces?subject=<subject> with multipart "file"
  const cfForm = new FormData();
  cfForm.set("file", file, file.name);

  const enrollUrl =
    `${COMPREFACE_BASE_URL.replace(/\/$/, "")}` +
    `/api/v1/recognition/faces?subject=${encodeURIComponent(subject)}`;

  const cfResp = await fetch(enrollUrl, {
    method: "POST",
    headers: {
      "x-api-key": COMPREFACE_API_KEY_KAYE,
      // Don't set Content-Type for FormData
    },
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

  const image_id =
    typeof cfJson.image_id === "string" ? cfJson.image_id : null;

  // Store results in Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const insertPayload: {
    event_type: string;
    user_id: string | null;
    metadata: MetadataObject;
    compreface_response: CompreFaceEnrollResponse;
  } = {
    event_type: "enroll",
    user_id,
    metadata: {
      ...metadata,
      subject,
      image_id,
    },
    compreface_response: cfJson,
  };

  const { error: insertError } = await supabase
    .from("face_events")
    .insert(insertPayload);

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
  });
});