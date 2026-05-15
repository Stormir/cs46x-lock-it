import React from "react";
import ComingSoonPAGES from "../components/ComingSoonPAGES";

type DeactivateAccountProps = {
  onBack: () => void;
};

const DeactivateAccount: React.FC<DeactivateAccountProps> = ({
  onBack,
}) => {
  return (
    <ComingSoonPAGES
      title="HEHEHE COMING SOON"
      onBack={onBack}
    />
  );
};

export default DeactivateAccount;