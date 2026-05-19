import React from "react";
import ComingSoonPAGES from "../components/ComingSoonMENU";

type SafetySupportAndCommunityProps = {
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

const SafetySupportAndCommunity: React.FC<SafetySupportAndCommunityProps> = ({
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
      title="Safety Support & Our Community coming soooon HEHE"
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

export default SafetySupportAndCommunity;