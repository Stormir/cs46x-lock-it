import React from "react";
import ComingSoonPAGES from "../components/ComingSoonPAGES";

type HelpTechSupProps = {
  onBack: () => void;
};

const HelpTechSup: React.FC<HelpTechSupProps> = ({
  onBack,
}) => {
  return (
    <ComingSoonPAGES
      title="HEHEHE COMING SOON"
      onBack={onBack}
    />
  );
};

export default HelpTechSup;