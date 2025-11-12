import React from "react";

import ModalRegister from "../components/ModalRegister";
import ModalSignIn from "../components/ModalSignIn";

import assert from "../utils/assert";

interface LandingProps {
  setPageHome: () => void;
}

type ViewEnum = "None" | "Register" | "SignIn";

const Landing: React.FC<LandingProps> = ({ setPageHome }) => {
  const [view, setView] = React.useState<ViewEnum>("None");

  const setViewNone = () => setView("None");

  return (
    <>
      <header>
        <h1>Glimmr</h1>
      </header>
      <main>
        <h2></h2>
        <section>
          <button onClick={() => setView("SignIn")} type="button">
            Sign In
          </button>
          <button onClick={() => setView("Register")} type="button">
            Register
          </button>
        </section>
      </main>
      {(() => {
        switch (view) {
          case "None":
            return null;
          case "Register":
            return (
              <ModalRegister
                setPageHome={setPageHome}
                setViewNone={setViewNone}
              />
            );
          case "SignIn":
            return (
              <ModalSignIn
                setPageHome={setPageHome}
                setViewNone={setViewNone}
              />
            );
          default:
            return assert.never(view);
        }
      })()}
    </>
  );
};

export default Landing;
