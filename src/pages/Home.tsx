import React from "react";
import { signOut } from "../api/auth";

// Mock home page
// Will populate with real data
interface HomeProps {
  setPageLanding: () => void;
}

type Match = {
  name: string;
  pronouns?: string;
  age: number;
  city: string;
  state: string;
  details: {
    interestedIn: string;
    height: string;
    race: string;
    work: string;
    education: string;
    drinks: string;
  };
  aboutMe: string;
};

// Brand coloring
const BRAND = "#382543";

const mockMatch: Match = {
  name: "Match Name",
  pronouns: "(Pronouns)",
  age: 26,
  city: "Portland",
  state: "OR",
  details: {
    interestedIn: "Interested in Men",
    height: "5ft 5in",
    race: "Asian/Pacific Islander",
    work: "Works as Medical Assistant",
    education: "Studied at Oregon State",
    drinks: "Drinks Occasionally"
  },
  aboutMe: "Add description here :)"
};

const Home: React.FC<HomeProps> = ({ setPageLanding }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleClickSignOut = async () => {
    await signOut();
    setPageLanding();
  };

  return (
    <div className="min-h-screen bg-neutral-100 pb-20 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40" style={{ backgroundColor: BRAND }}>
        <div className="mx-auto flex max-w-sm items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Open menu"
          >
            <div className="space-y-1">
              <div className="h-0.5 w-6 bg-white" />
              <div className="h-0.5 w-6 bg-white" />
              <div className="h-0.5 w-6 bg-white" />
            </div>
          </button>

          <div className="h-10 w-10 overflow-hidden rounded-full bg-white/20 ring-2 ring-white/30">
            <div className="h-full w-full bg-white/10" />
          </div>

          <div className="flex-1 text-center">
            <div className="text-sm font-semibold tracking-wide text-white">
              Lock It
            </div>
          </div>

          <div className="w-10" />
        </div>

        {/* dropdown menu */}
        {menuOpen && (
          <div className="mx-auto max-w-sm px-4 pb-3">
            <div className="rounded-2xl bg-white/10 p-2 ring-1 ring-white/15">
              <button
                type="button"
                onClick={handleClickSignOut}
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main page */}
      <main className="mx-auto max-w-sm px-4 py-4">
        {/* Name, age, city */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-neutral-900">
              {mockMatch.name}{" "}
              <span className="font-normal text-neutral-600">
                {mockMatch.pronouns}
              </span>
            </div>
            <div className="text-sm text-neutral-700">
              {mockMatch.age} | {mockMatch.city}, {mockMatch.state}
            </div>
          </div>

          <button
            type="button"
            className="rounded-full p-2 hover:bg-neutral-200"
            aria-label="Tips"
            title="Tips"
          >
            💡
          </button>
        </div>

        {/* Photo area */}
        <section className="rounded-2xl border border-neutral-300 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-44 rounded-xl bg-neutral-200" />
            <div className="h-44 rounded-xl bg-neutral-200" />
          </div>
        </section>

        {/* Details */}
        <section className="mt-4 rounded-2xl border border-neutral-300 bg-white shadow-sm">
          <div
            className="rounded-t-2xl px-3 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: BRAND }}
          >
            Details
          </div>

          {/* Filler icons for now, will update with official icons */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-3 text-sm">
            <DetailItem icon="♂" text={mockMatch.details.interestedIn} />
            <DetailItem icon="💼" text={mockMatch.details.work} />
            <DetailItem icon="📏" text={mockMatch.details.height} />
            <DetailItem icon="🎓" text={mockMatch.details.education} />
            <DetailItem icon="👤" text={mockMatch.details.race} />
            <DetailItem icon="🍸" text={mockMatch.details.drinks} />
          </div>
        </section>

        {/* About me */}
        <section className="mt-4 rounded-2xl border border-neutral-300 bg-white shadow-sm">
          <div
            className="rounded-t-2xl px-3 py-2 text-center text-xs font-semibold text-white"
            style={{ backgroundColor: BRAND }}
          >
            About me
          </div>
          <div className="p-3 text-sm text-neutral-800">{mockMatch.aboutMe}</div>
        </section>

        {/* Action buttons*/}
        {/* Will update with official icon buttons */}
        <section className="mt-5 flex items-center justify-center gap-8">
          <CircleButton label="Nope" title="Nope">
            ✕
          </CircleButton>
          <CircleButton label="Like" title="Like">
            ♥
          </CircleButton>
          <CircleButton label="Super like" title="Super like">
            🔥
          </CircleButton>
        </section>
      </main>

      {/* Bottom nav */}
      {/* Will update with official icons */}
      <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ backgroundColor: BRAND }}>
        <div className="mx-auto flex max-w-sm items-center justify-between px-6 py-3 text-white">
          <NavIcon label="Profile">👤</NavIcon>
          <NavIcon label="Search">🔍</NavIcon>
          <NavIcon label="Likes">♥</NavIcon>
          <NavIcon label="Messages">💬</NavIcon>
          <NavIcon label="Notifications">
            🔔
            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-red-400" />
          </NavIcon>
        </div>
      </nav>
    </div>
  );
};

function DetailItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-neutral-800">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs">
        {icon}
      </span>
      <span className="leading-tight">{text}</span>
    </div>
  );
}

function CircleButton({
  children,
  label,
  title
}: {
  children: React.ReactNode;
  label: string;
  title: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-md ring-1 ring-neutral-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function NavIcon({
  children,
  label
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="rounded-lg px-2 py-1 hover:bg-white/10"
    >
      <span className="text-xl">{children}</span>
    </button>
  );
}

export default Home;
