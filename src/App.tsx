import React from "react";

import Home from "./pages/Home.tsx";
import Landing from "./pages/Landing.tsx";

import assert from "./utils/assert.tsx";

type PageEnum = "Home" | "Landing";

const App = () => {
  const [page, setPage] = React.useState<PageEnum>("Landing");

  switch (page) {
    case "Home":
      return <Home setPageLanding={() => setPage("Landing")} />;
    case "Landing":
      return <Landing setPageHome={() => setPage("Home")} />;
    default:
      return assert.never(page);
  }
};

export default App;
