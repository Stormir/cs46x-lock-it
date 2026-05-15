import React from "react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

type PauseAccountProps = {
  onBack: () => void;
};

const PauseAccount: React.FC<PauseAccountProps> = ({ onBack }) => {
  const [confirmed, setConfirmed] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  const handlePause = () => {
    setPaused(true);
  };

  return (
    <div className="min-h-screen bg-neutral-100 pb-24">
      <TopBar
        onHomeClick={onBack}
        onSettingsClick={onBack}
        onSignOutClick={onBack}
      />

      <div className="mx-auto max-w-sm px-4 py-4 text-[#382543]">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2"
        >
          <span className="text-xl">‹</span>
          <span className="text-lg">Return to Settings</span>
        </button>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Pause Account</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-700">
            Need a break? Pausing your account can temporarily hide your profile
            without permanently deleting your information.
          </p>
        </div>

        {paused && (
          <div className="mb-4 border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
            <p className="font-semibold">Account pause requested</p>
            <p className="mt-1">
              Your account pause request has been recorded for this demo. A
              Supabase update can be added later to save this permanently.
            </p>
          </div>
        )}

        <div className="space-y-4 text-sm text-[#382543]">
          <PauseSection title="What Pausing Means">
            <ul className="list-disc space-y-2 pl-5">
              <li>Your profile may be hidden from new match recommendations.</li>
              <li>Your existing account information is not deleted.</li>
              <li>You may be able to return and reactivate your account later.</li>
              <li>This is different from permanently deactivating your account.</li>
            </ul>
          </PauseSection>

          <PauseSection title="Before You Pause">
            <p>
              Pausing is best if you want a temporary break from Lock-It but may
              want to come back later. If you want to permanently close your
              account, use Deactivate Account instead.
            </p>
          </PauseSection>

          <PauseSection title="Confirm Pause">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={() => setConfirmed((value) => !value)}
                className="mt-1"
              />
              <span>
                I understand this is a temporary account pause and not a full
                account deletion.
              </span>
            </label>
          </PauseSection>

          <button
            type="button"
            disabled={!confirmed}
            onClick={handlePause}
            className={`w-full px-4 py-3 font-semibold text-white ${
              confirmed
                ? "bg-[#382543]"
                : "cursor-not-allowed bg-neutral-400"
            }`}
          >
            Pause My Account
          </button>

          <p className="pb-4 text-center text-xs text-neutral-500">
            This page is UI-only for now. Supabase account status saving can be
            added later.
          </p>
        </div>
      </div>

      <BottomNav onHomeClick={onBack} />
    </div>
  );
};

function PauseSection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1 text-sm font-medium text-[#382543]">{title}</h2>

      <div className="space-y-3 border border-neutral-300 bg-white p-4 leading-6">
        {children}
      </div>
    </section>
  );
}

export default PauseAccount;