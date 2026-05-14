import React from "react";
import Home from "./pages/Home.tsx";
import Landing from "./pages/Landing.tsx";
import Settings from "./pages/Settings";
import { useSession } from "./api/useSession";
import assert from "./utils/assert.tsx";
import VerifyTest from "./pages/VerifyTest.tsx";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile.tsx";
//settings page
import CookiePolicy from "./pages/CookiePolicy.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import HelpTechSup from "./pages/HelpTechSup.tsx";
import SafetySupport from "./pages/SafetySupport.tsx";
import PauseAccount from "./pages/PauseAccount.tsx";
import DeactivateAccount from "./pages/DeactivateAccount.tsx";

type PageEnum =
  | "Home"
  | "Landing"
  | "VerifyTest"
  | "Settings"
  | "CookiePolicy"
  | "PrivacyPolicy"
  | "HelpTechSup"
  | "SafetySupport"
  | "PauseAccount"
  | "DeactivateAccount"
  | "ResetPassword"
  | "Profile";

const App = () => {
  // TEMPORARY: open directly to Settings page
  const [page, setPage] = React.useState<PageEnum>("Settings");

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
      />
  );
  case "VerifyTest":
    return (
      <VerifyTest
        onBack={() => setPage("Home")}
      />
  );

  case "ResetPassword":
    return <ResetPassword setPageLanding={() => setPage("Landing")} />;
  
  case "Landing":
    return <Landing setPageHome={() => setPage("Home")} />;

  case "Profile":
    return (
     <Profile
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

          onHelpTechSup={() => setPage("HelpTechSup")}
          onSafetySupport={() => setPage("SafetySupport")}

          onPauseAccount={() => setPage("PauseAccount")}
          onDeactivateAccount={() => setPage("DeactivateAccount")}
        />
      );

    case "CookiePolicy":
      return <CookiePolicy onBack={() => setPage("Settings")} />;

    case "PrivacyPolicy":
      return <PrivacyPolicy onBack={() => setPage("Settings")} />;

    case "HelpTechSup":
      return <HelpTechSup onBack={() => setPage("Settings")} />;

    case "SafetySupport":
      return <SafetySupport onBack={() => setPage("Settings")} />;

    case "PauseAccount":
      return <PauseAccount onBack={() => setPage("Settings")} />;

    case "DeactivateAccount":
      return <DeactivateAccount onBack={() => setPage("Settings")} />;

    default:
      return assert.never(page);
  }

};

export default App;