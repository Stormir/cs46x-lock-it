import React from "react";

import Home from "./pages/Home.tsx";
import Landing from "./pages/Landing.tsx";

import { useSession } from "./api/useSession"; 
import assert from "./utils/assert.tsx";
import VerifyTest from "./pages/VerifyTest.tsx";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile.tsx";


type PageEnum = "Home" | "Landing" | "VerifyTest" | "ResetPassword" | "Profile";

const App = () => {
  const [page, setPage] = React.useState<PageEnum>("Landing");
  
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
  
  default:
      return assert.never(page);
  
}

};

export default App;
