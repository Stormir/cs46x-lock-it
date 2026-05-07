import React from "react";
import ComingSoonPAGES from "../components/ComingSoonPAGES";

type SafetySupportProps = {
  onBack: () => void;
};

const SafetySupport: React.FC<SafetySupportProps> = ({
  onBack,
}) => {
  return (
    <ComingSoonPAGES
      title="HEHEHE COMING SOON"
      onBack={onBack}
    />
  );
};

export default SafetySupport;