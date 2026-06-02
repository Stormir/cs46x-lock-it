import { useState } from "react";
import { runPhotoVerificationFlow } from "../api/verification";
import { supabase } from "../client";
import CameraCapture from "../components/CameraCapture";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

type VerifyTestProps = {
  onBack: () => void;
  onHomeClick: () => void;
  onSettingsClick: () => void;
  onSignOutClick: () => void;
  onDateTrackerClick: () => void;
  onProfileClick: () => void;
  onMatchesClick: () => void;
  onMatchMessagesClick: () => void;
  onPreferencesClick: () => void;
  onSafetyClick: () => void;
  onChangeChannelsClick: () => void;
  
};

export default function VerifyTest({
  onBack,
  onHomeClick,
  onSettingsClick,
  onSignOutClick,
  onDateTrackerClick,
  onProfileClick,
  onMatchesClick,
  onMatchMessagesClick,
  onPreferencesClick,
  onSafetyClick,
  onChangeChannelsClick,
}: VerifyTestProps) {
  const [photoIdFile, setPhotoIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    setOutput(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      setOutput({ error: "No logged-in user." });
      setLoading(false);
      return;
    }

    if (!photoIdFile) {
      setOutput({ error: "Please select a Photo ID file." });
      setLoading(false);
      return;
    }

    if (!selfieFile) {
      setOutput({ error: "Please take a selfie." });
      setLoading(false);
      return;
    }

    try {
      const res = await runPhotoVerificationFlow({
        userId,
        photoIdFile,
        selfieFile,
      });

      setOutput(res);
    } catch (e: any) {
      setOutput({ error: e?.message ?? String(e) });
    } finally {
      setLoading(false);
    }
  }

  const prettyStatus =
    output?.statusText ??
    (output?.error ? "Verification error" : "No verification run yet");

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <TopBar
        onHomeClick={onHomeClick}
        onSettingsClick={onSettingsClick}
        onSignOutClick={onSignOutClick}
        onDateTrackerClick={onDateTrackerClick}
        onPreferencesClick={onPreferencesClick}
        onSafetyClick={onSafetyClick}
        onChangeChannelsClick={onChangeChannelsClick}
      />

      <main className="mx-auto max-w-sm px-5 pb-28 pt-5">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm font-medium text-[#382543] hover:underline"
        >
          &lt; Settings
        </button>

        <section className="rounded-2xl bg-white px-5 py-6 text-[#382543]">
          <h1 className="mb-2 text-center text-2xl font-bold">
            Photo Verification
          </h1>

          <p className="mb-6 text-center text-sm text-[#382543]/70">
            Upload your photo ID and take a selfie to verify your profile.
          </p>

          <div className="space-y-5">
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPhotoIdFile(e.target.files?.[0] ?? null)}
              />

              <div className="flex min-h-[110px] items-center justify-center rounded-xl bg-[#eeeeee] px-5 text-center">
                <div>
                  <p className="text-xl font-semibold text-[#7b2f8e]">
                    Upload photo ID +
                  </p>

                  {photoIdFile && (
                    <p className="mt-2 text-sm text-[#382543]/70">
                      {photoIdFile.name}
                    </p>
                  )}
                </div>
              </div>
            </label>

            <div className="rounded-xl bg-[#eeeeee] px-5 py-5 text-center">
              <CameraCapture
                hasPhoto={!!selfiePreview}
                onRetake={() => {
                  if (selfiePreview) {
                    URL.revokeObjectURL(selfiePreview);
                  }

                  setSelfieFile(null);
                  setSelfiePreview(null);
                }}
                onCapture={(file, previewUrl) => {
                  if (selfiePreview) {
                    URL.revokeObjectURL(selfiePreview);
                  }

                  setSelfieFile(file);
                  setSelfiePreview(previewUrl);
                }}
              />

              {selfiePreview && (
                <img
                  src={selfiePreview}
                  alt="Selfie preview"
                  className="mt-4 w-full rounded-2xl border border-[#382543]/10 object-cover"
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleRun}
              disabled={loading}
              className="w-full rounded-full bg-[#382543] py-3 text-lg font-semibold text-white shadow-md disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </section>

        <section className="mt-5 rounded-3xl bg-white/95 p-4 text-[#382543] shadow-md">
          <p className="mb-2 text-sm font-semibold">{prettyStatus}</p>

          <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#eeeeee] p-3 text-xs text-[#382543]">
            {output ? JSON.stringify(output, null, 2) : "No output yet"}
          </pre>
        </section>
      </main>

      <BottomNav
        onHomeClick={onHomeClick}
        onProfileClick={onProfileClick}
        onDateTrackerClick={onDateTrackerClick}
        onMatchesClick={onMatchesClick}
        onMatchMessagesClick={onMatchMessagesClick}
      />
    </div>
  );
}