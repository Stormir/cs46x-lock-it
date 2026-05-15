import React from "react";
import ComingSoonPAGES from "../components/ComingSoonPAGES";

type PrivacyPolicyProps = {
  onBack: () => void;
};

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  onBack,
}) => {
  return (
    <ComingSoonPAGES
      title="HEHEHE COMING SOON"
      onBack={onBack}
    />
  );
};

export default PrivacyPolicy;