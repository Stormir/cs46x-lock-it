import React from "react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";
import TipsIcon from "../assets/logo/tips_light_purple.svg";
import GoBackIcon from "../assets/logo/go_back_button.svg";
import SkipIcon from "../assets/logo/skip_button.svg";
import LikeIcon from "../assets/logo/like_buttn.svg";
import SuperLikeIcon from "../assets/logo/super_like_button.svg";


// Mock home page
// Will populate with real data
interface HomeProps {
  setPageLanding: () => void;
  setPageSettings: () => void;
  setPageProfile: () => void;
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

const Home: React.FC<HomeProps> = ({
  setPageLanding,
  setPageProfile,
  setPageSettings
}) => {

// Moved action to top bar.tsx  
/* const handleClickSignOut = async () => {
  await signOut();
  setPageLanding();
};
*/

  return (
    <div className="min-h-screen bg-neutral-100 pb-20 flex flex-col">
      {/* Top bar */}
      <TopBar
        onHomeClick={() => {}}
        onSettingsClick={setPageSettings}
        onSignOutClick={setPageLanding}
      />
      
      {/* ^^^ Main */}

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
            <img
              src={TipsIcon}
              className="h-7 w-7 object-contain"
              alt="Tips"
            />
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
        <section className="mt-5 flex items-center justify-center gap-11">
          <CircleButton label="Go Back" title="Go Back">
            <img src={GoBackIcon} className="h-15 w-15 object-contain drop-shadow-md" />
          </CircleButton>

          <CircleButton label="Skip" title="Skip">
            <img src={SkipIcon} className="h-15 w-15 object-contain drop-shadow-md" />
          </CircleButton>

          <CircleButton label="Like" title="Like">
            <img src={LikeIcon} className="h-15 w-15 object-contain drop-shadow-md" />
          </CircleButton>

          <CircleButton label="Super Like" title="Super Like">
            <img src={SuperLikeIcon} className="h-16 w-16 object-contain drop-shadow-md" />
          </CircleButton>
        </section>
      </main>

      {/* Bottom nav */}
      <BottomNav
        onHomeClick={() => {}} 
        onProfileClick={setPageProfile}
      />
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

function CircleButton({ children, label, title }: {
  children: React.ReactNode;
  label: string;
  title: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      className="flex items-center justify-center hover:scale-105 transition"
    >
      {children}
    </button>
  );
}

export default Home;

