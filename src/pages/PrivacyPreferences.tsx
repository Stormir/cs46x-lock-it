import React from "react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

type PrivacyPreferencesProps = {
  onBack: () => void;
};

const PrivacyPreferences: React.FC<PrivacyPreferencesProps> = ({ onBack }) => {
  const [showProfile, setShowProfile] = React.useState(true);
  const [matchRecommendations, setMatchRecommendations] = React.useState(true);
  const [locationSharing, setLocationSharing] = React.useState(false);
  const [safetyUpdates, setSafetyUpdates] = React.useState(true);

  return (
    <div className="min-h-screen bg-neutral-100 pb-24 text-[#382543]">
      <TopBar
        onHomeClick={onBack}
        onSettingsClick={() => {}}
        onSignOutClick={onBack}
      />

      <main className="mx-auto max-w-sm px-3 py-3">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm font-medium text-[#382543]"
        >
          ‹ Return to Settings
        </button>

        <h1 className="mb-2 text-2xl font-bold">Privacy Preferences</h1>

        <p className="mb-4 text-sm leading-relaxed">
          Control how your profile, recommendations, and safety settings are
          used inside Lock-It.
        </p>

        <PreferenceSection title="Profile Visibility">
          <ToggleRow
            label="Show my profile"
            description="Allow your profile to appear in match recommendations."
            checked={showProfile}
            onChange={() => setShowProfile((v) => !v)}
          />

          <ToggleRow
            label="Use match recommendations"
            description="Use your profile details and preferences to suggest better matches."
            checked={matchRecommendations}
            onChange={() => setMatchRecommendations((v) => !v)}
          />
        </PreferenceSection>

        <PreferenceSection title="Safety Features">
          <ToggleRow
            label="Location sharing"
            description="Allow location sharing only when date tracking is turned on."
            checked={locationSharing}
            onChange={() => setLocationSharing((v) => !v)}
          />

          <ToggleRow
            label="Safety updates"
            description="Receive helpful safety reminders and app updates."
            checked={safetyUpdates}
            onChange={() => setSafetyUpdates((v) => !v)}
          />
        </PreferenceSection>

        <div className="mt-4 border border-neutral-300 bg-white p-4 text-sm leading-relaxed">
          <p className="font-semibold">Note</p>
          <p className="mt-2">
            These preferences are currently saved only on this page for the demo.
            Database saving can be added later through Supabase.
          </p>
        </div>
      </main>

      <BottomNav onHomeClick={onBack} />
    </div>
  );
};

function PreferenceSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4">
      <h2 className="mb-1 text-sm font-semibold">{title}</h2>
      <div className="border border-neutral-300 bg-white">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-3 py-3 last:border-b-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        aria-label={label}
        className={`relative h-5 w-10 shrink-0 rounded-full transition ${
          checked ? "bg-black" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default PrivacyPreferences;