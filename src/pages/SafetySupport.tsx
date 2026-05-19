import React from "react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

type SafetySupportProps = {
  onBack: () => void;
};

const SafetySupport: React.FC<SafetySupportProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-neutral-100 pb-24 text-[#382543]">
      <TopBar
        onHomeClick={onBack}
        onSettingsClick={() => {}}
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

        <div className="mb-6">
          <h1 className="text-center text-2xl font-bold">Safety Support</h1>

          <p className="mb-5 text-center text-xs text-neutral-500">
            Lock-It is designed to help users feel safer while connecting,
            matching, and meeting new people. Your safety matters. If you
            feel in danger, threatend, or uncomfortable please speak up --
            we are here for you. Please look into the FAQ below for safety
            support.
          </p>
        </div>

        <div className="space-y-4 text-sm text-[#382543]">
          <section>
            <div className="border border-red-200 bg-red-50 p-4 text-center leading-6 text-red-900">
              <p className="font-semibold">Immediate danger?</p>

              <p className="mt-2 text-center">
                Call 911 or your local emergency number immediately. Lock-It
                support is not a replacement for emergency services.
              </p>
            </div>
          </section>

          <SafetySection title="If You Feel Unsafe">
            <ul className="list-disc space-y-2 pl-5">
              <li>Leave the situation as soon as you safely can.</li>

              <li>
                Call 911 or local emergency services if you are in immediate
                danger.
              </li>

              <li>
                Contact a trusted friend, family member, or emergency contact.
              </li>

              <li>
                Use Lock-It safety features such as date tracking, blocking, or
                reporting when available.
              </li>
            </ul>
          </SafetySection>

          <SafetySection title="Before Meeting Someone">
            <ul className="list-disc space-y-2 pl-5">
              <li>Meet in a public place for the first few dates.</li>

              <li>
                Tell someone you trust where you are going and who you are
                meeting.
              </li>

              <li>
                Use date tracking or location sharing only when you feel
                comfortable.
              </li>

              <li>
                Avoid sharing private information too early, such as your home
                address or financial details.
              </li>
            </ul>
          </SafetySection>

          <SafetySection title="Blocking and Reporting">
            <p>
              If someone makes you uncomfortable, you should be able to block or
              report them through Lock-It. Reports help the team review unsafe
              behavior and protect the community.
            </p>
          </SafetySection>

          <SafetySection title="Verification Reminder">
            <p>
              Lock-It uses verification features to help reduce fake or unsafe
              accounts. Even with verification, always use caution when meeting
              someone new.
            </p>
          </SafetySection>

          <SafetySection title="Need More Help?">
            <p>
              For non-emergency safety concerns, use the Help & Technical
              Support page or contact the Lock-It team. For emergencies, contact
              emergency services immediately.
            </p>
          </SafetySection>

          <div className="pb-4 text-center text-xs text-neutral-500">
            Stay safe and protect your personal information while using
            Lock-It.
          </div>
        </div>
      </div>

      <BottomNav onHomeClick={onBack} />
    </div>
  );
};

function SafetySection({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1 text-sm font-medium text-[#382543]">
        {title}
      </h2>

      <div className="space-y-3 border border-neutral-300 bg-white p-4 leading-6">
        {children}
      </div>
    </section>
  );
}

export default SafetySupport;