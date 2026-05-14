import React from "react";
import ComingSoonPAGES from "../components/ComingSoonPAGES";

type PauseAccountProps = {
  onBack: () => void;
};

const PauseAccount: React.FC<PauseAccountProps> = ({
  onBack,
}) => {
  return (
    <ComingSoonPAGES
      title="HEHEHE COMING SOON"
      onBack={onBack}
    />
  );
};

export default PauseAccount;