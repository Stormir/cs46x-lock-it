import React from "react";
import { supabase } from "../client";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

type SettingsProps = {
  onBack: () => void;
  onVerifyTest: () => void;
  onCookiePolicy: () => void;
  onPrivacyPolicy: () => void;
  onHelpTechSup: () => void;
  onSafetySupport: () => void;
  onPauseAccount: () => void;
  onDeactivateAccount: () => void;
  onDateTracking: () => void;
};

const Settings: React.FC<SettingsProps> = ({
  onBack,
  onVerifyTest,
  onCookiePolicy,
  onPrivacyPolicy,
  onHelpTechSup,
  onSafetySupport,
  onPauseAccount,
  onDeactivateAccount,
  onDateTracking,
}) => {
  const [email, setEmail] = React.useState(true);
  const [push, setPush] = React.useState(true);
  const [text, setText] = React.useState(true);

  const [profile, setProfile] = React.useState({
    first_name: "",
    last_name: "",
    preferred_name: "",
    pronouns: "",
    gender_identity: ""
  });

  React.useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("accounts")
        .select(
          "first_name, last_name, preferred_name, pronouns, gender_identity"
        )
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        return;
      }

      if (data) setProfile(data);
    };

    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 pb-24">
      <TopBar
        onHomeClick={onBack}
        onSettingsClick={() => {}}
        onDateTrackerClick={onDateTracking}
        onSignOutClick={onBack}
      />

      <div className="mx-auto max-w-sm px-3 pt-3">
        <h1 className="text-2xl font-semibold text-[#382543]">Settings</h1>
      </div>

      {/* Account Settings*/}
      <main className="mx-auto max-w-sm px-3 py-3 text-sm text-[#382543]">
        <Section title="Account Settings">
            
          <Row
            label="First Name"
            value={profile.first_name || "Not set"}
            muted
          />
          <Row label="Last Name" value={profile.last_name || "Not set"} muted />
          <Row
            label="Display Name"
            value={profile.preferred_name || "Not set"}
          />

          <Row
            label="Gender Identity"
            value={profile.gender_identity || "Not set"}
            arrow
          />
          {/* Update with Colmumn Name */}
          <Row
            label="Email"
            value="AddEmaiColmnHere@email.com"
          />
           {/* Update with Colmumn Name */}
          <Row label="Phone Number" value="(503) 945-6154" />
          <Row label="Pronouns" value={profile.pronouns || "Not set"} arrow />
          <Row label="Location" value="Portland, OR" arrow />
        </Section>

      {/* Account Verification*/}
        <Section title="Account Verification">
          <Row label="Email" value="VERIFIED" muted />
          <Row label="Phone" value="VERIFIED" muted />
          <ActionRow
            label="Photo ID"
            value="NEEDS VERIFICATION"
            onClick={onVerifyTest}
          />
        </Section>

        {/* Notificaiton s */}
        <Section title="Notifications">
          <ToggleRow
            label="Email"
            checked={email}
            onChange={() => setEmail((v) => !v)}
          />
          <ToggleRow
            label="Push Notifications"
            checked={push}
            onChange={() => setPush((v) => !v)}
          />
          <ToggleRow
            label="Text"
            checked={text}
            onChange={() => setText((v) => !v)}
          />
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <ActionRow label="Cookie Policy" onClick={onCookiePolicy} />
          <ActionRow label="Privacy Policy" onClick={onPrivacyPolicy} />
          <ActionRow label="Privacy Preferences" />
        </Section>

        {/* Contact Us */}
        <Section title="Contact Us">
          <ActionRow label="Help & Technical Support" onClick={onHelpTechSup} />
          <ActionRow label="Safety Support" onClick={onSafetySupport} />
        </Section>

        {/* Take a break */}
        <Section title="Take a Break">
          <ActionRow label="Pause Account" onClick={onPauseAccount} />
          <ActionRow label="Deactivate Account" onClick={onDeactivateAccount} />
        </Section>
      </main>

      <BottomNav
        onHomeClick={onBack}
        onDateTrackerClick={onDateTracking}
      />
    </div>
  );
};

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-3">
      <h2 className="mb-1 text-sm font-medium">{title}</h2>
      <div className="border border-neutral-300 bg-white">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  arrow,
  muted
}: {
  label: string;
  value: string;
  arrow?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span>{label}</span>
      <span className={muted ? "text-neutral-300" : ""}>
        {value}
        {arrow && <span className="ml-1 text-lg">›</span>}
      </span>
    </div>
  );
}

function ActionRow({
  label,
  value,
  onClick
}: {
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-3 py-2 text-left focus:outline-none"
    >
      <span>{label}</span>
      <div className="flex items-center gap-1">
        {value && <span>{value}</span>}
        <span className="text-xl">›</span>
      </div>
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span>{label}</span>
      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        aria-label={`${label} notifications`}
        className={`relative h-5 w-10 rounded-full transition ${
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

export default Settings;
