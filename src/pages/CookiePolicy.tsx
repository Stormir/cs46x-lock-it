import React from "react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

type CookiePolicyProps = {
  onBack: () => void;
};

const CookiePolicy: React.FC<CookiePolicyProps> = ({ onBack }) => {
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
          <h1 className="text-3xl font-bold">Lock-It Cookie Policy</h1>
          <p className="mt-2 text-sm text-neutral-600">
            As of: Mayy 2026
          </p>
        </div>

        <div className="space-y-4 text-sm text-[#382543]">
          <PolicySection title="Introduction">
            <p>
              Welcome to Lock-It! Our Cookie Policy explains how Lock-It uses
              cookies and similar technologies to improve user experience,
              enhance security, and support core app functionality.
            </p>

            <p>
              By using Lock-It, you agree to the use of cookies and related
              technologies as described in this policy.
            </p>

            <p>
              For the sake of OSU's Senior Capstone, we are transparent to AI
              use and will note that the content of this page was built using
              ChatGPT while backend/frontend coding is student built.
              Until further development is made, this content will remain.
            </p>
          </PolicySection>

          <PolicySection title="What Are Cookies?">
            <p>
              Cookies are small text files stored on your device when you visit
              a website or use an application.
            </p>

            <p>
              They help apps remember information about your session,
              preferences, and activity to provide a smoother and safer
              experience.
            </p>
          </PolicySection>

          <PolicySection title="Types of Cookies We Use">
            <PolicySubTitle>Essential Cookies</PolicySubTitle>
            <ul className="list-disc space-y-1 pl-5">
              <li>User authentication and login sessions</li>
              <li>Account security and fraud prevention</li>
              <li>Remembering user settings</li>
              <li>Maintaining active sessions</li>
            </ul>

            <PolicySubTitle>Performance & Analytics Cookies</PolicySubTitle>
            <ul className="list-disc space-y-1 pl-5">
              <li>Monitoring crashes and technical issues</li>
              <li>Understanding feature usage</li>
              <li>Measuring app performance</li>
              <li>Improving functionality and reliability</li>
            </ul>

            <PolicySubTitle>Functional Cookies</PolicySubTitle>
            <ul className="list-disc space-y-1 pl-5">
              <li>Theme preferences</li>
              <li>Notification settings</li>
              <li>Saved app preferences</li>
              <li>Location-sharing preferences</li>
            </ul>
          </PolicySection>

          <PolicySection title="Information Collected Through Cookies">
            <ul className="list-disc space-y-1 pl-5">
              <li>Device and browser information</li>
              <li>IP address</li>
              <li>Session identifiers</li>
              <li>Usage and interaction data</li>
              <li>App preferences and settings</li>
              <li>Security and authentication logs</li>
            </ul>
          </PolicySection>

          <PolicySection title="Location & Safety Features">
            <ul className="list-disc space-y-1 pl-5">
              <li>Location sharing is optional and user-controlled</li>
              <li>Users can enable or disable location sharing anytime</li>
              <li>
                Location data is used only for app functionality and safety
                services
              </li>
              <li>Lock-It does not sell location data to advertisers</li>
            </ul>

            <p>
              Safety-related activity logs may be temporarily retained to help
              detect abuse, fraud, or harmful behavior.
            </p>
          </PolicySection>

          <PolicySection title="Third-Party Services">
            <ul className="list-disc space-y-1 pl-5">
              <li>Authentication</li>
              <li>Cloud storage</li>
              <li>Analytics</li>
              <li>Notifications</li>
              <li>Payment processing</li>
            </ul>

            <p>
              Third parties may also use cookies or similar technologies as part
              of their services.
            </p>
          </PolicySection>

          <PolicySection title="Your Choices">
            <p>
              Users may manage or disable cookies through their browser or
              device settings.
            </p>

            <p>
              Disabling certain cookies may affect app functionality or limit
              access to some features.
            </p>
          </PolicySection>

          <PolicySection title="Sensitive Information">
            <p>
              Lock-It does not store passwords or private messages directly
              inside cookies.
            </p>

            <p>
              Sensitive information is protected using industry-standard
              security measures and encryption practices.
            </p>
          </PolicySection>

          <PolicySection title="Cookie Retention">
            <p>
              Some cookies are temporary and expire when you close the app or
              browser.
            </p>

            <p>
              Other cookies may remain longer to remember preferences and
              settings.
            </p>
          </PolicySection>

          <PolicySection title="Updates to This Policy">
            <p>
              Lock-It may update this Cookie Policy periodically to reflect
              changes in technology, legal requirements, or app functionality.
            </p>
          </PolicySection>

          <PolicySection title="Contact Us">
            <p>Questions about this Cookie Policy or privacy practices?</p>

            <p className="font-medium">SomeFutureEmail@oregonstate.edu</p>
          </PolicySection>

          <div className="pb-4 text-center text-xs text-neutral-500">
            © 2026 Lock-It. All Rights Reserved.
          </div>
        </div>
      </div>

      <BottomNav onHomeClick={onBack} />
    </div>
  );
};

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1 text-sm font-medium text-[#382543]">{title}</h2>

      <div className="space-y-3 border border-neutral-300 bg-white p-4 leading-5">
        {children}
      </div>
    </section>
  );
}

function PolicySubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 font-semibold text-[#382543]">{children}</h3>;
}

export default CookiePolicy;