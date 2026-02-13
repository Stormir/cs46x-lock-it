import React from "react";

import ModalRegister from "../components/ModalRegister";
import ModalSignIn from "../components/ModalSignIn";
import { ComingSoon } from "../components/ComingSoon";
import Locket from "../assets/logo/lockit-locket.svg";

import assert from "../utils/assert";

interface LandingProps {
  setPageHome: () => void;
}

type ViewEnum = "None" | "Register" | "SignIn";

const Landing: React.FC<LandingProps> = ({ setPageHome }) => {
  const [view, setView] = React.useState<ViewEnum>("None");

  const setViewNone = () => setView("None");

  return (
    <div 
      className="min-h-screen w-full bg-[#382543] flex flex-col items-center justify-center px-6" 
 
    >
      {/* Logo and Title area */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="flex items-center">
          
          <h1
            className="text-[64px] font-bold leading-none"
            style={{ fontFamily: "Nunito, system-ui, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-[#F3BBC8] to-[#A84887] bg-clip-text text-transparent">
              l
            </span>

            {/* Using the Locekt as the “o” */}
            <span className="inline-flex align-middle mx-[-4px]">
              <img
                src={Locket}
                alt="o"
                className="h-[50px] w-[50px]"
              />
            </span>

            <span className="bg-gradient-to-r from-[#F3BBC8] to-[#A84887] bg-clip-text text-transparent">
              ck it
            </span>
          </h1>
      </div>
    </div>

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <button
          onClick={() => setView("SignIn")}
          type="button"
          className="w-full rounded-full bg-white text-[#382543] py-2 font-medium shadow-sm"
        >
          Log in
        </button>

        <button
          onClick={() => setView("Register")}
          type="button"
          className="w-full rounded-full bg-white text-[#382543] py-2 font-medium shadow-sm"
        >
          Sign up
        </button>

        {/* Need help? placeholder */}
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            disabled
            className="text-white/70 text-sm underline cursor-not-allowed"
          >
            need help?
          </button>
          <ComingSoon />
        </div>
      </div>

      {/* Modal routing */}
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
    </div>
  );
};

export default Landing;
