import React from "react";

import Home from "./pages/Home.tsx";
import Landing from "./pages/Landing.tsx";

import { useSession } from "./api/useSession"; 
import assert from "./utils/assert.tsx";
import VerifyTest from "./pages/VerifyTest.tsx";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import ViewProfile from "./pages/ViewProfile.tsx";
import Matches from "./pages/Matches.tsx";

type PageEnum =
  | "Home"
  | "Landing"
  | "VerifyTest"
  | "ResetPassword"
  | "Profile"
  | "EditProfile"
  | "ViewProfile"
  | "Matches";
  

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
        setPageVerifyTest={() => setPage("VerifyTest")}
        setPageProfile={() => setPage("Profile")}
        setPageMatches={() => setPage("Matches")}
        openViewProfile={openViewProfile}
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
          setPageEditProfile={() => setPage("EditProfile")}
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
        openViewProfile={openViewProfile}
      />
    );

  case "ViewProfile":
    if (!selectedProfileId) {
      return (
        <Home
          setPageLanding={() => setPage("Landing")}
          setPageVerifyTest={() => setPage("VerifyTest")}
          setPageProfile={() => setPage("Profile")}
          openViewProfile={openViewProfile}
        />
      );
    }

    return (
      <ViewProfile
        profileId={selectedProfileId}
        setPageHome={() => setPage("Home")}
      />
    );
  
  default:
      return assert.never(page);
  
}

};

export default App;
