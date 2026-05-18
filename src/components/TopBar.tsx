import React from "react";
import { signOut } from "../api/auth";
// icons
import HomeLogo from "../assets/logo/logo_pink_home.svg";
import SettingsIcon from "../assets/logo/settings_white.svg";
import SignOutIcon from "../assets/logo/signout_white.svg";
import ChangePrefIcon from "../assets/logo/changePref_white.svg";
import SafetyResourcesIcon from "../assets/logo/safetySources_white.svg";
import ChangeChannelsIcon from "../assets/logo/changeChan_white.svg";
import TrackDatesIcon from "../assets/logo/loc_track_white.svg";
import FindMatchesIcon from "../assets/logo/lockit_locket_white.svg";


const BRAND = "#382543";

type TopBarProps = {
  onHomeClick: () => void;
  onSettingsClick?: () => void;
  onDateTrackerClick?: () => void;
  onSignOutClick?: () => void;
  ownPrimaryPhotoUrl?: string | null;
};

const TopBar: React.FC<TopBarProps> = ({
  onHomeClick,
  onSettingsClick,
  onDateTrackerClick,
  ownPrimaryPhotoUrl,
  onSignOutClick
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    setMenuOpen(false);

    await signOut();

    onSignOutClick?.();
  };
  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: BRAND }}>
      <div className="-mx-1 flex max-w-sm items-center gap-3 px-4 py-3">
        {/* Hamburger menu */}
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Open menu"
        >
          <div className="space-y-1">
            <div className="h-1 w-8 bg-white" />
            <div className="h-1 w-8 bg-white" />
            <div className="h-1 w-8 bg-white" />
          </div>
        </button>

      {/* Profile circle */}
      <button
        type="button"
        onClick={onHomeClick}
        className="h-12 w-12 overflow-hidden rounded-full"
        aria-label="Profile"
      >
        {ownPrimaryPhotoUrl ? (
          <img
            src={ownPrimaryPhotoUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-white/10" />
        )}
      </button>

        {/* Logo */}
        <div className="flex-1 text-right">
          <img
            src={HomeLogo}
            alt="Lock It"
            className="ml-auto mr-[-30px] h-9 object-contain"
          />
        </div>
      </div>

      {/* Page dimmer */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40"
        />
      )}

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-50">
          <div
            className="mx-auto max-w-sm rounded-b-2xl p-2"
            style={{ backgroundColor: BRAND }}
          >
            {/* Home */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onHomeClick();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
            >
              <img
                src={FindMatchesIcon}
                alt="Home"
                className="h-5 w-5 object-contain"
              />

              <span>Home</span>
            </button>

            {/* Preferences */}
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
            >
              <img
                src={ChangePrefIcon}
                alt="Preferences"
                className="h-5 w-5 object-contain"
              />

              <span>Edit Match Preferences</span>
            </button>

            {/* Date Tracker */}
            {/* Date Tracker */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onDateTrackerClick?.();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
            >
              <img
                src={TrackDatesIcon}
                alt="Date Tracker"
                className="h-5 w-5 object-contain"
              />

              <span>Date Tracker</span>
            </button>

            {/* Safety */}
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
            >
              <img
                src={SafetyResourcesIcon}
                alt="Safety"
                className="h-5 w-5 object-contain"
              />

              <span>Safety Support & Our Community</span>
            </button>

            {/* Change Channels */}
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
            >
              <img
                src={ChangeChannelsIcon}
                alt="Change Channels"
                className="h-5 w-5 object-contain"
              />

              <span>Change Channels</span>
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onSettingsClick?.();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
            >
              <img
                src={SettingsIcon}
                alt="Settings"
                className="h-5 w-5 object-contain"
              />

              <span>Settings</span>
            </button>

            {/* Sign Out */}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/10"
            >
              <img
                src={SignOutIcon}
                alt="Sign Out"
                className="h-5 w-5 object-contain"
              />

              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;
