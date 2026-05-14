import React from "react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import TeamPhoto from "../assets/logo/lockit_teamphoto.png";

type ComingSoonPAGESProps = {
  title?: string;
  onBack: () => void;
};

const ComingSoonPAGES: React.FC<ComingSoonPAGESProps> = ({
  title = "Coming Soon",
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-neutral-100 pb-24">
      {/* Shared top bar */}
      <TopBar
        onHomeClick={onBack}
        onSettingsClick={() => {}}
        onSignOutClick={onBack}
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
            Return to Settings
          </span>
        </button>

        {/* Totally unecessary but I wanted to hehe */}
        <div className="flex min-h-[65vh] flex-col items-center justify-center gap-6">
            <h1 className="text-3xl text-[#382543]">
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
      <BottomNav onHomeClick={onBack} />
    </div>
  );
};

export default ComingSoonPAGES;