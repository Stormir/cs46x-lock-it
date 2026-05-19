import React from "react";
import ComingSoonPAGES from "../components/ComingSoonMENU";

type EditPreferencesProps = {
  setPageHome: () => void;
};

const EditPreferences: React.FC<EditPreferencesProps> = ({
  setPageHome,
}) => {
  return (
    <ComingSoonPAGES
      title="Edit Preferences coming soooon HEHE"
      onBack={setPageHome}
    />
  );
};

export default EditPreferences;