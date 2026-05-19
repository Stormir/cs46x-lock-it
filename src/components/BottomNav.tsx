import React from "react";
import FindMatchesIcon from "../assets/logo/lockit_locket_white.svg";
import MatchesIcon from "../assets/logo/matches_heart_white.svg";
import MessagesIcon from "../assets/logo/msg_white.svg";
import DateTrackerIcon from "../assets/logo/loc_track_white.svg";
import ProfileIcon from "../assets/logo/usr_prof_white.svg";

const BRAND = "#382543";

type BottomNavProps = {
  onHomeClick?: () => void;
  onDateTrackerClick?: () => void;
  onProfileClick?: () => void;
  onMatchesClick?: () => void;
  onMatchMessagesClick?: () => void;
};

type NavIconProps = {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
};

function NavIcon({ label, children, onClick }: NavIconProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex items-center justify-center rounded-lg px-3 py-2 text-white hover:bg-white/10"
    >
      {children}
    </button>
  );
}

const BottomNav: React.FC<BottomNavProps> = ({
  onHomeClick,
  onDateTrackerClick,
  onProfileClick,
  onMatchesClick,
  onMatchMessagesClick,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[60]"
      style={{ backgroundColor: BRAND }}
    >
      <div className="mx-auto flex max-w-sm items-center justify-center gap-6 px-2 py-1 text-white">
        <NavIcon label="Find Matches" onClick={onHomeClick}>
          <img
            src={FindMatchesIcon}
            className="h-[45px] w-[45px] object-contain"
          />
        </NavIcon>

        <NavIcon label="Matches" onClick={onMatchesClick}>
          <img
            src={MatchesIcon}
            className="h-11 w-11 object-contain"
          />
        </NavIcon>

        <NavIcon label="Messages" onClick={onMatchMessagesClick}>
          <img
            src={MessagesIcon}
            className="h-[45px] w-[45px] object-contain"
          />
        </NavIcon>

        <NavIcon label="Date Tracker" onClick={onDateTrackerClick}>
          <img
            src={DateTrackerIcon}
            className="h-[45px] w-[45px] object-contain"
          />
        </NavIcon>

        <NavIcon label="Profile" onClick={onProfileClick}>
          <img
            src={ProfileIcon}
            className="h-[45px] w-[45px] object-contain"
          />
        </NavIcon>
      </div>
    </nav>
  );
};

export default BottomNav;