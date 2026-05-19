import React from "react";
import ComingSoonPAGES from "../components/ComingSoonMENU";

type ChangeChannelsProps = {
  setPageHome: () => void;
};

const ChangeChannels: React.FC<ChangeChannelsProps> = ({
  setPageHome,
}) => {
  return (
    <ComingSoonPAGES
      title="Change Channels coming soooon HEHE"
      onBack={setPageHome}
    />
  );
};

export default ChangeChannels;