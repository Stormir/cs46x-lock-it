import React from "react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

type HelpTechSupProps = {
  onBack: () => void;
};

const HelpTechSup: React.FC<HelpTechSupProps> = ({ onBack }) => {
  const [category, setCategory] = React.useState("Technical Issue");
  const [subject, setSubject] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // UI-only for now. Later this can be connected to Supabase.
    console.log({
      category,
      subject,
      details
    });

    setSubmitted(true);
    setSubject("");
    setDetails("");
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
          <h1 className="text-3xl font-bold">Help & Technical Support</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-700">
            Need help with your account, verification, profile, or app features?
            Submit a support request below.
          </p>
        </div>

        {submitted && (
          <div className="mb-4 border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
            <p className="font-semibold">Request submitted</p>
            <p className="mt-1">
              Thank you. The Lock-It team will review your message as soon as
              possible.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-sm text-[#382543]"
        >
          <SupportSection title="Support Request">
            <label className="block">
              <span className="mb-1 block font-medium">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full border border-neutral-300 bg-white px-3 py-2 outline-none"
              >
                <option>Technical Issue</option>
                <option>Account Help</option>
                <option>Verification Help</option>
                <option>Profile or Match Issue</option>
                <option>Other</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">Subject</span>
              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Briefly describe the issue"
                required
                className="w-full border border-neutral-300 px-3 py-2 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">Details</span>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Tell us what happened and what page or feature you were using."
                required
                rows={5}
                className="w-full resize-none border border-neutral-300 px-3 py-2 outline-none"
              />
            </label>
          </SupportSection>

          <SupportSection title="Before Submitting">
            <ul className="list-disc space-y-2 pl-5">
              <li>Check that your internet connection is working.</li>
              <li>Refresh the page and try again.</li>
              <li>Sign out and sign back in if the issue continues.</li>
              <li>
                Do not include passwords, private messages, or sensitive
                personal information in this form.
              </li>
            </ul>
          </SupportSection>

          <button
            type="submit"
            className="w-full bg-[#382543] px-4 py-3 font-semibold text-white"
          >
            Submit Support Request
          </button>

          <p className="pb-4 text-center text-xs text-neutral-500">
            This form is UI-only for now. Supabase support request saving can be
            added later.
          </p>
        </form>
      </div>

      <BottomNav onHomeClick={onBack} />
    </div>
  );
};

function SupportSection({
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

export default HelpTechSup;