import React from "react";
import ComingSoonPAGES from "../components/ComingSoonMENU";

type SafetySupportAndCommunityProps = {
  setPageHome: () => void;
};

const SafetySupportAndCommunity: React.FC<SafetySupportAndCommunityProps> = ({
  setPageHome,
}) => {
  return (
    <ComingSoonPAGES
      title="Safety Support & Our Community coming soooon HEHE"
      onBack={setPageHome}
    />
  );
};

export default SafetySupportAndCommunity;