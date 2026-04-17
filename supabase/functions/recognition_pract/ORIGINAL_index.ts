/* CS46X\supaBase\recognition_pract\index.ts
Test if working:
Reset Supabase
  1. supabase stop --all
  2. docker ps -aq --filter "name=supabase" | % { docker rm -f $_ }
  3. supabase stop
In host folder
  1. supa base start
  2. supabase functions serve --no-verify-jwt
SET SECRETS: see 
1. supabase log in
2. get Supabase CLI code from browser
3. link project using 
      supabase link --project-ref vyemfhpkqrtdyvgvdrfk
supabase secrets set COMPREFACE_BASE_URL="http://YOUR_COMPREFACE_HOST:8000"
supabase secrets set COMPREFACE_API_KEY_KAYE="YOUR_COMPREFACE_API_KEY"
supabase secrets set SUPABASE_URL="http://127.0.0.1:54321"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_LOCAL_SERVICE_ROLE_KEY"

TEST FOR recogniction_pract/index.ts
In new terminal (host folder)
  1. {GET} curl.exe -i http://127.0.0.1:54321/functions/v1/recognition_pract
2. {POST} curl.exe -i -X POST `
  -F "file=@C:\Users\Kaye\OneDrive\Desktop\resized_1.jpg" `
  -F "image_id=test123" `
  http://127.0.0.1:54321/functions/v1/recognition_pract
*/
// Import SupaBase client
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
    headers: { ...corsHeaders, ...extraHeaders, "Content-Type": "application/json" },
  });
}

// Start the Edge Function HTTP server
// **BE SURE TO INSTALL DENO
Deno.serve(async (req) => {
  // Handle browser preflight request (sent before POST) and reject anything that is not POST
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  if (req.method !== "POST")
    return json(405, { error: "Use POST" });

  // CompreFace URL/API KEY
  // Ask Kaye
  const COMPREFACE_BASE_URL = Deno.env.get("COMPREFACE_BASE_URL");
  const COMPREFACE_API_KEY_KAYE = Deno.env.get("COMPREFACE_API_KEY_KAYE");
  const SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("PROJECT_SERVICE_ROLE_KEY");

  // If not found, naur
  if (!COMPREFACE_BASE_URL || !COMPREFACE_API_KEY_KAYE) {
    return json(500, { error: "Missing COMPREFACE_* secrets" });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  // Try to parse incoming rq as multipart/form data
  // If parse fails, rq format is wrong
  let form: FormData;

  try {
    form = await req.formData();
  } catch {
    return json(400, { error: "Expected multipart/form-data" });
  }

  /*------------------------------------GETTING IMAGE -----------------------------------*/ 

  // Get uploaded image file from form
  const file = form.get("file");
  // Get enrolled face image_id (stored in SupaBase)
  const image_id = form.get("image_id")?.toString();

  // make sure image exists
  if (!(file instanceof File))
    return json(400, { error: "Missing 'file' (img) in form-data" });
  
  // make sure image_id exists
  if (!image_id)
    return json(400, { error: "Missing 'image_id' in form-data" });

  // user identifier for logging
  const user_id = form.get("user_id")?.toString() ?? null;
  
  // Metadata from json
  const metadataRaw = form.get("metadata")?.toString() ?? null;
  const metadata = safeObject(metadataRaw); 

  // Build CompreFace verify EP URL
  const verifyUrl =
    // remove slashy thing and add verification EP with image_ikd
    `${COMPREFACE_BASE_URL.replace(/\/$/, "")}/api/v1/recognition/faces/${encodeURIComponent(image_id)}/verify`;

  // fwd file to CompreFace and attch uploaded image file
  const cfForm = new FormData();
  cfForm.set("file", file, file.name);


  // Send POST request to CompreFace API
  const cfResp = await fetch(verifyUrl, {
    method: "POST",
    headers: { "x-api-key": COMPREFACE_API_KEY_KAYE },
    body: cfForm,
  });

  // Read CompreFace response as text and parse JSON 
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

  // Connect to SupaBase db using secret key
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Insert verification event into your "face_events" table
  const { error: insertError } = await supabase.from("db_face_training").insert({
    user_id,
    subject_id: subject,
    compreface_image_id: image_id,
    bucket,
    storage_path,
    active: true
  })

  // If she fails, still return CompreFace result
  if (insertError) {
    return json(200, {
      ok: cfResp.ok,
      status: cfResp.status,
      compreface: cfJson,
      db_warning: insertError.message,
    });
  }

  return json(200, {
    ok: cfResp.ok,
    status: cfResp.status,
    compreface: cfJson 
  });
});
