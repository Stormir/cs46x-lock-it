import React from "react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import { supabase } from "../client";

type DeactivateAccountProps = {
  onBack: () => void;
};

const DeactivateAccount: React.FC<DeactivateAccountProps> = ({ onBack }) => {
  const [confirmed, setConfirmed] = React.useState(false);
  const [deactivated, setDeactivated] = React.useState(false);
  const [reactivated, setReactivated] = React.useState(false);

  const handleDeactivate = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();
  
    if (!user) {
      console.error("No logged-in user found.");
      return;
    }
  
    const { error } = await supabase
      .from("accounts")
      .update({
        account_status: "deactivated",
        deactivated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);
  
    if (error) {
      console.error("Error deactivating account:", error);
      return;
    }
    setDeactivated(true);
    setReactivated(false);
  };

  const handleReactivate = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser();
  
    if (!user) {
      console.error("No logged-in user found.");
      return;
    }
  
    const { error } = await supabase
      .from("accounts")
      .update({
        account_status: "active"
      })
      .eq("user_id", user.id);
  
    if (error) {
      console.error("Error reactivating account:", error);
      return;
    }
  
    setDeactivated(false);
    setConfirmed(false);
    setReactivated(true);
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
            account active. This action updates your account status but does 
            not permanently delete your account data.
          </p>
        </div>

        {deactivated && (
          <div className="mb-4 border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
            <p className="font-semibold">Account Deactivate</p>
            <p className="mt-1">
              Your account status has been updated to deactivated. Your account data has
              not been permanently deleted.
            </p>
          </div>
        )}
        {reactivated && (
          <div className="mb-4 border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
            <p className="font-semibold">Account reactivated</p>

            <p className="mt-1">
              Your account status has been updated to active. Your profile may now
              become visible again based on your app settings.
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
                This will only deactivate your account status and will not permanently delete
                your account from Supabase Auth.
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
          {deactivated && (
            <button
              type="button"
              onClick={handleReactivate}
              className="w-full border border-[#382543] bg-white px-4 py-3 font-semibold text-[#382543]"
            >
              Reactivate My Account
            </button>
          )}

          <p className="pb-4 text-center text-xs text-neutral-500">
            Your account status is saved securely through Supabase.
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