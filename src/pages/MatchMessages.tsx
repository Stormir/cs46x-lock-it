import React from "react";
import ComingSoonPAGES from "../components/ComingSoonPAGES";

type MatchMessagesProps = {
  setPageHome: () => void;
};

const MatchMessages: React.FC<MatchMessagesProps> = ({
  setPageHome,
}) => {
  return (
    <ComingSoonPAGES
      title="Match Messages coming soooon HEHE"
      onBack={setPageHome}
    />
  );
};

export default MatchMessages;