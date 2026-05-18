import React from "react";
import ComingSoonPAGES from "../components/ComingSoonPAGES";

type ViewYourMatchesProps = {
  setPageHome: () => void;
};

const ViewYourMatches: React.FC<ViewYourMatchesProps> = ({
  setPageHome,
}) => {
  return (
    <ComingSoonPAGES
      title="View Your Matches coming soooon HEHE"
      onBack={setPageHome}
    />
  );
};

export default ViewYourMatches;