import React from "react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

type DeactivateAccountProps = {
  onBack: () => void;
};

const DeactivateAccount: React.FC<DeactivateAccountProps> = ({ onBack }) => {
  const [confirmed, setConfirmed] = React.useState(false);
  const [deactivated, setDeactivated] = React.useState(false);

  const handleDeactivate = () => {
    setDeactivated(true);
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
          <h1 className="text-3xl font-bold">Deactivate Account</h1>

          <p className="mt-3 text-sm leading-6 text-neutral-700">
            Deactivation is meant for users who no longer want their Lock-It
            account active. This demo does not permanently delete account data.
          </p>
        </div>

        {deactivated && (
          <div className="mb-4 border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
            <p className="font-semibold">Deactivation request submitted</p>
            <p className="mt-1">
              Your request has been recorded for this demo. A Supabase update
              can be added later to save this status permanently.
            </p>
          </div>
        )}

        <div className="space-y-4 text-sm text-[#382543]">
          <DeactivateSection title="Before You Deactivate">
            <ul className="list-disc space-y-2 pl-5">
              <li>Your profile may no longer appear to other users.</li>
              <li>Your account information is not deleted in this demo.</li>
              <li>This is different from temporarily pausing your account.</li>
              <li>
                Full account deletion should only be added later with careful
                Supabase/Auth handling.
              </li>
            </ul>
          </DeactivateSection>

          <DeactivateSection title="Recommended First Step">
            <p>
              If you only need a short break, use Pause Account instead.
              Deactivation should be used when you want your account to become
              inactive.
            </p>
          </DeactivateSection>

          <DeactivateSection title="Confirm Deactivation">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={() => setConfirmed((value) => !value)}
                className="mt-1"
              />
              <span>
                I understand this is a deactivation request and not a permanent
                account deletion.
              </span>
            </label>
          </DeactivateSection>

          <button
            type="button"
            disabled={!confirmed}
            onClick={handleDeactivate}
            className={`w-full px-4 py-3 font-semibold text-white ${
              confirmed
                ? "bg-[#382543]"
                : "cursor-not-allowed bg-neutral-400"
            }`}
          >
            Submit Deactivation Request
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

function DeactivateSection({
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

export default DeactivateAccount;