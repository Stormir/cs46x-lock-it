import React from "react";
import ComingSoonPAGES from "../components/ComingSoonMENU";

type EditPreferencesProps = {
  setPageHome: () => void;
  setPageSettings: () => void;
  setPageDateTracking: () => void;
  setPageProfile: () => void;
  setPageViewYourMatches: () => void;
  setPageMatchMessages: () => void;
  setPageEditPreferences: () => void;
  setPageSafetySupportAndCommunity: () => void;
  setPageChangeChannels: () => void;
};

const EditPreferences: React.FC<EditPreferencesProps> = ({
  setPageHome,
  setPageSettings,
  setPageDateTracking,
  setPageProfile,
  setPageViewYourMatches,
  setPageMatchMessages,
  setPageEditPreferences,
  setPageSafetySupportAndCommunity,
  setPageChangeChannels,
}) => {
  return (
    <ComingSoonPAGES
      title="Edit Preferences coming soooon HEHE"
      onBack={setPageHome}
      setPageHome={setPageHome}
      setPageSettings={setPageSettings}
      setPageDateTracking={setPageDateTracking}
      setPageProfile={setPageProfile}
      setPageViewYourMatches={setPageViewYourMatches}
      setPageMatchMessages={setPageMatchMessages}
      setPageEditPreferences={setPageEditPreferences}
      setPageSafetySupportAndCommunity={setPageSafetySupportAndCommunity}
      setPageChangeChannels={setPageChangeChannels}
    />
  );
};

export default EditPreferences;