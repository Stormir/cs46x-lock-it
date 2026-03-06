import { useState } from "react";
import { runPhotoVerificationFlow } from "../api/verification";
import { supabase } from "../client";

type VerifyTestProps = {
  onBack: () => void;
};

export default function VerifyTest({ onBack }: VerifyTestProps) {
  // Stores the uploaded Photo ID file for enrollment
  const [photoIdFile, setPhotoIdFile] = useState<File | null>(null);
  // Stores the uploaded selfie (live image) 
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  // stores the result that comes back from pipeline
  const [output, setOutput] = useState<any>(null);
  // Tracks if pipeline is running
  const [loading, setLoading] = useState(false);

  // Runs when user clickes "Run Verification"
  async function handleRun() {
  setLoading(true);
  setOutput(null);

  // reads current auth session from Supabase Auth
  // gets users id for verification pipeline
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  // if no auth user exists, stops early
  if (!userId) {
    setOutput({ error: "No logged-in user." });
    setLoading(false);
    return;
  }
  // selfie file is required for the veririfaiton compariosn step 
  // if missing, stop before calling pipeline
  if (!selfieFile) {
    setOutput({ error: "Please select a selfie file." });
    setLoading(false);
    return;
  }
  // Photo ID file is required for reference image
  if (!photoIdFile) {
    setOutput({ error: "Please select a Photo ID file." });
    setLoading(false);
    return;
  }
   // Calls the main verification pipeline from verification.ts.
  try {
    const res = await runPhotoVerificationFlow({
      userId,
      photoIdFile,
      selfieFile,
    });
    // Saves successful pipline result so it can be displayed
    setOutput(res);
  } catch (e: any) {
    // if any step throws error, display error in output box
    setOutput({ error: e?.message ?? String(e) });
  } finally {
    // stops loading state at the end
    setLoading(false);
  }
}

  return (
    <div style={{ padding: 16, maxWidth: 520 }}>
      {/* Back button lets the user leave this test screen */}
      <button onClick={onBack} style={{ marginBottom: 12 }}>
        ← Back
      </button>
       {/* Title */}
      <h2>Verify Test (Business Logic)</h2>

      {/* File input for the Photo ID/reference image */}
      <div style={{ marginTop: 12 }}>
        <label>Photo ID </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoIdFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* File input for the selfie/live image */}
      <div style={{ marginTop: 12 }}>
        <label>Selfie (required)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
        />
      </div>

   {/* Main run verification pipeline button
      turns to running when pipeline is triggered*/}
      <button onClick={handleRun} disabled={loading} style={{ marginTop: 12 }}>
        {loading ? "Running..." : "Run Verification"}
      </button>
  
      {/* Simple debug output box. Shows pipeline response or error as formatted JSON. */}
      <pre style={{ marginTop: 12, background: "#f6f6f6", padding: 12 }}>
        {output ? JSON.stringify(output, null, 2) : "No output yet"}
      </pre>
    </div>
  );
}