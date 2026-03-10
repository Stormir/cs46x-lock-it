import { useState } from "react";
import { runPhotoVerificationFlow } from "../api/verification";
import { supabase } from "../client";

type VerifyTestProps = {
  onBack: () => void;
};

const BRAND = "#382543";

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

const prettyStatus =
    output?.statusText ??
    (output?.error ? "Verification error" : "No verification run yet");


  return (
    <div className="min-h-screen bg-[#f3f3f3] pb-24">
      {/* Top bar */}
      <header
        className="sticky top-0 z-40"
        style={{ backgroundColor: BRAND }}
      >
        <div className="mx-auto flex max-w-sm items-center gap-3 px-4 py-3">
          {/* Decorative menu icon to match mockup */}
          <button
            type="button"
            className="rounded-lg p-1"
            aria-label="Menu"
          >
            <div className="space-y-1.5">
              <div className="h-1 w-7 rounded-full bg-white" />
              <div className="h-1 w-7 rounded-full bg-white" />
              <div className="h-1 w-7 rounded-full bg-white" />
            </div>
          </button>

          {/* Avatar placeholder */}
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white/70 bg-white/20" />

          <div className="flex-1 text-right">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Lock it
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-sm px-4 pt-5">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 text-lg text-[#7b2f8e] hover:underline"
        >
          &lt; Settings
        </button>

        <h2 className="mb-10 text-[1.9rem] font-medium tracking-tight text-[#7b2f8e]">
          Photo Verification
        </h2>

        <div className="space-y-10">
          {/* Upload photo ID */}
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPhotoIdFile(e.target.files?.[0] ?? null)}
            />

            <div className="flex min-h-[110px] items-center justify-center rounded-none bg-[#dddddd] px-6 text-center">
              <div>
                <div className="text-2xl font-medium text-[#8a2ca0]">
                  Upload photo ID +
                </div>
                {photoIdFile && (
                  <p className="mt-2 text-sm text-neutral-700">
                    {photoIdFile.name}
                  </p>
                )}
              </div>
            </div>
          </label>

          {/* Take photo (selfie upload for now) */}
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
            />

            <div className="flex min-h-[110px] items-center justify-center rounded-none bg-[#dddddd] px-6 text-center">
              <div>
                <div className="text-2xl font-medium text-[#8a2ca0]">
                  Take Photo
                </div>
                {selfieFile && (
                  <p className="mt-2 text-sm text-neutral-700">
                    {selfieFile.name}
                  </p>
                )}
              </div>
            </div>
          </label>

          {/* Verify */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleRun}
              disabled={loading}
              className="text-[2rem] font-medium text-[#7b2f8e] underline underline-offset-4 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>

        {/* Result/debug box */}
        <section className="mt-10">
          <div className="rounded-2xl border border-[#d7d7d7] bg-white p-4 shadow-sm">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            </p>

            <p className="mb-3 text-sm text-neutral-700">{prettyStatus}</p>

            <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-[#f6f6f6] p-3 text-xs text-neutral-800">
              {output ? JSON.stringify(output, null, 2) : "No output yet"}
            </pre>
          </div>
        </section>
      </main>

      {/* Bottom nav */}
      {/* Will update with official icons */}
      <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ backgroundColor: BRAND }}>
        <div className="mx-auto flex max-w-sm items-center justify-between px-6 py-3 text-white">
          <NavIcon label="Profile">👤</NavIcon>
          <NavIcon label="Search">🔍</NavIcon>
          <NavIcon label="Likes">♥</NavIcon>
          <NavIcon label="Messages">💬</NavIcon>
          <NavIcon label="Notifications">
            🔔
            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-red-400" />
        </NavIcon>
    </div>
  </nav>
  </div>
  );
}

function NavIcon({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="rounded-lg px-2 py-1 text-3xl text-white hover:bg-white/10"
    >
      {children}
    </button>
  );
}