import React from "react";
import ComingSoonPAGES from "../components/ComingSoonPAGES";

type PrivacyPreferencesProps = {
    onBack: () => void;
  };

  const PrivacyPreferencesPolicy: React.FC<PrivacyPreferencesProps> = ({
    onBack,
  }) => {
    return (
      <ComingSoonPAGES
        title="HEHEHE COMING SOON"
        onBack={onBack}
      />
    );
  };
  
  export default PrivacyPreferencesPolicy;