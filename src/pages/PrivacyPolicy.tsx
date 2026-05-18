import React from "react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

type PrivacyPolicyProps = {
  onBack: () => void;
};

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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

        <h1 className="text-center text-2xl font-bold">
          Lock-It Privacy Policy
        </h1>

        <p className="mb-5 text-center text-xs text-neutral-500">
          As of May 2026
        </p>

        <PolicySection title="Introduction">
          <p>
            Welcome to Lock-It. This Privacy Policy explains how Lock-It
            collects, uses, and protects information shared while using the app.
          </p>
          <p>
            Lock-It is designed with safety, privacy, and account protection in
            mind. Some features may use profile details, verification
            information, preferences, and safety settings to support the app
            experience.
          </p>
          <p>
            Since this is an OSU Senior Capstone project, this page is for
            demonstration purposes and may be updated as development continues.
          </p>
        </PolicySection>

        <PolicySection title="Information We May Collect">
          <p>
            Lock-It may collect account information such as your name, email,
            phone number, profile details, preferences, and verification status.
          </p>
          <p>
            Some safety features may also use location-related information,
            trusted contact settings, or date tracking details when enabled by
            the user.
          </p>
        </PolicySection>

        <PolicySection title="How We Use Information">
          <p>
            Information may be used to help create accounts, manage profiles,
            support matching features, improve user safety, and provide account
            verification.
          </p>
          <p>
            We may also use submitted support information to respond to user
            questions, technical issues, or safety concerns.
          </p>
        </PolicySection>

        <PolicySection title="Safety and Verification">
          <p>
            Lock-It may use verification tools to help confirm user identity and
            reduce unsafe or fake accounts. Verification information is used only
            for app safety and account protection features.
          </p>
        </PolicySection>

        <PolicySection title="Location and Date Tracking">
          <p>
            Location-based safety features are intended to help users share date
            status or location details with trusted contacts when they choose to
            enable those features.
          </p>
          <p>
            Users should only enable location sharing when they feel comfortable
            doing so.
          </p>
        </PolicySection>

        <PolicySection title="User Control">
          <p>
            Users may update profile details, adjust privacy preferences, pause
            account visibility, or request account deactivation depending on the
            features available in the app.
          </p>
        </PolicySection>

        <PolicySection title="Contact">
          <p>
            For privacy, safety, or technical questions, users may use the Help
            & Technical Support or Safety Support pages inside Lock-It.
          </p>
        </PolicySection>
      </main>

      <BottomNav onHomeClick={onBack} />
    </div>
  );
};

function PolicySection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4">
      <h2 className="mb-1 text-sm font-semibold">{title}</h2>
      <div className="space-y-3 border border-neutral-300 bg-white p-4 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default PrivacyPolicy;