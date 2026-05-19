import React from "react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import TeamPhoto from "../assets/logo/lockit_teamphoto.png";

type ComingSoonPAGESProps = {
  title?: string;
  onBack: () => void;
  setPageHome: () => void;
  setPageSettings: () => void;
  setPageDateTracking: () => void;
  setPageProfile: () => void;
  setPageMatches: () => void;
  setPageMatchMessages: () => void;
  setPageEditPreferences: () => void;
  setPageSafetySupportAndCommunity: () => void;
  setPageChangeChannels: () => void;
};

const ComingSoonMENU: React.FC<ComingSoonPAGESProps> = ({
  title = "Coming Soon",
  onBack,
  setPageHome,
  setPageSettings,
  setPageDateTracking,
  setPageProfile,
  setPageMatches,
  setPageMatchMessages,
  setPageEditPreferences,
  setPageSafetySupportAndCommunity,
  setPageChangeChannels,
}) => {
  return (
    <div className="min-h-screen bg-neutral-100 pb-24">
      {/* Shared top bar */}
      <TopBar
        onHomeClick={setPageHome}
        onSettingsClick={setPageSettings}
        onDateTrackerClick={setPageDateTracking}
        onPreferencesClick={setPageEditPreferences}
        onSafetyClick={setPageSafetySupportAndCommunity}
        onChangeChannelsClick={setPageChangeChannels}
        onSignOutClick={setPageHome}
      />

      {/* Page content */}
      <div className="mx-auto max-w-sm px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[#382543]"
        >
          <span className="text-xl">‹</span>

          <span className="text-lg">
            Return Home
          </span>
        </button>

        {/* Totally unnecessary but I wanted to hehe */}
        <div className="flex min-h-[65vh] flex-col items-center justify-center gap-6">
          <h1 className="text-center text-3xl text-[#382543]">
            {title}
          </h1>

          <img
            src={TeamPhoto}
            alt="Lock It Team"
            className="w-full max-w-xs rounded-2xl shadow-lg"
          />
        </div>
      </div>

      {/* Shared bottom nav */}
      <BottomNav
        onHomeClick={setPageHome}
        onProfileClick={setPageProfile}
        onDateTrackerClick={setPageDateTracking}
        onMatchesClick={setPageMatches}
        onMatchMessagesClick={setPageMatchMessages}
      />
    </div>
  );
};

export default ComingSoonMENU;