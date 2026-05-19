import React from "react";
import Home from "./pages/Home.tsx";
import Landing from "./pages/Landing.tsx";
import Settings from "./pages/Settings";
import { useSession } from "./api/useSession";
import assert from "./utils/assert.tsx";
import DateTracking from "./pages/DateTracking";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import ViewProfile from "./pages/ViewProfile.tsx";
import Matches from "./pages/Matches.tsx";
import MatchMessages from "./pages/MatchMessages.tsx";
import EditPreferences from "./pages/EditPreferences.tsx";
import SafetySupportAndCommunity from "./pages/SafetySupportAndCommunity.tsx";
import ChangeChannels from "./pages/ChangeChannels.tsx";
//settings page
import CookiePolicy from "./pages/CookiePolicy.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import HelpTechSup from "./pages/HelpTechSup.tsx";
import SafetySupport from "./pages/SafetySupport.tsx";
import PauseAccount from "./pages/PauseAccount.tsx";
import DeactivateAccount from "./pages/DeactivateAccount.tsx";
import PrivacyPreferences from "./pages/PrivacyPreferences.tsx";
import VerifyTest from "./pages/VerifyTest.tsx";


type PageEnum =
  | "Home"
  | "Landing"
  | "VerifyTest"
  | "ResetPassword"
  | "Profile"
  | "EditProfile"
  | "ViewProfile"
  | "Matches"
  | "MatchMessages"
  | "Settings"
  | "CookiePolicy"
  | "PrivacyPolicy"
  | "HelpTechSup"
  | "SafetySupport"
  | "PauseAccount"
  | "DeactivateAccount"
  | "PrivacyPreferences"
  | "DateTracking"
  | "EditPreferences"
  | "SafetySupportAndCommunity"
  | "ChangeChannels";

const App = () => {
  const [page, setPage] = React.useState<PageEnum>("Landing");
  // stores ID of person whose profile is clicked
  const [selectedProfileId, setSelectedProfileId] = React.useState<string | null>(null);

  // sets ID and switches the app to new ViewProfile page
  const openViewProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    setPage("ViewProfile");
  };
  
  // Supabase session tracking
  const { session, loading } = useSession();

  // Adds reset-password path 
  React.useEffect(() => {
    if (window.location.pathname.includes("reset-password")) {
      setPage("ResetPassword");
    }
  }, []);

  React.useEffect(() => {

  if (page === "ResetPassword") return; 
  // dont redirect duirng reset flow 
  if (session && page === "Landing") {
    setPage("Home");
  } else if (!session && page !== "Landing") {
  setPage("Landing");
  }
}, [session, page]);

  if (loading) return <p>Loading...</p>;

  switch (page) {
  case "Home":
    return (
      <Home
        setPageLanding={() => setPage("Landing")}
        setPageSettings={() => setPage("Settings")}
        setPageProfile={() => setPage("Profile")}
        setPageDateTracking={() => setPage("DateTracking")}
        setPageMatches={() => setPage("Matches")}
        openViewProfile={openViewProfile}
        setPageMatchMessages={() => setPage("MatchMessages")}
        setPageEditPreferences={() => setPage("EditPreferences")}
        setPageSafetySupportAndCommunity={() => setPage("SafetySupportAndCommunity")}
        setPageChangeChannels={() => setPage("ChangeChannels")}
      />
  );

  case "ResetPassword":
    return <ResetPassword setPageLanding={() => setPage("Landing")} />;

  case "Profile":
      return (
        <Profile
          setPageHome={() => setPage("Home")}
          setPageEditProfile={() => setPage("EditProfile")}
          setPageSettings={() => setPage("Settings")}
          setPageDateTracking={() => setPage("DateTracking")}
          setPageMatches={() => setPage("Matches")}
          setPageMatchMessages={() => setPage("MatchMessages")}
          setPageEditPreferences={() => setPage("EditPreferences")}
          setPageSafetySupportAndCommunity={() => setPage("SafetySupportAndCommunity")}
          setPageChangeChannels={() => setPage("ChangeChannels")}
        />
      );

  case "EditProfile":
      return (
        <EditProfile
          setPageProfile={() => setPage("Profile")}
        />
      );
  case "Matches":
    return (
      <Matches
        setPageHome={() => setPage("Home")}
        setPageSettings={() => setPage("Settings")}
        setPageDateTracking={() => setPage("DateTracking")}
        setPageProfile={() => setPage("Profile")}
        setPageMatches={() => setPage("Matches")}
        setPageMatchMessages={() => setPage("MatchMessages")}
        setPageEditPreferences={() => setPage("EditPreferences")}
        setPageSafetySupportAndCommunity={() => setPage("SafetySupportAndCommunity")}
        setPageChangeChannels={() => setPage("ChangeChannels")}
        openViewProfile={openViewProfile}
      />
    );

  case "MatchMessages":
    return (
      <MatchMessages
        setPageHome={() => setPage("Home")}
        setPageSettings={() => setPage("Settings")}
        setPageDateTracking={() => setPage("DateTracking")}
        setPageProfile={() => setPage("Profile")}
        setPageMatches={() => setPage("Matches")}
        setPageMatchMessages={() => setPage("MatchMessages")}
        setPageEditPreferences={() => setPage("EditPreferences")}
        setPageSafetySupportAndCommunity={() => setPage("SafetySupportAndCommunity")}
        setPageChangeChannels={() => setPage("ChangeChannels")}
      />
    );

  case "ViewProfile":
    if (!selectedProfileId) {
      return (
        <Home
          setPageLanding={() => setPage("Landing")}
          setPageSettings={() => setPage("Settings")}
          setPageProfile={() => setPage("Profile")}
          setPageMatches={() => setPage("Matches")}
          setPageDateTracking={() => setPage("DateTracking")}
          setPageMatchMessages={() => setPage("MatchMessages")}

          setPageEditPreferences={() => setPage("EditPreferences")}
          setPageSafetySupportAndCommunity={() => setPage("SafetySupportAndCommunity")}
          setPageChangeChannels={() => setPage("ChangeChannels")}

          openViewProfile={(profileId: string) => {
            setSelectedProfileId(profileId);
            setPage("ViewProfile");
          }}
        />
      );
    }

    return (
      <ViewProfile
        profileId={selectedProfileId}
        setPageHome={() => setPage("Home")}
      />
    );
  
  case "VerifyTest":
      return <VerifyTest onBack={() => setPage("Home")} />;

    case "Landing":
      return <Landing setPageHome={() => setPage("Home")} />;

    case "Settings":
      return (
        <Settings
          onBack={() => setPage("Home")}
          onVerifyTest={() => setPage("VerifyTest")}
          onCookiePolicy={() => setPage("CookiePolicy")}
          onPrivacyPolicy={() => setPage("PrivacyPolicy")}
          onPrivacyPreferences={() => setPage("PrivacyPreferences")}
          onHelpTechSup={() => setPage("HelpTechSup")}
          onSafetySupport={() => setPage("SafetySupport")}
          onPauseAccount={() => setPage("PauseAccount")}
          onDeactivateAccount={() => setPage("DeactivateAccount")}
          onDateTracking={() => setPage("DateTracking")}
          
        />
      );

    case "CookiePolicy":
      return <CookiePolicy onBack={() => setPage("Settings")} />;

    case "PrivacyPolicy":
      return <PrivacyPolicy onBack={() => setPage("Settings")} />;

    case "PrivacyPreferences":
      return <PrivacyPreferences onBack={() => setPage("Settings")} />;

    case "HelpTechSup":
      return <HelpTechSup onBack={() => setPage("Settings")} />;

    case "SafetySupport":
      return <SafetySupport onBack={() => setPage("Settings")} />;

    case "PauseAccount":
      return <PauseAccount onBack={() => setPage("Settings")} />;

    case "DeactivateAccount":
      return <DeactivateAccount onBack={() => setPage("Settings")} />;

    case "DateTracking":
      return (
        <DateTracking
          setPageHome={() => setPage("Home")}
          setPageSettings={() => setPage("Settings")}
          setPageDateTracking={() => setPage("DateTracking")}
          setPageProfile={() => setPage("Profile")}
          setPageMatches={() => setPage("Matches")}
          setPageMatchMessages={() => setPage("MatchMessages")}
          setPageEditPreferences={() => setPage("EditPreferences")}
          setPageSafetySupportAndCommunity={() => setPage("SafetySupportAndCommunity")}
          setPageChangeChannels={() => setPage("ChangeChannels")}
    />
      )
    case "EditPreferences":
      return (
        <EditPreferences
          setPageHome={() => setPage("Home")}
          setPageSettings={() => setPage("Settings")}
          setPageDateTracking={() => setPage("DateTracking")}
          setPageProfile={() => setPage("Profile")}
          setPageMatches={() => setPage("Matches")}
          setPageMatchMessages={() => setPage("MatchMessages")}
          setPageEditPreferences={() => setPage("EditPreferences")}
          setPageSafetySupportAndCommunity={() => setPage("SafetySupportAndCommunity")}
          setPageChangeChannels={() => setPage("ChangeChannels")}
        />
      );

    case "SafetySupportAndCommunity":
      return (
        <SafetySupportAndCommunity
          setPageHome={() => setPage("Home")}
          setPageSettings={() => setPage("Settings")}
          setPageDateTracking={() => setPage("DateTracking")}
          setPageProfile={() => setPage("Profile")}
          setPageMatchMessages={() => setPage("MatchMessages")}
          setPageMatches={() => setPage("Matches")}
          setPageEditPreferences={() => setPage("EditPreferences")}
          setPageSafetySupportAndCommunity={() => setPage("SafetySupportAndCommunity")}
          setPageChangeChannels={() => setPage("ChangeChannels")}
        />
      );

    case "ChangeChannels":
      return (
        <ChangeChannels
          setPageHome={() => setPage("Home")}
          setPageSettings={() => setPage("Settings")}
          setPageDateTracking={() => setPage("DateTracking")}
          setPageProfile={() => setPage("Profile")}
          setPageMatchMessages={() => setPage("MatchMessages")}
          setPageMatches={() => setPage("Matches")}
          setPageEditPreferences={() => setPage("EditPreferences")}
          setPageSafetySupportAndCommunity={() => setPage("SafetySupportAndCommunity")}
          setPageChangeChannels={() => setPage("ChangeChannels")}
        />
      );
    default:
      return assert.never(page);
  }

};

export default App;