import React from "react";

import Home from "./pages/Home.tsx";
import Landing from "./pages/Landing.tsx";

import { useSession } from "./api/useSession"; 
import assert from "./utils/assert.tsx";
import VerifyTest from "./pages/VerifyTest.tsx";

type PageEnum = "Home" | "Landing" | "VerifyTest";

const App = () => {
  const [page, setPage] = React.useState<PageEnum>("Landing");
  
  // Supabase session tracking
  const { session, loading } = useSession();

  React.useEffect(() => {
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
      />
    );
  case "VerifyTest":
    return (
      <VerifyTest
        onBack={() => setPage("Home")}
      />
    );
  case "Landing":
    return <Landing setPageHome={() => setPage("Home")} />;
  default:
    return assert.never(page);
}

};

export default App;
